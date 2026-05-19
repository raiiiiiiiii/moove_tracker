import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MooveLogo from '../components/MooveLogo'
import './Search.css'

export default function Search() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const clean = username.trim().replace(/^@/, '')
    
    if (!clean) { 
      setError('Please enter your X username.')
      return 
    }
    if (clean.length > 15) {
      setError('X usernames cannot exceed 15 characters.')
      return
    }
    if (!/^[A-Za-z0-9_]+$/.test(clean)) {
      setError('X usernames can only contain letters, numbers, and underscores.')
      return
    }
    
    setError('')
    navigate(`/dashboard/${clean}`)
  }

  return (
    <div className="search-root">
      {/* Back */}
      <Link to="/" className="search-back" id="back-home-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </Link>

      <div className="search-card">
        {/* Header */}
        <div className="search-header">
          <div className="search-logo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MooveLogo size={24} color="var(--moove-yellow)" />
            <span>Moove Tracker <span style={{ fontSize: '0.65rem', color: 'var(--moove-yellow)', border: '1px solid var(--border-accent)', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px', textTransform: 'uppercase', fontWeight: '800' }}>Beta</span></span>
          </div>
          <h1 className="search-title">Enter your X username</h1>
          <p className="search-desc">
            We'll estimate your activity from public visible actions across the Moove ecosystem and generate your contribution profile.
          </p>
        </div>

        {/* Form */}
        <form className="search-form" onSubmit={handleSubmit} id="username-form">
          <div className={`search-input-wrap ${error ? 'has-error' : ''}`}>
            <span className="input-prefix">@</span>
            <input
              id="username-input"
              type="text"
              className="search-input"
              placeholder="yourhandle"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              autoFocus
              disabled={loading}
              maxLength={50}
              autoComplete="off"
              spellCheck="false"
            />
            {username && !loading && (
              <button
                type="button"
                className="input-clear"
                onClick={() => { setUsername(''); setError('') }}
                aria-label="Clear input"
              >✕</button>
            )}
          </div>
          {error && <p className="search-error" role="alert">{error}</p>}

          <button
            id="analyze-btn"
            type="submit"
            className={`search-submit ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing activity…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Analyze My Activity
              </>
            )}
          </button>
        </form>

        {/* Note */}
        <div className="search-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          Analytics are estimated from public visible activity. Simulated fallback active.
        </div>
      </div>
    </div>
  )
}
