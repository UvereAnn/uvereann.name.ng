/**
 * pages/BlogPost.jsx — Single Blog Post with Likes and Comments
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'

// ── Like Button ───────────────────────────────────────────────

function LikeButton({ slug }) {
  const [liked, setLiked]   = useState(false)
  const [count, setCount]   = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}/likes`)
      .then(r => r.json())
      .then(data => {
        setCount(data.count || 0)
        setLiked(data.liked || false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/blog/${slug}/like`, { method: 'POST' })
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.count)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px', borderRadius: 8,
        border: `1px solid ${liked ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`,
        background: liked ? 'rgba(248,113,113,0.1)' : 'transparent',
        color: liked ? '#f87171' : 'var(--muted)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.2s', opacity: loading ? 0.7 : 1
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{liked ? '❤️' : '🤍'}</span>
      <span>{count} {count === 1 ? 'like' : 'likes'}</span>
    </button>
  )
}

// ── Comments Section ──────────────────────────────────────────

function Comments({ slug }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({ author_name: '', author_email: '', content: '' })
  const [status, setStatus]     = useState(null)
  const [errors, setErrors]     = useState([])

  useEffect(() => {
    fetch(`/api/blog/${slug}/comments`)
      .then(r => r.json())
      .then(data => { setComments(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  async function submitComment(e) {
    e.preventDefault()
    setStatus('loading')
    setErrors([])

    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setForm({ author_name: '', author_email: '', content: '' })
      } else {
        setStatus('error')
        setErrors(data.errors || [{ message: data.error }])
      }
    } catch {
      setStatus('error')
      setErrors([{ message: 'Network error. Try again.' }])
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '10px 14px',
    borderRadius: 8,
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.875rem',
    outline: 'none'
  }

  return (
    <div style={{ marginTop: 60 }}>
      <h2 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: '1.3rem', color: 'var(--text)', marginBottom: 24
      }}>
        Comments ({comments.length})
      </h2>

      {/* Existing comments */}
      {loading && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 32 }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {comments.map(comment => (
          <div key={comment.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: 8, flexWrap: 'wrap', gap: 4
            }}>
              <span style={{
                fontWeight: 600, color: 'var(--accent)',
                fontSize: '0.9rem', fontFamily: 'Syne, sans-serif'
              }}>
                {comment.author_name}
              </span>
              <span style={{
                color: 'var(--muted)', fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {new Date(comment.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
            <p style={{ color: 'var(--text)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <div style={{
        padding: 24, borderRadius: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 600,
          color: 'var(--text)', marginBottom: 20, fontSize: '1rem'
        }}>
          Leave a comment
        </h3>

        {status === 'success' ? (
          <div style={{
            padding: '16px 20px', borderRadius: 8,
            background: 'rgba(110,231,183,0.08)',
            border: '1px solid rgba(110,231,183,0.2)',
            color: 'var(--accent)', fontSize: '0.875rem'
          }}>
            ✓ Comment submitted! It will appear after review.
          </div>
        ) : (
          <form onSubmit={submitComment} noValidate>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 12
            }} className="comment-grid">
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem',
                  color: 'var(--muted)', marginBottom: 6,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>name *</label>
                <input
                  value={form.author_name}
                  onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  placeholder="Your name" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem',
                  color: 'var(--muted)', marginBottom: 6,
                  fontFamily: 'JetBrains Mono, monospace'
                }}>email (optional)</label>
                <input
                  type="email" value={form.author_email}
                  onChange={e => setForm(f => ({ ...f, author_email: e.target.value }))}
                  placeholder="Not published" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: '0.78rem',
                color: 'var(--muted)', marginBottom: 6,
                fontFamily: 'JetBrains Mono, monospace'
              }}>comment *</label>
              <textarea
                rows={4} value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Share your thoughts..."
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {errors.length > 0 && (
              <div style={{
                marginBottom: 12, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)'
              }}>
                {errors.map((e, i) => (
                  <p key={i} style={{ color: '#f87171', fontSize: '0.82rem' }}>
                    {e.field ? `${e.field}: ` : ''}{e.message}
                  </p>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary"
              disabled={status === 'loading'}
              style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
              {status === 'loading' ? 'Submitting...' : 'Post Comment'}
            </button>
            <p style={{
              marginTop: 10, color: 'var(--muted)',
              fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace'
            }}>
              Comments are reviewed before appearing publicly.
            </p>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .comment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Main BlogPost component ───────────────────────────────────

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

  function renderContent(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# '))  return <h1 key={i} style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', margin: '32px 0 12px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: '28px 0 10px' }}>{line.slice(3)}</h2>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{line.slice(2, -2)}</p>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} style={{ color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>{line}</p>
    })
  }

  return (
    <div className="page-container" style={{ maxWidth: 740 }}>
      <Link to="/blog" style={{
        color: 'var(--muted)', textDecoration: 'none',
        fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace',
        display: 'inline-block', marginBottom: 32
      }}
        onMouseOver={e => e.target.style.color = 'var(--accent)'}
        onMouseOut={e => e.target.style.color = 'var(--muted)'}>
        ← Back to Blog
      </Link>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
        fontWeight: 800, color: 'var(--text)',
        marginBottom: 12, lineHeight: 1.2
      }}>
        {post.title}
      </h1>

      {/* Date */}
      <p style={{
        color: 'var(--muted)', fontSize: '0.8rem',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: 40
      }}>
        {new Date(post.created_at).toLocaleDateString('en-GB', {
          year: 'numeric', month: 'long', day: 'numeric'
        })}
      </p>

      {/* Content */}
      <div style={{ marginBottom: 48 }}>
        {renderContent(post.content)}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <LikeButton slug={slug} />
          <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
            Found this useful? Give it a like.
          </span>
        </div>
      </div>

      {/* Comments */}
      <Comments slug={slug} />
    </div>
  )
}