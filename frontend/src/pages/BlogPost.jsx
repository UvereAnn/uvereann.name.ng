import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'

export default function BlogPost() {
  const { slug } = useParams()
  const { data, loading, error } = useApi(`/api/blog/${slug}`)
  const post = data?.data

  if (loading) return (
    <div className="page-container">
      <p style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>Loading...</p>
    </div>
  )

  if (error || !post) return (
    <div className="page-container">
      <p style={{ color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace' }}>Post not found.</p>
      <Link to="/blog" className="btn-ghost" style={{ marginTop: 20 }}>← Back to Blog</Link>
    </div>
  )

  // Simple markdown-like rendering (no library needed for basic posts)
  function renderContent(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# '))  return <h1 key={i} style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', margin: '32px 0 12px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: '28px 0 10px' }}>{line.slice(3)}</h2>
      if (line.startsWith('```')) return null
      if (line.startsWith('`') && line.endsWith('`')) return <code key={i} style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--accent)' }}>{line.slice(1, -1)}</code>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>{line}</p>
    })
  }

  return (
    <div className="page-container" style={{ maxWidth: 740 }}>
      <Link to="/blog" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace', display: 'inline-block', marginBottom: 32 }}
        onMouseOver={e => e.target.style.color = 'var(--accent)'}
        onMouseOut={e => e.target.style.color = 'var(--muted)'}>
        ← Back to Blog
      </Link>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 12, lineHeight: 1.2 }}>
        {post.title}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', marginBottom: 40 }}>
        {new Date(post.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <div>{renderContent(post.content)}</div>
    </div>
  )
}
