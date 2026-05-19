import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { generateAnalytics } from '../utils/analytics'
import MooveLogo from '../components/MooveLogo'
import './ShareCard.css'

export default function ShareCard() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const analytics = generateAnalytics(username)
    setData(analytics)
    setLoading(false)
  }, [username])

  if (loading || !data) {
    return <div className="share-loading">Loading card...</div>
  }

  const { rank, activityScore, percentile } = data

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Create X share text
  const shareText = encodeURIComponent(
    `My Moove Activity Profile ⚡\n\nRank: ${rank.emoji} ${rank.name}\nActivity Score: ${activityScore} pts\nTop: ${100 - percentile}%\n\nTrack your contribution at Moove Tracker 👇`
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
      <div className="share-card-container" id="share-card-view">
        <div className="share-card-inner" style={{ '--rank-color': rank.color }}>
          <div className="card-ambient-glow" />
          
          {/* Card Header */}
          <div className="card-header">
            <div className="card-brand">
              <span className="brand-dot" />
              <span>MOOVE ACTIVITY TRACKER</span>
            </div>
            <div className="card-badge-tag">OFFICIAL PROFILE</div>
          </div>

          {/* User Details */}
          <div className="card-user-info">
            <div className="card-avatar">{username[0].toUpperCase()}</div>
            <div className="card-user-meta">
              <div className="card-username">@{username}</div>
              <div className="card-date">Scanned: {new Date().toLocaleDateString()}</div>
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
              <span className="matrix-val">Top {100 - percentile}%</span>
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
      <div className="share-controls">
        <button className={`btn-control btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyLink} id="copy-link-btn">
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
              Copy Share Link
            </>
          )}
        </button>

        <a href={xShareLink} target="_blank" rel="noreferrer" className="btn-control btn-tweet" id="share-to-x-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </a>
      </div>
    </div>
  )
}
