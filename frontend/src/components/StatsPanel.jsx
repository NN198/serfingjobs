export default function StatsPanel({ stats }) {
  if (!stats || stats.total === 0) return null

  return (
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-2xl font-bold text-white">{stats.total}</p>
        <p className="text-xs text-slate-400">Total Jobs</p>
      </div>

      {stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-lg font-semibold text-slate-300">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
