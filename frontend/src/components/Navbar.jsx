import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',         label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog',     label: 'Blog' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--accent)'
            }}>
              uverean<span style={{ color: 'var(--muted)' }}>.ng</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 4 }} className="desktop-nav">
            {links.map(({ to, label }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
              return (
                <Link key={to} to={to} style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  background: active ? 'rgba(110,231,183,0.08)' : 'transparent',
                  transition: 'color 0.2s, background 0.2s'
                }}>
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.78rem', color: 'var(--muted)',
            fontFamily: 'JetBrains Mono, monospace'
          }} className="status-pill">
            <span className="dot-green dot-pulse" />
            available
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="mobile-menu-btn"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text)', padding: 8, display: 'none'
            }}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingBottom: 12
          }}>
            {links.map(({ to, label }) => (
              <Link key={to} to={to}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '10px 4px',
                  textDecoration: 'none', color: 'var(--text)',
                  fontSize: '0.9rem', fontWeight: 500
                }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .status-pill  { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
