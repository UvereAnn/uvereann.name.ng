import { useState } from 'react'
import { useApi } from '../hooks/useApi'

const CATEGORIES = ['All', 'DevOps', 'CI/CD', 'Backend', 'Cloud']

function ProjectCard({ project }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>
          {project.title}
        </h3>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
          padding: '2px 8px', borderRadius: 99,
          background: 'rgba(110,231,183,0.08)', color: 'var(--accent)',
          border: '1px solid rgba(110,231,183,0.15)', whiteSpace: 'nowrap'
        }}>
          {project.category}
        </span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7, flex: 1 }}>
        {project.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {project.tags.map(tag => (
          <span key={tag} className="tag" style={{ fontSize: '0.68rem' }}>{tag}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noreferrer"
            style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}
            onMouseOver={e => e.target.style.color = 'var(--accent)'}
            onMouseOut={e => e.target.style.color = 'var(--muted)'}>
            → GitHub
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noreferrer"
            style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}
            onMouseOver={e => e.target.style.color = 'var(--accent2)'}
            onMouseOut={e => e.target.style.color = 'var(--muted)'}>
            → Live
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const { data, loading, error } = useApi('/api/projects')
  const [category, setCategory] = useState('All')

  const projects = data?.data || []
  const filtered = category === 'All' ? projects : projects.filter(p => p.category === category)

  return (
    <div className="page-container">
      <div className="section-label">Work</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
        Projects
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 40 }}>
        Infrastructure and tooling I have built or contributed to.
      </p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '6px 16px', borderRadius: 99, border: '1px solid',
            borderColor: category === cat ? 'var(--accent)' : 'var(--border)',
            background: category === cat ? 'rgba(110,231,183,0.1)' : 'transparent',
            color: category === cat ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s'
          }}>
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          Loading projects...
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          Error: {error}. Is the backend running?
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}
        className="stagger">
        {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>

      {!loading && filtered.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>No projects in this category yet.</p>
      )}
    </div>
  )
}
