import { useState } from 'react'

export default function SearchForm({ sites, statuses, skillSuggestions, onSearch, loading }) {
  const [selectedSites, setSelectedSites] = useState([])
  const [roles, setRoles] = useState([])
  const [roleInput, setRoleInput] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState(['hiring', 'apply', 'open'])
  
  // Advanced search state
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [location, setLocation] = useState('')

  const handleSiteToggle = (siteId) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const handleSelectAllSites = () => {
    if (selectedSites.length === sites.length) {
      setSelectedSites([])
    } else {
      setSelectedSites(sites.map(s => s.id))
    }
  }

  const handleAddRole = (e) => {
    e?.preventDefault()
    const trimmed = roleInput.trim()
    if (trimmed && !roles.includes(trimmed)) {
      setRoles(prev => [...prev, trimmed])
      setRoleInput('')
    }
  }

  const handleRemoveRole = (role) => {
    setRoles(prev => prev.filter(r => r !== role))
  }

  const handleStatusToggle = (statusId) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    )
  }

  const handleAddSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills(prev => [...prev, skill])
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedSites.length === 0 || roles.length === 0) return
    
    onSearch({
      sites: selectedSites,
      roles,
      statuses: selectedStatuses,
      skills: showAdvanced ? skills : [],
      location: showAdvanced ? location : ''
    })
  }

  const isValid = selectedSites.length > 0 && roles.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Site Selection */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <label className="text-xs sm:text-sm font-medium text-slate-300">
            Job Sites
          </label>
          <button
            type="button"
            onClick={handleSelectAllSites}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            {selectedSites.length === sites.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {sites.map(site => (
            <label
              key={site.id}
              className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg cursor-pointer transition-all border ${
                selectedSites.includes(site.id)
                  ? 'bg-violet-500/10 border-violet-500/30 text-white'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSites.includes(site.id)}
                onChange={() => handleSiteToggle(site.id)}
                className="sr-only"
              />
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: site.color || '#6366F1' }}
              />
              <span className="text-[11px] sm:text-xs font-medium truncate">{site.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Role Input */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">
          Job Roles <span className="text-slate-500 font-normal">(OR logic)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder="e.g., Software Engineer"
            className="flex-1 min-w-0 px-3 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddRole()
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddRole}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-700/50 flex-shrink-0"
          >
            Add
          </button>
        </div>
        
        {/* Role Tags */}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {roles.map(role => (
              <span 
                key={role}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 rounded-full text-sm border border-violet-500/20"
              >
                "{role}"
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">
          Status Keywords
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {statuses.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusToggle(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                selectedStatuses.includes(status)
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Search Toggle */}
      <div className="border-t border-slate-800/50 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors w-full"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium">Advanced Search</span>
          <span className="text-xs text-slate-600">(skills, location)</span>
        </button>
      </div>

      {/* Advanced Search Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          {/* Skills/Area of Interest */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Skills / Area of Interest <span className="text-slate-500 font-normal">(OR logic)</span>
            </label>
            
            {/* Category Quick Select */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.keys(skillSuggestions).map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                    selectedCategory === category
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:text-slate-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Skill suggestions based on category */}
            {selectedCategory && skillSuggestions[selectedCategory] && (
              <div className="flex flex-wrap gap-1.5 mb-3 p-2 bg-slate-900/50 rounded-lg">
                {skillSuggestions[selectedCategory].map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    disabled={skills.includes(skill)}
                    className={`px-2 py-0.5 rounded text-xs transition-all ${
                      skills.includes(skill)
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            )}

            {/* Custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(skillInput.trim())
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput.trim())}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors border border-slate-700/50"
              >
                Add
              </button>
            </div>

            {/* Selected Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map(skill => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, Remote"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-semibold text-white text-sm sm:text-base transition-all ${
          isValid && !loading
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Searching...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Jobs
          </span>
        )}
      </button>
    </form>
  )
}
