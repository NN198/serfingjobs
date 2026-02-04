import { useState } from 'react'

const STATUS_COLORS = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  interviewing: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  offer: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
}

const SOURCE_COLORS = {
  greenhouse: '#3AB549',
  lever: '#7C3AED',
  smartrecruiters: '#FF6B35',
  workday: '#0075C9',
  bamboohr: '#73C41D',
  jobvite: '#E31937',
  icims: '#00A4BD',
  jazz: '#6366F1',
  workable: '#00756A',
  other: '#6B7280'
}

function JobCard({ job, onStatusChange, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800/50 p-5 hover:border-slate-700/50 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SOURCE_COLORS[job.source] || SOURCE_COLORS.other }}
            />
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {job.source}
            </span>
          </div>

          <h3 className="text-white font-medium truncate mb-1">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-400 transition-colors"
            >
              {job.title}
            </a>
          </h3>

          {job.company && (
            <p className="text-slate-400 text-sm mb-2">{job.company}</p>
          )}

          {job.location && (
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(job.id, e.target.value)}
            className={`text-xs px-2 py-1 rounded-lg border ${STATUS_COLORS[job.status]} bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
          >
            <option value="open">Open</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>

          <button
            onClick={() => onDelete(job.id)}
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {job.matched_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.matched_skills.map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {skill}
            </span>
          ))}
        </div>
      )}

      {job.description && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {isExpanded ? 'Hide' : 'Show'} description
          </button>
          {isExpanded && (
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {job.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function JobList({ jobs, loading, onStatusChange, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-slate-400 font-medium mb-1">No jobs found</h3>
        <p className="text-slate-500 text-sm">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-400 text-sm font-medium">
          {jobs.length} {jobs.length === 1 ? 'result' : 'results'}
        </h2>
      </div>

      <div className="grid gap-4">
        {jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
