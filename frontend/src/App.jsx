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
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Show scroll-to-top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadCSV = () => {
    if (!jobs || jobs.length === 0) return

    const headers = ['Title', 'Company', 'Location', 'Source', 'Status', 'URL', 'Skills', 'Description']
    const rows = jobs.map(job => [
      job.title || '',
      job.company || '',
      job.location || '',
      job.source || '',
      job.status || '',
      job.url || '',
      (job.matched_skills || []).join('; '),
      (job.description || '').replace(/[\n\r]+/g, ' ')
    ])

    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(escape).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSearch = async (params) => {
    setSearchParams(params)
    setLastQuery('')
    setHasSearched(true)
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
          <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">Job Scraper</h1>
                  <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                    Boolean search across job boards
                  </p>
                </div>
              </div>

              {hasSearched && <StatsPanel stats={stats} />}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
            {/* Search Panel */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-800/50 p-4 sm:p-6 shadow-xl shadow-black/20">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
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

              {!hasSearched ? (
                /* Welcome state - before any search */
                <div className="text-center py-20 sm:py-24">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Start your job search</h3>
                  <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                    Select job sites and enter roles in the search panel to find matching listings.
                  </p>
                </div>
              ) : (
                <>
                  {/* CSV Download */}
                  {jobs.length > 0 && !loading && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 hover:text-white transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download CSV
                      </button>
                    </div>
                  )}

                  <JobList
                    jobs={jobs}
                    loading={loading}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-500 transition-all flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default App
