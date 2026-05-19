import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { generateAnalytics } from '../utils/analytics'
import { useCountUp } from '../hooks/useCountUp'
import MooveLogo from '../components/MooveLogo'
import './Dashboard.css'

export default function Dashboard() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing...')
  const [errorState, setErrorState] = useState(null)

  useEffect(() => {
    let active = true
    setData(null)
    setLoading(true)
    setErrorState(null)

    const fetchRealData = async () => {
      try {
        const response = await fetch(`/api/analytics?username=${username}`)
        const json = await response.json()

        if (!active) return

        if (!response.ok || !json.success) {
          setErrorState({
            code: json.error || 'SERVER_ERROR',
            message: json.message || 'Failed to fetch contribution data.'
          })
          setLoading(false)
          return
        }

        setData(json.data)
        setLoading(false)
      } catch (err) {
        if (!active) return
        setErrorState({
          code: 'CONNECTION_FAILED',
          message: 'Unable to connect to the analytics server. Check your connection or API status.'
        })
        setLoading(false)
      }
    }

    fetchRealData()
    return () => {
      active = false
    }
  }, [username])

  useEffect(() => {
    setLoadingProgress(0)
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + 1
        if (next >= 100) {
          clearInterval(interval)
          return 100
        }
        return next
      })
    }, 20) // 20ms * 100 = 2000ms load time

    return () => clearInterval(interval)
  }, [username])

  useEffect(() => {
    if (loadingProgress < 20) {
      setStatusText('🔍 Establishing secure handshake with X API...')
    } else if (loadingProgress < 45) {
      setStatusText('⚡ Scanning public tag mentions and contract interactions...')
    } else if (loadingProgress < 70) {
      setStatusText('🧬 Parsing contribution values & weights...')
    } else if (loadingProgress < 95) {
      setStatusText('🏆 Synthesizing activity score and rank tier...')
    } else {
      setStatusText('Ready!')
    }
  }, [loadingProgress])

  // Count ups for stats (will begin when dashboard renders)
  const postsCount = useCountUp(data ? data.totalPosts : 0, 1500)
  const repliesCount = useCountUp(data ? data.totalReplies : 0, 1500)
  const likesCount = useCountUp(data ? data.totalLikes : 0, 1500)
  const engagementCount = useCountUp(data ? data.totalEngagement : 0, 1500)
  const scoreCount = useCountUp(data ? data.activityScore : 0, 1800)

  if (errorState) {
    return (
      <div className="dashboard-error">
        <div className="error-card">
          <div className="error-icon-wrap">
            <span className="error-emoji">⚠️</span>
          </div>
          <h2 className="error-title">Analysis Failed</h2>
          <p className="error-message">{errorState.message}</p>
          
          {errorState.code === 'RATE_LIMIT_EXCEEDED' && (
            <div className="error-tip">
              <strong>Tip:</strong> The X API is currently rate-limited. Please wait a few minutes before scanning again.
            </div>
          )}

          {errorState.code === 'USER_NOT_FOUND' && (
            <div className="error-tip">
              <strong>Tip:</strong> Make sure the username is spelled correctly and the account is active on X.
            </div>
          )}

          {errorState.code === 'API_AUTHENTICATION_FAILED' && (
            <div className="error-tip">
              <strong>Tip:</strong> The server bearer token is invalid or missing. Ensure process.env.X_BEARER_TOKEN is correctly set in your Vercel Dashboard.
            </div>
          )}

          <div className="error-actions">
            <Link to="/search" className="btn-error-back">
              Try Another Handle
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading || loadingProgress < 100 || !data) {
    return (
      <div className="dashboard-loading">
        <div className="loader-container">
          <div className="spinner-wrap">
            <div className="spinner-ring" />
            <div className="spinner-ring-inner" />
            <div className="spinner-progress-value">{loadingProgress}%</div>
          </div>
          
          <div className="loader-meta">
            <span className="loading-title">COMPILING METRIC INDEX</span>
            <span className="loading-text">{statusText}</span>
          </div>

          <div className="loader-bar-track">
            <div className="loader-bar-fill" style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      </div>
    )
  }

  const { rank, percentile, weeklyData, categories, nextRankMin, nextRankName, rankProgress } = data

  const maxWeeklyValue = Math.max(...weeklyData.map(d => d.posts + d.replies + d.likes))

  return (
    <div className="dashboard-root">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/search" className="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </Link>
          <div className="user-profile">
            <div className="user-avatar" style={{ border: '2px solid var(--moove-yellow)', position: 'relative' }}>
              {username[0].toUpperCase()}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: '#060608',
                borderRadius: '50%',
                padding: '2px'
              }}>
                <MooveLogo size={12} color="var(--moove-yellow)" />
              </div>
            </div>
            <div className="user-info">
              <h1 className="user-handle">@{username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <p className="user-meta" style={{ margin: 0 }}>Activity Profile</p>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  color: 'var(--moove-yellow)',
                  background: 'var(--moove-yellow-soft)',
                  border: '1px solid var(--border-accent)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>Verified Scan</span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  color: 'var(--moove-yellow)',
                  background: 'rgba(255,214,0,0.05)',
                  border: '1px dashed var(--border-accent)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>Beta Estimator</span>
              </div>
            </div>
          </div>
        </div>

        <div className="header-right">
          <Link to={`/share/${username}`} className="btn-share" id="view-share-card-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Shareable Card
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        
        {/* Main Banner / Badge */}
        <section className="card card-badge" style={{ '--rank-color': rank.color }}>
          <div className="badge-glow" />
          <div className="badge-header">
            <span className="badge-subtitle">Contribution Rank</span>
            <div className="badge-icon-wrap">
              <span className="badge-emoji">{rank.emoji}</span>
            </div>
          </div>
          <h2 className="badge-title">{rank.name}</h2>
          <p className="badge-desc">
            You are ranked in the top <strong>{Number(100 - percentile).toFixed(1)}%</strong> of Moove contributors.
            {nextRankName ? (
              <> Reach a score of <strong>{nextRankMin}</strong> to unlock the <strong>{nextRankName}</strong> tier.</>
            ) : (
              <> You have achieved the highest rank in the Moove ecosystem!</>
            )}
          </p>
          <div className="progress-bar-wrap">
            <div className="progress-bar-label">
              <span>Next Rank Progress</span>
              <span>{nextRankName ? `${rankProgress}%` : '100%'}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${nextRankName ? rankProgress : 100}%` }} />
            </div>
          </div>
        </section>

        {/* Score Display Card */}
        <section className="card card-score">
          <span className="card-lbl">Activity Score</span>
          <div className="score-hero">
            <span className="score-val">{scoreCount}</span>
            <span className="score-pts">pts</span>
          </div>
          <p className="score-explanation">
            Combined index tracking post count, mentions, retweets, replies and likes.
          </p>
          <div className="score-breakdown">
            <div className="score-breakdown-item">
              <span>Posts Weight</span>
              <span className="weight-badge">High</span>
            </div>
            <div className="score-breakdown-item">
              <span>Replies Weight</span>
              <span className="weight-badge text-green">Ultra</span>
            </div>
          </div>
        </section>

        {/* Soft Stats Cards */}
        <section className="card card-stat">
          <div className="stat-card-icon">✉</div>
          <span className="card-lbl">Moove Mentions</span>
          <span className="stat-card-val">{postsCount}</span>
          <p className="card-foot text-green">Direct posts referencing "Moove"</p>
        </section>

        <section className="card card-stat">
          <div className="stat-card-icon">↩</div>
          <span className="card-lbl">Replies to @moovexyz</span>
          <span className="stat-card-val">{repliesCount}</span>
          <p className="card-foot">Interactions and response threads</p>
        </section>

        <section className="card card-stat">
          <div className="stat-card-icon">♥</div>
          <span className="card-lbl">Estimated Likes</span>
          <span className="stat-card-val">{likesCount}</span>
          <p className="card-foot">Likes gathered on Moove topics</p>
        </section>

        <section className="card card-stat">
          <div className="stat-card-icon">⚡</div>
          <span className="card-lbl">Visible Engagement</span>
          <span className="stat-card-val">{engagementCount}</span>
          <p className="card-foot text-green">Aggregated action count</p>
        </section>

        {/* Activity Chart (Custom SVG implementation for simplicity/aesthetics without external deps) */}
        <section className="card card-chart">
          <h3 className="chart-title">Activity Trend (Last 7 Days)</h3>
          <div className="chart-visual">
            {weeklyData.map((d, index) => {
              const totalVal = d.posts + d.replies + d.likes
              const heightPct = maxWeeklyValue > 0 ? (totalVal / maxWeeklyValue) * 80 + 10 : 10
              return (
                <div className="chart-bar-wrap" key={d.day}>
                  <div className="chart-bar-hover-val">{totalVal} engagements</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar" style={{ height: `${heightPct}%` }}>
                      <div className="chart-bar-posts" style={{ height: `${(d.posts / (totalVal || 1)) * 100}%` }} />
                      <div className="chart-bar-replies" style={{ height: `${(d.replies / (totalVal || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="chart-bar-lbl">{d.day}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot color-posts" /> Posts</span>
            <span className="legend-item"><span className="legend-dot color-replies" /> Replies</span>
          </div>
        </section>

        {/* Content categories */}
        <section className="card card-categories">
          <h3 className="chart-title">Contribution Focus</h3>
          <div className="categories-list">
            {categories.map(c => (
              <div className="category-item" key={c.label}>
                <div className="category-meta">
                  <span className="category-name">{c.label}</span>
                  <span className="category-pct">{c.pct}%</span>
                </div>
                <div className="category-track">
                  <div className="category-fill" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        {/* Beta Estimator Disclaimer Card */}
        <section className="card" style={{ gridColumn: '1 / -1', padding: '16px', background: 'rgba(255, 214, 0, 0.02)', border: '1px dashed rgba(255, 214, 0, 0.2)', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.25rem' }}>⚠️</div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>Community Activity Estimator (beta)</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              All metrics and analytics displayed are estimated from public visible activity across the Moove ecosystem and do not represent official internal telemetry.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
