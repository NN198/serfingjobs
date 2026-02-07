import { useState } from 'react'

export default function QueryPreview({ params, query }) {
  const [copied, setCopied] = useState(false)

  if (!query) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = query
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Generated Query
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-400 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div
        onClick={handleCopy}
        className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 cursor-pointer hover:border-violet-500/30 transition-colors"
        title="Click to copy"
      >
        <code className="text-xs text-violet-400 break-all leading-relaxed select-all">
          {query}
        </code>
      </div>

      {params && Object.keys(params).some(k => params[k]?.length > 0 || params[k]) && (
        <div className="mt-3 pt-3 border-t border-slate-800/50">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {params.sites?.map(site => (
              <span key={site} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {site}
              </span>
            ))}
            {params.roles?.map(role => (
              <span key={role} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {role}
              </span>
            ))}
            {params.skills?.map(skill => (
              <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {skill}
              </span>
            ))}
            {params.statuses?.map(status => (
              <span key={status} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {status}
              </span>
            ))}
            {params.location && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                {params.location}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
