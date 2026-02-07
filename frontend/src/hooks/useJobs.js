import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api'

// Compute stats from the current jobs array
function computeStats(jobs) {
  if (!jobs || jobs.length === 0) return { total: 0, byStatus: {}, bySource: {} }

  const byStatus = {}
  const bySource = {}
  for (const job of jobs) {
    const s = job.status || 'open'
    const src = job.source || 'other'
    byStatus[s] = (byStatus[s] || 0) + 1
    bySource[src] = (bySource[src] || 0) + 1
  }
  return { total: jobs.length, byStatus, bySource }
}

export default function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sites, setSites] = useState([])
  const [statuses, setStatuses] = useState([])
  const [skillSuggestions, setSkillSuggestions] = useState({})
  const [stats, setStats] = useState({ total: 0, byStatus: {}, bySource: {} })

  // Fetch metadata on mount
  useEffect(() => {
    fetch(`${API_BASE}/metadata`)
      .then(res => res.json())
      .then(data => {
        setSites(data.sites || [])
        setStatuses(data.statuses || [])
        setSkillSuggestions(data.skillSuggestions || {})
      })
      .catch(err => console.error('Failed to fetch metadata:', err))
  }, [])

  // Recalculate stats whenever jobs change
  useEffect(() => {
    setStats(computeStats(jobs))
  }, [jobs])

  // Fetch all jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/jobs`)
      const data = await res.json()
      setJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search jobs
  const searchJobs = useCallback(async (params) => {
    setJobs([])
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setJobs(data.jobs || [])
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Update job
  const updateJob = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updated = await res.json()
      setJobs(prev => prev.map(job => job.id === id ? updated : job))
      return updated
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  // Delete job
  const deleteJob = useCallback(async (id) => {
    try {
      await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' })
      setJobs(prev => prev.filter(job => job.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  return {
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
  }
}
