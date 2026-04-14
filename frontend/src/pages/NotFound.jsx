import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 120 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '4rem', color: 'var(--border)', marginBottom: 16 }}>
        404
      </div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
        This route does not exist. Maybe you mistyped the URL?
      </p>
      <Link to="/" className="btn-primary">← Back home</Link>
    </div>
  )
}
