import { useState } from 'react'

const INITIAL = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm]     = useState(INITIAL)
  const [status, setStatus] = useState(null)  // null | 'loading' | 'success' | 'error'
  const [errors, setErrors] = useState([])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrors([])

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()

      if (res.ok) {
        setStatus('success')
        setForm(INITIAL)
      } else if (res.status === 400) {
        setStatus('error')
        setErrors(json.errors || [{ message: json.error }])
      } else {
        setStatus('error')
        setErrors([{ message: json.error || 'Something went wrong. Please try again.' }])
      }
    } catch {
      setStatus('error')
      setErrors([{ message: 'Network error. Is the backend running?' }])
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface2)',
    border: '1px solid var(--border)', color: 'var(--text)',
    padding: '10px 14px', borderRadius: 8,
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.2s'
  }

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="section-label">Contact</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
        Get in touch
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 48, lineHeight: 1.7 }}>
        Open to DevOps and Cloud engineering roles, consulting, and
        interesting infrastructure conversations.
      </p>

      {status === 'success' ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>Message sent!</h2>
          <p style={{ color: 'var(--muted)' }}>Thank you — I will get back to you soon.</p>
          <button onClick={() => setStatus(null)} className="btn-ghost" style={{ marginTop: 20 }}>
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
            className="form-grid">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                name *
              </label>
              <input name="name" value={form.name} onChange={handleChange}
                required placeholder="Your name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                email *
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                required placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
              subject
            </label>
            <input name="subject" value={form.subject} onChange={handleChange}
              placeholder="e.g. DevOps role at your company" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>
              message *
            </label>
            <textarea name="message" value={form.message} onChange={handleChange}
              required rows={6} placeholder="What are you working on?"
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 8,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)'
            }}>
              {errors.map((err, i) => (
                <p key={i} style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: i < errors.length - 1 ? 4 : 0 }}>
                  {err.field ? `${err.field}: ` : ''}{err.message}
                </p>
              ))}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={status === 'loading'}
            style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
            {status === 'loading' ? 'Sending...' : 'Send message →'}
          </button>
        </form>
      )}

      <style>{`
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
