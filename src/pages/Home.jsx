import { Link } from 'react-router-dom'
import MooveLogo from '../components/MooveLogo'
import './Home.css'

export default function Home() {
  return (
    <div className="home-root">
      {/* Nav */}
      <nav className="home-nav">
        <div className="home-logo">
          <MooveLogo size={28} color="var(--moove-yellow)" style={{ marginRight: '6px' }} />
          <span className="logo-text">Moove</span>
          <span className="logo-badge">Tracker</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="home-hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Community Activity Estimator (beta)
        </div>

        <h1 className="hero-headline">
          Track Your
          <span className="hero-accent"> Moove</span>
          <br />Contribution
        </h1>

        <p className="hero-sub">
          Discover your activity score, contribution rank, and total engagement.
          Analytics are estimated from public visible activity across the Moove ecosystem.
        </p>

        <Link to="/search" className="hero-cta" id="get-started-btn">
          <span>Get Started</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>

        {/* Stats preview row */}
        <div className="hero-stats">
          {[
            { val: '50K+', label: 'Community Members' },
            { val: '1.2M', label: 'Posts Tracked' },
            { val: '7',    label: 'Rank Tiers' },
          ].map(s => (
            <div className="hero-stat-item" key={s.label}>
              <span className="stat-val">{s.val}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Rank ladder preview */}
      <section className="home-ranks">
        <h2 className="ranks-title">Contribution Ranks</h2>
        <div className="ranks-grid">
          {[
            { name: 'Explorer',          color: '#8B9BB4', emoji: '🔍' },
            { name: 'Contributor',       color: '#60A5FA', emoji: '✨' },
            { name: 'Supporter',         color: '#A78BFA', emoji: '💜' },
            { name: 'Builder',           color: '#F59E0B', emoji: '🔨' },
            { name: 'Advocate',          color: '#F97316', emoji: '📣' },
            { name: 'Power Contributor', color: '#EF4444', emoji: '⚡' },
            { name: 'Moove Legend',      color: '#00E676', emoji: '🏆' },
          ].map((r, i) => (
            <div
              className="rank-pill"
              key={r.name}
              style={{ '--rank-color': r.color, animationDelay: `${i * 0.07}s` }}
            >
              <span className="rank-emoji">{r.emoji}</span>
              <span className="rank-name">{r.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span>© 2025 Moove Activity Tracker · Simulated Analytics</span>
      </footer>
    </div>
  )
}
