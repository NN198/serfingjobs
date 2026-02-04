import { getJson } from 'serpapi';
import dotenv from 'dotenv';

dotenv.config();

// ===========================================
// SUPPORTED JOB SITES
// ===========================================

export const JOB_SITES = {
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    domain: 'greenhouse.io',
    urlPattern: /greenhouse\.io/,
    color: '#3AB549'
  },
  lever: {
    id: 'lever',
    name: 'Lever',
    domain: 'jobs.lever.co',
    urlPattern: /lever\.co/,
    color: '#7C3AED'
  },
  smartrecruiters: {
    id: 'smartrecruiters',
    name: 'SmartRecruiters',
    domain: 'jobs.smartrecruiters.com',
    urlPattern: /smartrecruiters\.com/,
    color: '#FF6B35'
  },
  workday: {
    id: 'workday',
    name: 'Workday',
    domain: 'wd1.myworkdayjobs.com',
    urlPattern: /myworkdayjobs\.com/,
    color: '#0075C9'
  },
  bamboohr: {
    id: 'bamboohr',
    name: 'BambooHR',
    domain: 'jobs.bamboohr.com',
    urlPattern: /bamboohr\.com/,
    color: '#73C41D'
  },
  jobvite: {
    id: 'jobvite',
    name: 'Jobvite',
    domain: 'jobs.jobvite.com',
    urlPattern: /jobvite\.com/,
    color: '#E31937'
  },
  icims: {
    id: 'icims',
    name: 'iCIMS',
    domain: 'careers.icims.com',
    urlPattern: /icims\.com/,
    color: '#00A4BD'
  },
  jazz: {
    id: 'jazz',
    name: 'JazzHR',
    domain: 'apply.jazz.co',
    urlPattern: /jazz\.co/,
    color: '#6366F1'
  },
  workable: {
    id: 'workable',
    name: 'Workable',
    domain: 'careers.workable.com',
    urlPattern: /workable\.com/,
    color: '#00756A'
  }
};

// ===========================================
// STATUS KEYWORDS
// ===========================================

export const STATUS_KEYWORDS = {
  hiring: ['hiring', 'we\'re hiring', 'now hiring'],
  apply: ['apply', 'apply now', 'submit application'],
  open: ['open role', 'open position', 'job opening'],
  remote: ['remote', 'work from home', 'distributed'],
  urgent: ['urgent', 'immediate', 'asap']
};

// ===========================================
// COMMON SKILLS/AREAS OF INTEREST
// ===========================================

export const SKILL_SUGGESTIONS = {
  engineering: ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Kubernetes', 'Docker', 'Go', 'Rust', 'Java', 'C++', 'SQL', 'GraphQL', 'REST API'],
  data: ['Machine Learning', 'Data Science', 'Analytics', 'SQL', 'Python', 'TensorFlow', 'PyTorch', 'Spark', 'Tableau', 'Power BI', 'ETL', 'Data Engineering'],
  design: ['Figma', 'UI/UX', 'Product Design', 'User Research', 'Prototyping', 'Design Systems', 'Adobe Creative Suite', 'Sketch'],
  product: ['Agile', 'Scrum', 'Product Management', 'Roadmapping', 'A/B Testing', 'User Stories', 'JIRA', 'Analytics'],
  marketing: ['SEO', 'Content Marketing', 'Social Media', 'Google Ads', 'Email Marketing', 'HubSpot', 'Salesforce', 'Analytics'],
  sales: ['B2B', 'SaaS', 'CRM', 'Salesforce', 'Lead Generation', 'Account Management', 'Enterprise Sales', 'SDR']
};

// ===========================================
// QUERY BUILDER
// ===========================================

/**
 * Build a Google search query from parameters
 * 
 * Basic query example:
 * site:greenhouse.io AND ("software engineer" OR "solutions consultant") AND ("hiring" OR "apply")
 * 
 * Advanced query with skills:
 * site:greenhouse.io AND ("software engineer") AND ("Python" OR "React" OR "AWS")
 */
