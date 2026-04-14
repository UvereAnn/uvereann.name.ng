import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'

export default function Blog() {
  const { data, loading, error } = useApi('/api/blog')
  const posts = data?.data || []

  return (
    <div className="page-container">
      <div className="section-label">Writing</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
        Blog
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 48 }}>
        Notes on DevOps, infrastructure, and engineering decisions.
      </p>

      {loading && <p style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>Error: {error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="stagger">
        {posts.map(post => (
          <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {post.tags.map(tag => (
                  <span key={tag} className="tag" style={{ fontSize: '0.68rem' }}>{tag}</span>
                ))}
              </div>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 600,
                fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8
              }}>
                {post.title}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 12 }}>
                {post.excerpt}
              </p>
              <span style={{ color: 'var(--accent)', fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace' }}>
                Read more →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
