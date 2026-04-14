# uvereann.name.ng — DevOps Portfolio

A portfolio website that IS the DevOps project.

Built with React (frontend) and Node.js/Express (backend).
Demonstrates CI/CD, Docker, security scanning, and cloud deployment.

## Quick Start

```bash
# One-time setup
bash scripts/setup.sh

# Terminal 1: backend
cd backend && npm run dev

# Terminal 2: frontend  
cd frontend && npm run dev

# Open: http://localhost:5173
```

## Documentation

| File | Contents |
|------|----------|
| `docs/00-CONCEPTS.md` | Foundational concepts — read first |
| `docs/COMPLETE-GUIDE.md` | Full step-by-step guide: local → Docker → GCP → production |

## Stack

- **Frontend:** React 18, Vite, TailwindCSS
- **Backend:** Node.js, Express, SQLite
- **CI/CD:** GitHub Actions + Trivy security scanning
- **Containers:** Docker multi-stage builds
- **Hosting:** Vercel (frontend) + Railway (backend) — free tier

## API Endpoints

```
GET  /health           liveness check
GET  /health/ready     readiness check (tests DB)
GET  /api/projects     all projects
GET  /api/projects/:id single project
GET  /api/blog         all blog posts
GET  /api/blog/:slug   single post
POST /api/contact      contact form submission
```
