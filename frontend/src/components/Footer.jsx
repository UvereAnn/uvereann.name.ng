import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center',
        gap: 16
      }}>
        <div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            color: 'var(--accent)', fontSize: '0.95rem'
          }}>
            uverean<span style={{ color: 'var(--muted)' }}>.name.ng</span>
          </span>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>
            DevOps & Cloud Engineer
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { to: '/projects', label: 'Projects' },
            { to: '/blog',     label: 'Blog' },
            { to: '/contact',  label: 'Contact' }
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              color: 'var(--muted)', textDecoration: 'none',
              fontSize: '0.85rem', transition: 'color 0.2s'
            }}
            onMouseOver={e => e.target.style.color = 'var(--accent)'}
            onMouseOut={e => e.target.style.color = 'var(--muted)'}>
              {label}
            </Link>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}>
          Built with React + Node.js
        </p>
      </div>
    </footer>
  )
}
