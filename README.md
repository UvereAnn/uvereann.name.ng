# uvereann.name.ng — DevOps Portfolio

A portfolio website that IS the DevOps project. Every tool and
practice demonstrated here is used to build and run the site itself.

**Live:** https://uvereann.name.ng

---

## Architecture

Developer Machine
│
│ git push → feature branch → Pull Request
▼
GitHub
│
├── CI Pipeline (every PR)
│     ├── Jest tests (backend)
│     ├── ESLint (frontend)
│     └── Trivy security scan
│
└── CD Pipeline (merge to main)
│
│ SSH deploy
▼
Oracle Cloud Infrastructure
VM.Standard.E2.1.Micro — Always Free
uk-london-1 — 145.241.215.190
│
├── Nginx (reverse proxy + HTTPS)
│     ├── / → serves React build files
│     └── /api → proxies to Node.js:3000
│
├── Node.js/Express (PM2 process manager)
│     └── SQLite database
│
└── Let's Encrypt SSL certificate

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, TailwindCSS | UI |
| Backend | Node.js, Express | REST API |
| Database | SQLite | Data persistence |
| Process Manager | PM2 | Keep Node.js running, auto-restart |
| Reverse Proxy | Nginx | HTTPS, static files, API routing |
| SSL | Let's Encrypt (Certbot) | Free automatic HTTPS |
| IaC | Terraform | Provision OCI infrastructure |
| Configuration | Ansible | Configure and deploy to VM |
| CI/CD | GitHub Actions | Test, scan, deploy on every push |
| Security Scanning | Trivy | Dependency CVE scanning |
| Cloud | Oracle Cloud (Always Free) | Production hosting |

---

## DevOps Practices Demonstrated

- **Infrastructure as Code** — Terraform provisions VCN, subnet, firewall, VM, and reserved IP
- **Configuration as Code** — Ansible configures the entire server (Node.js, Nginx, PM2, Certbot)
- **CI/CD Pipeline** — GitHub Actions runs tests and security scan on every PR, deploys on merge to main
- **Security scanning** — Trivy scans dependencies for CVEs, blocks merge on CRITICAL findings
- **Zero-downtime deploys** — PM2 reload keeps the backend serving traffic during restarts
- **Automated HTTPS** — Certbot obtains and auto-renews Let's Encrypt certificates
- **Security hardening** — UFW firewall, non-root deploy user, rate limiting, input validation, XSS prevention
- **Observability** — Health check endpoints, PM2 process monitoring, structured request logging
- **GitOps workflow** — Branch protection, required CI checks, PR-based deployments

---

## Local Development

```bash
# One-time setup
bash scripts/setup.sh

# Terminal 1 — backend
cd backend && npm run dev
# Runs on http://localhost:3000

# Terminal 2 — frontend
cd frontend && npm run dev
# Runs on http://localhost:5173
```

---

## API Endpoints
GET  /health                              liveness check
GET  /health/ready                        readiness check (tests DB connection)
GET  /api/projects                        all projects
GET  /api/projects/:id                    single project
GET  /api/blog                            all blog posts (no content — list view)
GET  /api/blog/:slug                      single post with full content
GET  /api/blog/:slug/comments             approved comments for a post
POST /api/blog/:slug/comments             submit a comment (requires moderation)
GET  /api/blog/:slug/likes                like count + whether you liked it
POST /api/blog/:slug/like                 toggle like (IP-based deduplication)
POST /api/contact                         contact form submission
GET  /api/admin/messages?secret=          view contact submissions (protected)
GET  /api/admin/comments?secret=          moderate blog comments (protected)
GET  /api/admin/likes?secret=             view like counts (protected)

---

## Infrastructure

Provisioned with Terraform — see `infra/terraform/`
Oracle Cloud — uk-london-1
├── VCN: 10.0.0.0/16
├── Public Subnet: 10.0.1.0/24
├── Internet Gateway
├── Security List: ports 22, 80, 443
├── VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
│     Ubuntu 24.04 — Always Free
└── Reserved Public IP: 145.241.215.190

Configured with Ansible — see `infra/ansible/`
Roles:
├── common   — system update, UFW firewall, deploy user
├── node     — Node.js 20 via NodeSource
├── app      — clone repo, .env, npm install, build frontend
├── pm2      — process manager, auto-start on reboot
├── nginx    — reverse proxy, static file serving
└── certbot  — Let's Encrypt SSL, auto-renewal

---

## CI/CD Pipeline
Pull Request opened
│
├── job: test
│     └── npm test (Jest — 15 tests)
│
├── job: lint
│     └── ESLint frontend
│
└── job: security-scan (needs: test)
└── Trivy filesystem scan
└── blocks on CRITICAL/HIGH CVEs
Merge to main
│
└── job: deploy
├── SSH into Oracle VM
├── git pull origin main
├── npm ci (backend)
├── npm ci && npm run build (frontend)
├── pm2 reload portfolio-backend
└── curl /health → must return 200

---

## Documentation

| File | Contents |
|------|----------|
| `docs/00-CONCEPTS.md` | Foundational concepts — read before touching code |
| `docs/COMPLETE-GUIDE.md` | Full setup guide: local → GitHub → Docker → OCI |
| `docs/INTERVIEW-QUESTIONS.md` | 25 Q&A pairs for interview preparation |
| `docs/PROJECT-SUMMARY.md` | Architecture decisions and build story |
| `infra/terraform/` | Terraform files for OCI infrastructure |
| `infra/ansible/` | Ansible playbooks and roles |

---

## Security

- Non-root `deploy` user runs the application
- UFW firewall — only ports 22, 80, 443 open
- Rate limiting — 100 req/15min general, 5 req/hour contact form
- Input validation and XSS sanitization on all user inputs
- Secrets in environment variables only — never in code
- Trivy CVE scanning blocks vulnerable dependencies from deploying
- HTTPS enforced — HTTP redirects to HTTPS via Nginx
- Admin endpoints protected by secret key

