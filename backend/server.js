import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeSearch, generateMockResults, JOB_SITES, STATUS_KEYWORDS, SKILL_SUGGESTIONS, buildSearchQuery } from './scraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'jobs.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    url TEXT UNIQUE,
    source TEXT,
    description TEXT,
    posted_date TEXT,
    status TEXT DEFAULT 'open',
    search_query TEXT,
    matched_skills TEXT,
    relevance_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize Redis (optional - will work without it)
let redis = null;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true
  });
  redis.on('error', (err) => {
    console.log('Redis connection error (caching disabled):', err.message);
    redis = null;
  });
  await redis.connect().catch(() => {
    console.log('Redis not available - caching disabled');
    redis = null;
  });
} catch (err) {
  console.log('Redis not available - caching disabled');
  redis = null;
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 60
});
app.use('/api/', limiter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
}

// ===========================================
// API ROUTES
// ===========================================

// Get all jobs
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
    const parsed = jobs.map(job => ({
      ...job,
      matched_skills: job.matched_skills ? JSON.parse(job.matched_skills) : []
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for jobs
app.post('/api/jobs/search', async (req, res) => {
  try {
    const { sites, roles, statuses, skills, location, useMock } = req.body;

    // Check cache first
    const cacheKey = `search:${JSON.stringify(req.body)}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    let jobs;
    if (useMock || !process.env.SERP_API_KEY) {
      // Use mock data if no API key or mock requested
      jobs = generateMockResults({ sites, roles, statuses, skills });
    } else {
      jobs = await executeSearch({ sites, roles, statuses, skills, location });
    }

    // Save jobs to database
    const insert = db.prepare(`
      INSERT OR REPLACE INTO jobs (id, title, company, location, url, source, description, posted_date, status, search_query, matched_skills, relevance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const savedJobs = jobs.map(job => {
      const id = uuidv4();
      insert.run(
        id,
        job.title,
        job.company,
        job.location,
        job.url,
        job.source,
        job.description,
        job.posted_date,
        job.status,
        job.search_query,
        JSON.stringify(job.matched_skills || []),
        job.relevance_score
      );
      return { ...job, id };
    });

    const result = {
      jobs: savedJobs,
      query: buildSearchQuery({ sites, roles, statuses, skills, location }),
      total: savedJobs.length
    };

    // Cache results for 5 minutes
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    }

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update job status
app.patch('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    db.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      ...job,
      matched_skills: job.matched_skills ? JSON.parse(job.matched_skills) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get metadata (sites, statuses, skill suggestions)
app.get('/api/metadata', (req, res) => {
  res.json({
    sites: Object.values(JOB_SITES),
    statuses: Object.keys(STATUS_KEYWORDS),
    skillSuggestions: SKILL_SUGGESTIONS
  });
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count;
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM jobs GROUP BY status').all();
    const bySource = db.prepare('SELECT source, COUNT(*) as count FROM jobs GROUP BY source').all();

    res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, r.count])),
      bySource: Object.fromEntries(bySource.map(r => [r.source, r.count]))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Redis: ${redis ? 'Connected' : 'Disabled'}`);
  console.log(`🔑 SerpAPI: ${process.env.SERP_API_KEY ? 'Configured' : 'Not configured (using mock data)'}`);
});
