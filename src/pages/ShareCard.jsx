import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { generateAnalytics } from '../utils/analytics'
import MooveLogo from '../components/MooveLogo'
import './ShareCard.css'

export default function ShareCard() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorState, setErrorState] = useState(null)

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics?username=${username}`)
        const json = await response.json()
        if (!active) return

        if (!response.ok || !json.success) {
          setErrorState(json.message || 'Failed to retrieve card data.')
          return
        }
        setData(json.data)
      } catch (err) {
        if (!active) return
        setErrorState('Unable to connect to the card server.')
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [username])

  if (errorState) {
    return (
      <div className="share-root">
        <div className="share-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#EF4444' }}>
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <p style={{ fontWeight: 600 }}>{errorState}</p>
          <Link to="/search" className="btn-back-dash">Back to Search</Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="share-root">
        <div className="share-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span className="spinner-mini" style={{ width: '28px', height: '28px', borderThickness: '3px' }} />
          <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Loading contribution profile...</p>
        </div>
      </div>
    )
  }

  const { rank, activityScore, percentile } = data

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPNG = async () => {
    const cardElement = document.getElementById('share-card-view')
    if (!cardElement) return

    setExporting(true)
    try {
      // Small timeout to guarantee DOM is stable
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2, // Double resolution for high-quality export
        useCORS: true,
        logging: false,
      })

      const link = document.createElement('a')
      link.download = `moove-contribution-${username}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error generating card image:', err)
    } finally {
      setExporting(false)
    }
  }

  // Create X share text
  const shareText = encodeURIComponent(
    `My Moove Activity Profile ⚡\n\nRank: ${rank.emoji} ${rank.name}\nActivity Score: ${activityScore} pts\nTop: ${Number(100 - percentile).toFixed(1)}%\n\nTrack your contribution at Moove Tracker 👇`
  )
  const shareUrl = encodeURIComponent(window.location.href)
  const xShareLink = `https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`

  return (
    <div className="share-root">
      <div className="share-actions-top">
        <Link to={`/dashboard/${username}`} className="btn-back-dash" id="back-to-dashboard-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Dashboard
        </Link>
      </div>

      {/* The Visual Card */}
      <div className="share-card-container">
        <div className="share-card-inner" id="share-card-view" style={{ '--rank-color': rank.color }}>
          <div className="card-ambient-glow" />
          
          {/* Card Header */}
          <div className="card-header">
            <div className="card-brand">
              <span className="brand-dot" />
              <span>MOOVE ACTIVITY TRACKER</span>
            </div>
            <div className="card-badge-tag">OFFICIAL PROFILE</div>
          </div>

          <div className="card-user-info">
            <div className="card-avatar">{data.displayName ? data.displayName[0].toUpperCase() : username[0].toUpperCase()}</div>
            <div className="card-user-meta">
              <div className="card-displayname" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>{data.displayName || `@${username}`}</div>
              <div className="card-username" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@{username}</div>
            </div>
          </div>

          {/* Rank Ribbon */}
          <div className="card-rank-section">
            <div className="card-emoji-glow">{rank.emoji}</div>
            <div className="card-rank-details">
              <span className="card-rank-lbl">CONTRIBUTION RANK</span>
              <div className="card-rank-value">{rank.name}</div>
            </div>
          </div>

          {/* Main Stat Matrix */}
          <div className="card-stats-matrix">
            <div className="matrix-item">
              <span className="matrix-lbl">ACTIVITY SCORE</span>
              <span className="matrix-val">{activityScore}</span>
            </div>
            <div className="matrix-item">
              <span className="matrix-lbl">PERCENTILE</span>
              <span className="matrix-val">Top {Number(100 - percentile).toFixed(1)}%</span>
            </div>
            <div className="matrix-item">
              <span className="matrix-lbl">ENGAGEMENT</span>
              <span className="matrix-val">{data.totalEngagement}</span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            <div className="footer-left" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MooveLogo size={14} color="var(--moove-yellow)" />
              <span className="footer-logo" style={{ color: 'var(--text-primary)' }}>Moove</span>
            </div>
            <div className="footer-right">
              <span>scan.moove.xyz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sharing controls */}
      <div className="share-controls" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button className={`btn-control btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyLink} id="copy-link-btn" style={{ flex: 1 }}>
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Copied Link!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Link
              </>
            )}
          </button>

          <a href={xShareLink} target="_blank" rel="noreferrer" className="btn-control btn-tweet" id="share-to-x-btn" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>
        </div>

        <button 
          className={`btn-control btn-download ${exporting ? 'loading' : ''}`} 
          onClick={handleDownloadPNG} 
          disabled={exporting}
          id="download-png-btn"
          style={{ width: '100%' }}
        >
          {exporting ? (
            <>
              <span className="spinner-mini" />
              Generating PNG...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download Card PNG
            </>
          )}
        </button>
      </div>
    </div>
  )
}