export function buildSearchQuery({ sites, roles, statuses, skills, location }) {
  const parts = [];

  // Site restriction - if multiple sites, we need to OR them
  if (sites && sites.length > 0) {
    const siteQueries = sites.map(siteId => {
      const site = JOB_SITES[siteId];
      return site ? `site:${site.domain}` : null;
    }).filter(Boolean);
    
    if (siteQueries.length > 1) {
      parts.push(`(${siteQueries.join(' OR ')})`);
    } else if (siteQueries.length === 1) {
      parts.push(siteQueries[0]);
    }
  }

  // Role queries - wrap each in quotes for exact phrase matching
  if (roles && roles.length > 0) {
    const roleQueries = roles.map(role => `"${role.toLowerCase().trim()}"`);
    if (roleQueries.length > 1) {
      parts.push(`(${roleQueries.join(' OR ')})`);
    } else {
      parts.push(roleQueries[0]);
    }
  }

  // Skills/Areas of interest (Advanced Search)
  if (skills && skills.length > 0) {
    const skillQueries = skills.map(skill => `"${skill.trim()}"`);
    if (skillQueries.length > 1) {
      parts.push(`(${skillQueries.join(' OR ')})`);
    } else {
      parts.push(skillQueries[0]);
    }
  }

  // Location filter
  if (location && location.trim()) {
    parts.push(`"${location.trim()}"`);
  }

  // Status queries
  if (statuses && statuses.length > 0) {
    const statusQueries = statuses.flatMap(status => {
      const keywords = STATUS_KEYWORDS[status];
      return keywords ? keywords.map(k => `"${k}"`) : [`"${status}"`];
    });
    if (statusQueries.length > 1) {
      parts.push(`(${statusQueries.join(' OR ')})`);
    } else if (statusQueries.length === 1) {
      parts.push(statusQueries[0]);
    }
  }

  // Combine all clauses with AND
  return parts.filter(Boolean).join(' AND ');
}

// ===========================================
// SEARCH EXECUTION
// ===========================================

/**
 * Execute search using SerpAPI
 */
