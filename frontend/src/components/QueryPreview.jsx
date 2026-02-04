export default function QueryPreview({ params, query }) {
  if (!query) return null

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800/50 p-4">
      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
        Generated Query
      </h3>
      <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
        <code className="text-xs text-violet-400 break-all leading-relaxed">
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
