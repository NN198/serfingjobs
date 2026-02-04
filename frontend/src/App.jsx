import { useState, useEffect } from 'react'
import SearchForm from './components/SearchForm'
import JobList from './components/JobList'
import QueryPreview from './components/QueryPreview'
import StatsPanel from './components/StatsPanel'
import useJobs from './hooks/useJobs'

function App() {
  const { 
    jobs, 
    loading, 
    error, 
    searchJobs, 
    fetchJobs,
    updateJob,
    deleteJob,
    sites,
    statuses,
    skillSuggestions,
    stats 
  } = useJobs()

  const [searchParams, setSearchParams] = useState({
    sites: [],
    roles: [],
    statuses: [],
    skills: [],
    location: ''
  })

  const [lastQuery, setLastQuery] = useState('')

  // Load saved jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSearch = async (params) => {
    setSearchParams(params)
    const result = await searchJobs(params)
    if (result?.query) {
      setLastQuery(result.query)
    }
  }

  const handleStatusChange = async (jobId, newStatus) => {
    await updateJob(jobId, { status: newStatus })
  }

  const handleDelete = async (jobId) => {
    await deleteJob(jobId)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-500/10 to-transparent blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Job Scraper</h1>
                  <p className="text-sm text-slate-400">
                    Boolean search across job boards
                  </p>
                </div>
              </div>
              
              <StatsPanel stats={stats} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Search Panel */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 shadow-xl shadow-black/20">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Search Jobs
                  </h2>
                  
                  <SearchForm 
                    sites={sites}
                    statuses={statuses}
                    skillSuggestions={skillSuggestions}
                    onSearch={handleSearch}
                    loading={loading}
                  />
                </div>

                {/* Query Preview */}
                <QueryPreview params={searchParams} query={lastQuery} />
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <JobList 
                jobs={jobs}
                loading={loading}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