export async function executeSearch({ sites, roles, statuses, skills, location, maxResults = 30 }) {
  const apiKey = process.env.SERP_API_KEY;
  
  if (!apiKey) {
    throw new Error('SERP_API_KEY is not configured. Add it to your .env file.');
  }

  const query = buildSearchQuery({ sites, roles, statuses, skills, location });
  console.log('🔍 Executing search:', query);

  try {
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: Math.min(maxResults, 100), // Google max is 100
      gl: 'us', // Geographic location
      hl: 'en'  // Language
    });

    if (!response.organic_results) {
      console.log('No results found');
      return [];
    }

    // Transform results to our job format
    const jobs = response.organic_results.map(result => transformSearchResult(result, { sites, roles, statuses, skills, query }));
    
    console.log(`✅ Found ${jobs.length} results`);
    return jobs;

  } catch (error) {
    console.error('SerpAPI error:', error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Transform a SerpAPI result to our job schema
 */
function transformSearchResult(result, searchContext) {
  // Detect which source this came from
  const source = detectSource(result.link);
  
  // Extract company name from URL or title
  const company = extractCompany(result, source);
  
  // Parse date if available
  const postedDate = result.date || null;

  return {
    title: cleanTitle(result.title),
    company: company,
    location: extractLocation(result.snippet),
    url: result.link,
    source: source,
    description: result.snippet,
    posted_date: postedDate,
    status: 'open',
    search_query: searchContext.query,
    matched_skills: searchContext.skills || [],
    relevance_score: 0 // Will be calculated by relevance service
  };
}

/**
 * Detect which job site this result came from
 */
function detectSource(url) {
  for (const [id, site] of Object.entries(JOB_SITES)) {
    if (site.urlPattern.test(url)) {
      return id;
    }
  }
  return 'other';
}

/**
 * Extract company name from result
 */
function extractCompany(result, source) {
  // Try to extract from URL for known patterns
  const url = result.link;
  
  if (source === 'greenhouse') {
    // boards.greenhouse.io/companyname/jobs/123
    const match = url.match(/greenhouse\.io\/([^\/]+)/);
    if (match) return formatCompanyName(match[1]);
  }
  
  if (source === 'lever') {
    // jobs.lever.co/companyname/123
    const match = url.match(/lever\.co\/([^\/]+)/);
    if (match) return formatCompanyName(match[1]);
  }

  if (source === 'smartrecruiters') {
    const match = url.match(/smartrecruiters\.com\/([^\/]+)/);
    if (match) return formatCompanyName(match[1]);
  }

  if (source === 'bamboohr') {
    const match = url.match(/([^\/]+)\.bamboohr\.com/);
    if (match) return formatCompanyName(match[1]);
  }

  if (source === 'workable') {
    const match = url.match(/([^\/]+)\.workable\.com/);
    if (match) return formatCompanyName(match[1]);
  }

  // Try to extract from title (often "Role at Company")
  const titleMatch = result.title.match(/at\s+([^|–-]+)/i);
  if (titleMatch) return titleMatch[1].trim();

  return null;
}

/**
 * Format company name from URL slug
 */
function formatCompanyName(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Clean up job title
 */
function cleanTitle(title) {
  // Remove common suffixes
  return title
    .replace(/\s*[-|–]\s*(Greenhouse|Lever|LinkedIn|Workday|SmartRecruiters|BambooHR|Jobvite|iCIMS|JazzHR|Workable).*$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();
}

/**
 * Try to extract location from snippet
 */
function extractLocation(snippet) {
  if (!snippet) return null;
  
  // Common patterns
  const patterns = [
    /(?:location|based in|located in)[:\s]+([^.]+)/i,
    /\b(remote|hybrid|on-site|onsite)\b/i,
    /\b([A-Z][a-z]+,\s*[A-Z]{2})\b/, // City, State
    /\b(San Francisco|New York|Los Angeles|Seattle|Austin|Boston|Chicago|Denver|Miami|London|Berlin|Toronto|Singapore)\b/i
  ];

  for (const pattern of patterns) {
    const match = snippet.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

// ===========================================
// MOCK DATA FOR DEVELOPMENT
// ===========================================

/**
 * Generate mock results for development/testing without API key
 */
export function generateMockResults({ sites, roles, statuses, skills }) {
  const mockJobs = [];
  const companies = ['Acme Corp', 'TechStart', 'DataFlow', 'CloudNine', 'AIVentures', 'StartupXYZ', 'MegaTech', 'InnovateCo'];
  const locations = ['San Francisco, CA', 'Remote', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Hybrid'];

  const numResults = Math.floor(Math.random() * 10) + 8; // 8-17 results

  for (let i = 0; i < numResults; i++) {
    const site = sites[Math.floor(Math.random() * sites.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const siteInfo = JOB_SITES[site];
    
    // Randomly add seniority levels
    const levels = ['', 'Senior ', 'Staff ', 'Principal ', 'Lead ', 'Junior '];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    const matchedSkills = skills ? skills.slice(0, Math.floor(Math.random() * skills.length) + 1) : [];

    mockJobs.push({
      title: `${level}${role}`.trim(),
      company: company,
      location: locations[Math.floor(Math.random() * locations.length)],
      url: `https://${siteInfo?.domain || 'example.com'}/${company.toLowerCase().replace(/\s+/g, '-')}/jobs/${1000 + i}`,
      source: site,
      description: `We're looking for a talented ${level}${role} to join our team at ${company}. ${matchedSkills.length > 0 ? `Required skills: ${matchedSkills.join(', ')}.` : ''} This is an exciting opportunity to work on cutting-edge technology and make a real impact.`,
      posted_date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      search_query: buildSearchQuery({ sites, roles, statuses, skills }),
      matched_skills: matchedSkills,
      relevance_score: 0
    });
  }

  return mockJobs;
}

export default {
  JOB_SITES,
  STATUS_KEYWORDS,
  SKILL_SUGGESTIONS,
  buildSearchQuery,
  executeSearch,
  generateMockResults
};
