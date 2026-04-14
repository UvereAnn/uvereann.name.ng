/**
 * pages/Pipeline.jsx
 * Explains the CI/CD pipeline visually — great for interviews.
 */
const stages = [
  {
    step: '01',
    name: 'Code',
    icon: '💻',
    color: 'var(--accent2)',
    description: 'Developer writes code on a feature branch. Never directly on main.',
    details: ['git checkout -b feature/my-feature', 'Write code, write tests', 'git push origin feature/my-feature', 'Open a Pull Request on GitHub']
  },
  {
    step: '02',
    name: 'Test',
    icon: '🧪',
    color: 'var(--accent)',
    description: 'GitHub Actions automatically runs tests on every PR. PR cannot merge if tests fail.',
    details: ['npm test (Jest)', 'Linting (ESLint)', 'Tests must pass before review', '8 tests covering all endpoints']
  },
  {
    step: '03',
    name: 'Security Scan',
    icon: '🔒',
    color: '#fbbf24',
    description: 'Trivy scans for known vulnerabilities (CVEs) in dependencies and the container image.',
    details: ['trivy fs . (filesystem scan)', 'trivy image (container scan)', 'Blocks on CRITICAL severity', 'SBOM (Software Bill of Materials) generated']
  },
  {
    step: '04',
    name: 'Build',
    icon: '📦',
    color: 'var(--accent)',
    description: 'Docker builds the container images using multi-stage builds to minimise size.',
    details: ['Multi-stage Dockerfile', 'Stage 1: install deps + build', 'Stage 2: copy only the output', 'Non-root user in final image']
  },
  {
    step: '05',
    name: 'Deploy',
    icon: '🚀',
    color: 'var(--accent2)',
    description: 'On merge to main, GitHub Actions SSHs into the server and deploys the new image.',
    details: ['SSH into server', 'docker compose pull', 'docker compose up -d', 'Health check confirms success']
  }
]

const concepts = [
  { term: 'Branch Protection', def: 'GitHub rule: PRs must pass CI before merging to main. Prevents broken code reaching production.' },
  { term: 'Idempotent Deploy', def: 'Running the deploy twice produces the same result. docker compose up -d is idempotent.' },
  { term: 'Health Check', def: 'After deploying, CI calls GET /health. If it returns 200, deploy is successful.' },
  { term: 'Rollback', def: 'If deploy fails, re-run the previous workflow. Docker image tags make this easy.' },
]

export default function Pipeline() {
  return (
    <div className="page-container">
      <div className="section-label">CI/CD</div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
        Deployment Pipeline
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 60, maxWidth: 600 }}>
        Every push to main triggers an automated pipeline. Code only reaches
        production if it passes tests and security scanning.
      </p>

      {/* Pipeline stages */}
      <div style={{ position: 'relative', marginBottom: 80 }}>
        {stages.map((stage, i) => (
          <div key={stage.step} style={{ display: 'flex', gap: 24, marginBottom: 12, alignItems: 'stretch' }}>
            {/* Left: step number + connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--surface2)', border: `2px solid ${stage.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
                color: stage.color, fontWeight: 700, flexShrink: 0
              }}>
                {stage.step}
              </div>
              {i < stages.length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0', minHeight: 20 }} />
              )}
            </div>
            {/* Right: content */}
            <div className="card" style={{ padding: '20px 24px', flex: 1, marginBottom: i < stages.length - 1 ? 0 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.2rem' }}>{stage.icon}</span>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: stage.color, fontSize: '1rem' }}>
                  {stage.name}
                </h2>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 12 }}>
                {stage.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {stage.details.map(d => (
                  <code key={d} style={{
                    fontSize: '0.72rem', padding: '3px 10px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
                    border: '1px solid var(--border)'
                  }}>{d}</code>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GitHub Actions YAML snippet */}
      <div style={{ marginBottom: 60 }}>
        <div className="section-label">Configuration</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
          GitHub Actions Workflow
        </h2>
        <pre style={{ fontSize: '0.78rem', lineHeight: 1.8 }}>{`name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test

  security-scan:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          severity: CRITICAL,HIGH
          exit-code: 1   # fail the pipeline if found

  deploy:
    needs: security-scan
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /srv/portfolio
            docker compose pull
            docker compose up -d
            curl -f http://localhost:3000/health`}
        </pre>
      </div>

      {/* Key concepts */}
      <div>
        <div className="section-label">Concepts</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
          Interview-Ready Explanations
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {concepts.map(({ term, def }) => (
            <div key={term} className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 8 }}>
                {term}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
