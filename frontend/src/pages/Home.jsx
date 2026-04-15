/**
 * pages/Home.jsx — Landing Page
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const stack = [
  { label: 'Docker',          color: 'purple' },
  { label: 'GitHub Actions',  color: 'accent' },
  { label: 'Jenkins',         color: 'purple' },
  { label: 'Argo CD',         color: 'accent' },
  { label: 'Node.js',         color: 'purple' },
  { label: 'React',           color: 'accent' },
  { label: 'Nginx',           color: 'purple' },
  { label: 'GCP',             color: 'accent' },
  { label: 'Terraform',       color: 'purple' },
  { label: 'Ansible',         color: 'accent' },
  { label: 'Linux',           color: 'purple' },
  { label: 'SQLite',          color: 'accent' },
  { label: 'Trivy',           color: 'purple' },
  { label: 'CI/CD',           color: 'accent' },
  { label: 'Kubernetes',      color: 'purple' },
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

// Animated terminal typewriter component
function Terminal() {
  const lines = [
    { text: 'git push origin main', delay: 0 },
    { text: '→ GitHub Actions triggered', delay: 700 },
    { text: '✓ tests passed (8/8)', delay: 1400 },
    { text: '✓ trivy scan: 0 critical CVEs', delay: 2100 },
    { text: '✓ docker image built & pushed', delay: 2800 },
    { text: '✓ deployed to production', delay: 3500 },
    { text: '🚀 live at uvereann.name.ng', delay: 4200 },
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
      {/* Window bar */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)'
      }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
        <span style={{ marginLeft: 8, color: 'var(--muted)', fontSize: '0.75rem' }}>bash</span>
      </div>
      {/* Terminal body */}
      <div style={{ padding: '20px 20px 24px' }}>
        {lines.slice(0, visible).map((line, i) => (
          <div key={i} style={{
            marginBottom: 6,
            color: line.text.startsWith('✓') ? 'var(--accent)' :
                   line.text.startsWith('→') ? 'var(--muted)' :
                   line.text.startsWith('🚀') ? '#fbbf24' : 'var(--text)',
            animation: 'fadeUp 0.3s ease both'
          }}>
            {!line.text.startsWith('→') && !line.text.startsWith('✓') && !line.text.startsWith('🚀') && (
              <span style={{ color: 'var(--accent)', userSelect: 'none' }}>$ </span>
            )}
            {line.text.startsWith('→') && (
              <span style={{ marginLeft: 14 }} />
            )}
            {line.text.startsWith('✓') || line.text.startsWith('🚀') ? (
              <span style={{ marginLeft: 14 }}>{line.text}</span>
            ) : (
              line.text
            )}
          </div>
        ))}
        {visible < lines.length && (
          <span style={{ color: 'var(--accent)' }}>
            $ <span className="animate-blink">▊</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="page-container">

      {/* Hero */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 100 }}
        className="hero-grid">
        <div className="stagger">
          <div className="section-label">DevOps & Cloud Engineer</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text)',
            marginBottom: 20
          }}>
            Building infrastructure<br />
            <span style={{ color: 'var(--accent)' }}>that ships itself</span>
          </h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: '1rem', marginBottom: 32, maxWidth: 440 }}>
            I automate the path from code to production. CI/CD pipelines,
            Docker containers, cloud infrastructure, and security scanning —
            so teams can ship with confidence.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/projects" className="btn-primary">View Projects →</Link>
            <Link to="/contact"  className="btn-ghost">Get in touch</Link>
          </div>
        </div>
        <div>
          <Terminal />
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ marginBottom: 100 }}>
        <div className="section-label">Stack</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>
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

      {/* Principles */}
      <section>
        <div className="section-label">Philosophy</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: 32, color: 'var(--text)' }}>
          How I think about DevOps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}
          className="stagger">
          {principles.map(({ icon, title, body }) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
                {title}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  )
}
