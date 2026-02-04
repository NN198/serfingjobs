import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api'

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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Fetch all jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/jobs`)
      const data = await res.json()
      setJobs(data)
      await fetchStats()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  // Search jobs
  const searchJobs = useCallback(async (params) => {
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
      await fetchStats()
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

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
      await fetchStats()
      return updated
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [fetchStats])

  // Delete job
  const deleteJob = useCallback(async (id) => {
    try {
      await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' })
      setJobs(prev => prev.filter(job => job.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }, [fetchStats])

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
