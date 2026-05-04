/**
 * pages/Home.jsx — Landing Page with Profile Picture
 *
 * PHOTO SETUP INSTRUCTIONS:
 * 1. Name your photo: profile.jpg (or profile.png)
 * 2. Put it in: frontend/public/profile.jpg
 * 3. That is it — the image tag below loads it automatically
 *
 * WHY public/ folder?
 * Files in public/ are served directly by the web server.
 * Vite copies them to the build output as-is.
 * You reference them with just /profile.jpg (no import needed).
 *
 * MOBILE LAYOUT DECISION:
 * On small screens, the photo appears FIRST (top), then the text.
 * This is done with CSS order property.
 * On desktop, text is left, photo is right — standard hero layout.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const stack = [
  { label: 'Docker',         color: 'accent' },
  { label: 'GitHub Actions', color: 'accent' },
  { label: 'Node.js',        color: 'purple' },
  { label: 'React',          color: 'purple' },
  { label: 'Nginx',          color: 'accent' },
  { label: 'GCP',            color: 'purple' },
  { label: 'Terraform',      color: 'accent' },
  { label: 'Linux',          color: 'purple' },
  { label: 'SQLite',         color: 'accent' },
  { label: 'Trivy',          color: 'purple' },
  { label: 'CI/CD',          color: 'accent' },
  { label: 'Kubernetes',     color: 'purple' },
]

const principles = [
  {
    icon: '⚡',
    title: 'Automate Everything',
    body: 'Manual processes break under pressure. Every repeatable task — testing, building, deploying — belongs in a pipeline.'
  },
  {
    icon: '🔒',
    title: 'Security is Not Optional',
    body: 'Non-root containers, dependency scanning, secrets in environment variables, rate limiting. Security is built in from day one.'
  },
  {
    icon: '📊',
    title: 'Observe Before You Deploy',
    body: 'Health checks, readiness probes, structured logging. If you cannot see it, you cannot debug it.'
  },
  {
    icon: '💸',
    title: 'Right-Size Your Infrastructure',
    body: 'Kubernetes is a great tool — and total overkill for a portfolio. Choose the simplest thing that solves the problem.'
  }
]

// Animated terminal typewriter
function Terminal() {
  const lines = [
    { text: 'git push origin main',              delay: 0    },
    { text: '→ GitHub Actions triggered',        delay: 700  },
    { text: '✓ tests passed (8/8)',              delay: 1400 },
    { text: '✓ trivy scan: 0 critical CVEs',    delay: 2100 },
    { text: '✓ docker image built & pushed',    delay: 2800 },
    { text: '✓ deployed to production',         delay: 3500 },
    { text: '🚀 live at uvereann.name.ng',       delay: 4200 },
  ]
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    lines.forEach((line, i) => {
      const t = setTimeout(() => setVisible(i + 1), line.delay + 400)
      return () => clearTimeout(t)
    })
  }, [])

  return (
    <div style={{
      background: '#0d0d14',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.82rem'
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)'
      }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: '0.75rem' }}>bash — uvereann@portfolio</span>
      </div>
      <div style={{ padding: '20px 20px 24px' }}>
        {lines.slice(0, visible).map((line, i) => (
          <div key={i} style={{
            marginBottom: 6,
            color: line.text.startsWith('✓') ? 'var(--accent)'
                 : line.text.startsWith('→') ? 'var(--muted)'
                 : line.text.startsWith('🚀') ? '#fbbf24'
                 : 'var(--text)',
            animation: 'fadeUp 0.3s ease both'
          }}>
            {!line.text.startsWith('→') && !line.text.startsWith('✓') && !line.text.startsWith('🚀') && (
              <span style={{ color: 'var(--accent)', userSelect: 'none' }}>$ </span>
            )}
            {line.text.startsWith('→') && <span style={{ marginLeft: 14 }} />}
            {line.text.startsWith('✓') || line.text.startsWith('🚀')
              ? <span style={{ marginLeft: 14 }}>{line.text}</span>
              : line.text
            }
          </div>
        ))}
        {visible < lines.length && (
          <span style={{ color: 'var(--accent)' }}>$ <span className="animate-blink">▊</span></span>
        )}
      </div>
    </div>
  )
}

// Profile picture component
// PHOTO: Put your photo at frontend/public/profile.jpg
function ProfilePhoto() {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        {/* Glow ring behind photo */}
        <div style={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          opacity: 0.6,
          filter: 'blur(8px)',
          zIndex: 0
        }} />

        {/* Photo or fallback avatar */}
        {!imgError ? (
          <img
            src="/profile.jpg"
            alt="Uverean — DevOps Engineer"
            onError={() => setImgError(true)}
            style={{
              width: 500,
              height: 500,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--accent)',
              position: 'relative',
              zIndex: 1,
              display: 'block'
            }}
          />
        ) : (
          /* Fallback when no photo is found */
          <div style={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'var(--surface2)',
            border: '3px solid var(--accent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 8
          }}>
            <span style={{ fontSize: '4rem' }}>👤</span>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--muted)',
              textAlign: 'center',
              padding: '0 16px'
            }}>
              Add profile.jpg to frontend/public/
            </span>
          </div>
        )}

        {/* Available badge */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          right: 4,
          zIndex: 2,
          background: 'var(--surface)',
          border: '2px solid var(--bg)',
          borderRadius: 99,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--accent)'
        }}>
          <span className="dot-green dot-pulse" />
          ann.ugwuonu@gmail.com
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="page-container">

      {/* ── Hero Section ─────────────────────────────────────── */}
      {/*
        MOBILE LAYOUT: photo on top, text below
        DESKTOP LAYOUT: text left, photo right

        We use CSS order to flip the order on mobile.
        The photo div has order:0 on mobile (shows first)
        and order:1 on desktop (shows second / right side).
      */}
      <section style={{ marginBottom: 100 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center'
        }} className="hero-grid">

          {/* Text — order 2 on mobile (shows below photo) */}
          <div className="hero-text stagger">
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 2.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text)',
              marginBottom: 20
            }}>
              Hi, I am <span style={{ color: 'var(--accent)' }}>Ivuaku Annastassia Ugwuonu</span><br />
              DevOps & Cloud<br />Engineer
            </h1>

            <p style={{
              color: 'var(--muted)',
              lineHeight: 1.8,
              fontSize: '1rem',
              marginBottom: 32,
              maxWidth: 440
            }}>
              I build the infrastructure that lets teams ship with confidence.
              CI/CD pipelines, Docker containers, cloud architecture, and
              security scanning — automated from commit to production.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/projects" className="btn-primary">View Projects →</Link>
              <Link to="/about"    className="btn-ghost">About Me</Link>
              <Link to="/contact"  className="btn-ghost">Get in touch</Link>
            </div>
          </div>

          {/* Photo — order 1 on mobile (shows first/top) */}
          <div className="hero-photo">
            <ProfilePhoto />
          </div>
        </div>
      </section>

      {/* ── Terminal Demo ─────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div className="section-label">Live Pipeline</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: 24,
          color: 'var(--text)'
        }}>
          From commit to production
        </h2>
        <Terminal />
      </section>

      {/* ── Tech Stack ────────────────────────────────────────── */}
      <section style={{ marginBottom: 100 }}>
        <div className="section-label">Stack</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: 24,
          color: 'var(--text)'
        }}>
          Tools I work with
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {stack.map(({ label, color }) => (
            <span key={label} className={color === 'purple' ? 'tag tag-purple' : 'tag'}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Principles ────────────────────────────────────────── */}
      <section>
        <div className="section-label">Philosophy</div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: 32,
          color: 'var(--text)'
        }}>
          How I think about DevOps
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20
        }} className="stagger">
          {principles.map(({ icon, title, body }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{icon}</div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                marginBottom: 8,
                color: 'var(--text)'
              }}>
                {title}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        /* Desktop: text left, photo right */
        .hero-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .hero-text { order: 1; }
        .hero-photo { order: 2; }

        /* Mobile: single column, photo on top */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-text  { order: 2; }
          .hero-photo { order: 1; }
        }
      `}</style>
    </div>
  )
}