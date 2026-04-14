/**
 * app/database.js — Database Setup
 *
 * CONCEPT: This file handles everything related to the database:
 * - Creating the connection
 * - Creating tables if they don't exist
 * - Exporting the db object for routers to use
 *
 * WHY better-sqlite3 INSTEAD OF sqlite3?
 * better-sqlite3 uses synchronous (blocking) API.
 * This sounds bad but for SQLite it is actually better:
 * - SQLite only handles one write at a time anyway
 * - Synchronous code is simpler and less error-prone
 * - No callback hell or promise chains for simple queries
 *
 * CONCEPT — Synchronous vs Asynchronous:
 * Synchronous: code waits for operation to finish before continuing
 * Asynchronous: code continues while operation runs in background
 * For a simple portfolio with low traffic, sync SQLite is perfect.
 */

const Database = require('better-sqlite3')
const path = require('path')

// Build the absolute path to the database file
// WHY path.resolve: Relative paths behave differently depending
// on where you run the script from. Absolute paths always work.
const DB_PATH = path.resolve(process.env.DB_PATH || './database.db')

// Create (or open existing) database connection
// { verbose: console.log } logs every SQL query in development
// Remove verbose in production
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? null : null
})

/**
 * initializeDatabase()
 *
 * Creates tables if they don't already exist.
 * Safe to run every time the server starts — IF NOT EXISTS
 * means it won't fail or duplicate data if tables already exist.
 *
 * CONCEPT — SQL CREATE TABLE:
 * INTEGER PRIMARY KEY AUTOINCREMENT → auto-generates id (1, 2, 3...)
 * TEXT NOT NULL → required string field
 * TEXT → optional string field
 * INTEGER DEFAULT 1 → number with default value
 * DATETIME DEFAULT CURRENT_TIMESTAMP → auto-set to now
 */
function initializeDatabase () {
  // Enable WAL mode — Write-Ahead Logging
  // WHY: Makes SQLite much faster for concurrent reads
  // and more resilient to crashes
  db.pragma('journal_mode = WAL')

  // Enable foreign keys — SQLite has them disabled by default!
  db.pragma('foreign_keys = ON')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      tags        TEXT    NOT NULL,   -- stored as JSON string
      github_url  TEXT,
      live_url    TEXT,
      category    TEXT    NOT NULL,
      featured    INTEGER DEFAULT 0,  -- 0 = false, 1 = true
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      slug        TEXT    NOT NULL UNIQUE,  -- URL-friendly title
      excerpt     TEXT    NOT NULL,
      content     TEXT    NOT NULL,
      tags        TEXT    NOT NULL,   -- stored as JSON string
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
  `)

  // Seed data — only insert if tables are empty
  seedProjects()
  seedBlogPosts()

  console.log(`📦 Database initialized at: ${DB_PATH}`)
}

/**
 * Seed projects — sample data for development
 *
 * CONCEPT — Seeding:
 * Seeding means inserting initial data into the database.
 * We check if data exists first to avoid duplicates.
 */
function seedProjects () {
  const count = db.prepare('SELECT COUNT(*) as count FROM projects').get()
  if (count.count > 0) return // already seeded

  const insert = db.prepare(`
    INSERT INTO projects (title, description, tags, github_url, live_url, category, featured)
    VALUES (@title, @description, @tags, @github_url, @live_url, @category, @featured)
  `)

  // db.transaction() wraps multiple inserts in one transaction
  // WHY: Much faster — SQLite commits once instead of per-row
  const insertMany = db.transaction((projects) => {
    for (const project of projects) insert.run(project)
  })

  insertMany([
    {
      title: 'Portfolio Website',
      description: 'This portfolio site — built with React, Node.js, and deployed with Docker and GitHub Actions CI/CD pipeline.',
      tags: JSON.stringify(['React', 'Node.js', 'Docker', 'GitHub Actions', 'Nginx']),
      github_url: 'https://github.com/yourusername/portfolio',
      live_url: 'https://uvereann.name.ng',
      category: 'DevOps',
      featured: 1
    },
    {
      title: 'CI/CD Pipeline with GitHub Actions',
      description: 'Automated pipeline covering test, security scanning with Trivy, Docker build and push, and deployment via SSH.',
      tags: JSON.stringify(['GitHub Actions', 'Docker', 'Trivy', 'CI/CD', 'Security']),
      github_url: 'https://github.com/yourusername/cicd-demo',
      live_url: null,
      category: 'CI/CD',
      featured: 1
    },
    {
      title: 'Containerised Node.js API',
      description: 'Production-ready Express API with multi-stage Docker build, non-root user, health checks, and rate limiting.',
      tags: JSON.stringify(['Node.js', 'Docker', 'Express', 'Security', 'REST API']),
      github_url: 'https://github.com/yourusername/node-api',
      live_url: null,
      category: 'Backend',
      featured: 0
    },
    {
      title: 'Infrastructure as Code with Terraform',
      description: 'GCP infrastructure provisioned with Terraform — Compute Engine, VPC, firewall rules, and static IP.',
      tags: JSON.stringify(['Terraform', 'GCP', 'IaC', 'Cloud']),
      github_url: 'https://github.com/yourusername/terraform-gcp',
      live_url: null,
      category: 'Cloud',
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
      excerpt: 'Kubernetes is powerful, but it is overkill for a solo portfolio. Here is my reasoning and what I would use instead.',
      content: `# Why I Chose Docker Compose Over Kubernetes

When I started building this portfolio, I considered running a full Kubernetes cluster.
k3s makes it accessible, and ArgoCD for GitOps looked impressive.

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
- A single \`docker compose up\` to run everything
- A YAML file that documents my entire stack

That is it. Simple, effective, explainable.

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
almost certainly seen this error:

\`\`\`
Access to fetch at 'http://localhost:3000' from origin
'http://localhost:5173' has been blocked by CORS policy
\`\`\`

## What is Actually Happening

Your browser enforces a rule called the Same-Origin Policy.
An "origin" is protocol + domain + port. Two URLs are different
origins if ANY of those three differ.

localhost:3000 and localhost:5173 are different origins.

The browser blocks the request to protect you from malicious
websites making API calls on your behalf.

## The Fix

On the backend, add the CORS middleware and specify which
origins are allowed:

\`\`\`javascript
app.use(cors({
  origin: 'http://localhost:5173'
}))
\`\`\`

This adds a header to every response:
\`Access-Control-Allow-Origin: http://localhost:5173\`

The browser sees this header and allows the request.

## In Production

Change the allowed origin to your real domain:
\`\`\`
ALLOWED_ORIGIN=https://uvereann.name.ng
\`\`\``,
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

1. \`main\` is always deployable
2. Never commit directly to \`main\`
3. Create a branch for every change
4. Open a Pull Request
5. Automated tests must pass
6. Merge to main → triggers automatic deployment

## Branch Names

\`\`\`
feature/add-contact-page
fix/mobile-nav-overflow
chore/update-dependencies
docs/add-setup-guide
\`\`\`

## Why This Matters in Interviews

Interviewers ask about branching strategies. Knowing the
tradeoffs between GitFlow and GitHub Flow shows you understand
that engineering decisions are contextual — not one-size-fits-all.`,
      tags: JSON.stringify(['Git', 'GitHub', 'DevOps', 'Workflow']),
      published: 1
    }
  ])
}

module.exports = { db, initializeDatabase }
