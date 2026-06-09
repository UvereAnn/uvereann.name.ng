/**
 * app/database.js
 *
 * CHANGES FROM ORIGINAL:
 * Added two new tables:
 * - blog_comments: stores reader comments (require approval)
 * - blog_likes:    stores one like per IP per post
 *
 * Everything else is identical to your existing database.js
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.resolve(process.env.DB_PATH || './database.db')

const db = new Database(DB_PATH)

function initializeDatabase () {
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      tags        TEXT    NOT NULL,
      github_url  TEXT,
      live_url    TEXT,
      category    TEXT    NOT NULL,
      featured    INTEGER DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      slug        TEXT    NOT NULL UNIQUE,
      excerpt     TEXT    NOT NULL,
      content     TEXT    NOT NULL,
      tags        TEXT    NOT NULL,
      published   INTEGER DEFAULT 1,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      subject    TEXT,
      message    TEXT    NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Blog comments
    -- approved = 0 means pending review (not shown publicly)
    -- approved = 1 means you approved it (shown publicly)
    CREATE TABLE IF NOT EXISTS blog_comments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id      INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      author_name  TEXT    NOT NULL,
      author_email TEXT,
      content      TEXT    NOT NULL,
      ip_address   TEXT,
      approved     INTEGER DEFAULT 0,
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Blog likes — one row per IP per post
    -- To unlike: delete the row
    -- To count likes: COUNT(*) WHERE post_id = ?
    CREATE TABLE IF NOT EXISTS blog_likes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id    INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      ip_address TEXT    NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, ip_address)
    );
  `)

  seedProjects()
  seedBlogPosts()

  console.log(`📦 Database initialized at: ${DB_PATH}`)
}

function seedProjects () {
  const count = db.prepare('SELECT COUNT(*) as count FROM projects').get()
  if (count.count > 0) return

  const insert = db.prepare(`
    INSERT INTO projects (title, description, tags, github_url, live_url, category, featured)
    VALUES (@title, @description, @tags, @github_url, @live_url, @category, @featured)
  `)

  const insertMany = db.transaction((projects) => {
    for (const project of projects) insert.run(project)
  })

  insertMany([
    {
      title: 'DevOps Portfolio Platform',
      description: 'A self-hosting, production-grade web infrastructure project where the portfolio platform is the deployment target. Engineered automated CI/CD pipelines via GitHub Actions to enforce strict GitOps workflows, automated testing, and security gates, routing live production traffic through an Nginx reverse proxy on a hardened cloud instance',
      tags: JSON.stringify(['React', 'Node.js', 'Docker', 'GitHub Actions', 'Nginx', 'PM2', 'Ansible', 'Terraform', 'Oracle Cloud', 'SQLite']),
      github_url: 'https://github.com/UvereAnn/uvereann.name.ng',
      live_url: 'https://uvereann.name.ng',
      category: 'DevOps',
      featured: 1
    },
    {
      title: 'Health Blog',
      description: 'A cloud-native deployment strategy utilizing an automated AWS Fargate infrastructure blueprint. Configured isolated VPC networking, secure private subnets, and an automated rolling-update CD pipeline. Features a sidecar monitoring architecture running Prometheus and Grafana for real-time observability and live traffic load tracking',
      tags: JSON.stringify(['AWS Fargate', 'ECS', 'Terraform', 'Prometheus', 'Grafana', 'Docker Compose', 'AWS RDS', 'GitHub Actions', 'S3 / DynamoDB']),
      github_url: 'https://github.com/UvereAnn/healthmattershub.com',
      live_url: 'https://healthmattershub.com',
      category: 'CI/CD',
      featured: 1
    },
    {
      title: 'Vehicle Registry System',
      description: '"A highly secure, containerized CRUD backend service engineered with runtime stability and perimeter defenses. Implemented multi-stage Docker builds to slash attack surfaces, defensive rate-limiting middleware, systematic liveness/readiness health tracking, and precise SQL data persistence layers.',
      tags: JSON.stringify(['Node.js', 'Express', 'Docker', 'REST API', 'Security', 'SQL', 'Input Validation', 'Rate Limiting']),
      github_url: 'https://github.com/UvereAnn/national_vehicle_registry',
      live_url: 'https://nationalvehicleregistry.com.ng',
      category: 'Backend',
      featured: 1
    },
    {
      title: 'DevSecOps Project',
      description: 'A defensive delivery blueprint focused on shift-left security automation. Built automated pipeline compliance gates that integrate static linting, backend testing suites, and container filesystem vulnerability analysis via Trivy, explicitly blocking staging merges on High or Critical CVE flags.',
      tags: JSON.stringify(['GitHub Actions', 'Docker', 'Trivy', 'CI/CD', 'Security Gates', 'ESLint', 'Jest', 'SSH Deploy']),
      github_url: 'https://github.com/UvereAnn/End-to-End-DevSecOps-Suite',
      live_url: null,
      category: 'CI/CD',
      featured: 0
    },
    {
      title: 'Video to Audio Microservices',
      description: 'A distributed microservice architecture designed to handle decoupled media processing workloads. Utilizes containerized execution layers to securely isolate system workloads, ingest payload data, execute asynchronous conversion scripts, and protect operational runtimes via unprivileged non-root user execution.',
      tags: JSON.stringify(['Node.js', 'Express', 'Docker', 'Microservices', 'REST API', 'Security', 'Linux Runtime']),
      github_url: 'https://github.com/UvereAnn/video-to-audio-microservices',
      live_url: null,
      category: 'Backend',
      featured: 0
    }
  ])
}

function seedBlogPosts () {
  const count = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get()
  if (count.count > 0) return

  const insert = db.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, tags, published)
    VALUES (@title, @slug, @excerpt, @content, @tags, @published)
  `)

  const insertMany = db.transaction((posts) => {
    for (const post of posts) insert.run(post)
  })

  insertMany([
    {
      title: 'Why I Chose Docker Compose Over Kubernetes for My Portfolio',
      slug: 'docker-compose-vs-kubernetes-portfolio',
      excerpt: 'Kubernetes is powerful, but it is overkill for a solo portfolio. Here is my reasoning and what I use instead.',
      content: `# Why I Chose Docker Compose Over Kubernetes

When I started building this portfolio, I considered running a full Kubernetes cluster.
k3s makes it accessible, and ArgoCD for GitOps looked impressive on paper.

But I asked myself: **what problem am I actually solving?**

## The Reality of a Portfolio Site

A portfolio site has maybe 50 visitors per day on a good week.
It runs one frontend container and one backend container.
There is no need to schedule workloads across nodes.
There is no need for horizontal pod autoscaling.

## What I Use Instead

Docker Compose gives me:
- Container isolation
- Reproducible environments
- A single command to run everything
- A YAML file that documents my entire stack

## When I Would Use Kubernetes

If I were deploying a multi-service application with real traffic,
Kubernetes would make sense. The right tool for the right job.`,
      tags: JSON.stringify(['Docker', 'Kubernetes', 'DevOps', 'Architecture']),
      published: 1
    },
    {
      title: 'Understanding CORS: Why Your API Refuses Your Frontend',
      slug: 'understanding-cors',
      excerpt: 'CORS errors are confusing at first. Here is exactly what happens and how to fix it properly.',
      content: `# Understanding CORS

If you have built a frontend and backend separately, you have
almost certainly seen this error in the browser console.

## What is Actually Happening

Your browser enforces a rule called the Same-Origin Policy.
An origin is protocol plus domain plus port. Two URLs are different
origins if ANY of those three differ.

localhost:3000 and localhost:5173 are different origins.

The browser blocks the request to protect you from malicious
websites making API calls on your behalf.

## The Fix

On the backend, add the CORS middleware and specify which
origins are allowed. This adds a header to every response
that the browser checks before allowing the request through.

## In Production

Change the allowed origin to your real domain in your
environment variables. Never use wildcard in production.`,
      tags: JSON.stringify(['CORS', 'Security', 'Node.js', 'Web']),
      published: 1
    },
    {
      title: 'GitHub Flow: The Branching Strategy That Actually Makes Sense',
      slug: 'github-flow-branching-strategy',
      excerpt: 'GitFlow is overkill for most projects. GitHub Flow is simple, effective, and what most teams actually use.',
      content: `# GitHub Flow

There are many branching strategies. GitFlow has develop, release,
hotfix, and feature branches. It was designed for software with
scheduled release cycles.

For a portfolio or most web apps, GitHub Flow is better.

## The Rules

1. main is always deployable
2. Never commit directly to main
3. Create a branch for every change
4. Open a Pull Request
5. Automated tests must pass
6. Merge to main triggers automatic deployment

## Branch Names

feature/add-contact-page
fix/mobile-nav-overflow
chore/update-dependencies
docs/add-setup-guide

## Why This Matters in Interviews

Interviewers ask about branching strategies. Knowing the
tradeoffs between GitFlow and GitHub Flow shows you understand
that engineering decisions are contextual.`,
      tags: JSON.stringify(['Git', 'GitHub', 'DevOps', 'Workflow']),
      published: 1
    }
  ])
}

module.exports = { db, initializeDatabase }