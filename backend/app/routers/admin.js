/**
 * app/routers/admin.js — Integrated Admin Panel
 *
 * FEATURES:
 * - Tabbed navigation (Messages, Comments, Likes, Blog)
 * - Comment moderation (Approve/Delete)
 * - Blog post management (Create, Edit, Delete, Publish/Unpublish)
 * - Security: Secret-key required via query param (?secret=...)
 * - IP tracking for messages
 *
 * ACCESS:
 * /api/admin/messages?secret=              → contact messages
 * /api/admin/comments?secret=              → pending comments
 * /api/admin/comments/:id/approve?secret=  → approve a comment
 * /api/admin/comments/:id/delete?secret=   → delete a comment
 * /api/admin/likes?secret=                 → likes overview
 * /api/admin/blog?secret=                  → all blog posts
 * /api/admin/blog/new?secret=              → write new post form
 * /api/admin/blog/:id/edit?secret=         → edit post form
 * /api/admin/blog/:id/delete?secret=       → delete post
 * /api/admin/blog/:id/toggle?secret=       → publish/unpublish
 */

const express = require('express')
const { db } = require('../database')

const router = express.Router()

// ─── AUTH MIDDLEWARE ────────────────────────────────────────────────────────

router.use((req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret = req.query.secret

  if (!adminSecret) {
    return res.status(503).send('<h2>Admin not configured</h2><p>Set ADMIN_SECRET in environment variables.</p>')
  }

  if (!providedSecret || providedSecret !== adminSecret) {
    console.warn(`⚠️ Unauthorized admin access attempt from IP: ${req.ip}`)
    return res.status(401).send(`
      <!DOCTYPE html><html>
      <head><title>401</title></head>
      <body style="font-family:monospace;padding:40px;background:#0a0a0f;color:#f87171;">
        <h2>401 — Unauthorized</h2><p>Invalid or missing secret.</p>
      </body></html>
    `)
  }
  next()
})

// ─── SHARED UI COMPONENTS ───────────────────────────────────────────────────

const sharedStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px 24px; min-height: 100vh; }
  h1 { font-size: 1.4rem; color: #6ee7b7; font-weight: 700; margin-bottom: 4px; }
  .subtitle { color: #718096; font-size: 13px; margin-bottom: 28px; }
  .nav { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
  .nav a { padding: 7px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; border: 1px solid #2a2a38; color: #a0aec0; transition: all 0.2s; }
  .nav a:hover, .nav a.active { border-color: #6ee7b7; color: #6ee7b7; background: rgba(110,231,183,0.08); }
  .badge { background: rgba(110,231,183,0.1); color: #6ee7b7; border: 1px solid rgba(110,231,183,0.3); padding: 3px 12px; border-radius: 99px; font-size: 12px; font-family: monospace; }
  .badge-warn { background: rgba(251,191,36,0.1); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
  .badge-draft { background: rgba(139,148,158,0.1); color: #8b949e; border-color: rgba(139,148,158,0.3); }
  .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2130; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead { background: #111118; }
  th { text-align: left; padding: 11px 16px; color: #718096; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e2130; white-space: nowrap; }
  td { padding: 13px 16px; vertical-align: top; border-bottom: 1px solid #13141f; color: #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(110,231,183,0.02); }
  .empty { text-align: center; padding: 60px; color: #4a5568; }
  .footer { margin-top: 20px; color: #4a5568; font-size: 11px; font-family: monospace; }
  .btn { padding: 4px 12px; border-radius: 5px; font-size: 12px; text-decoration: none; border: 1px solid; cursor: pointer; display: inline-block; margin-right: 4px; }
  .btn-green  { color: #6ee7b7; border-color: rgba(110,231,183,0.4); background: rgba(110,231,183,0.08); }
  .btn-red    { color: #f87171; border-color: rgba(248,113,113,0.4); background: rgba(248,113,113,0.08); }
  .btn-yellow { color: #fbbf24; border-color: rgba(251,191,36,0.4);  background: rgba(251,191,36,0.08);  }
  .btn-blue   { color: #79c0ff; border-color: rgba(121,192,255,0.4); background: rgba(121,192,255,0.08); }
  .btn-primary { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; background: #6ee7b7; color: #0a0a0f; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
  .btn-primary:hover { opacity: 0.85; }
  .form-group { margin-bottom: 20px; }
  .form-group label { display: block; font-size: 12px; color: #8b949e; margin-bottom: 6px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.05em; }
  .form-control { width: 100%; background: #111118; border: 1px solid #2a2a38; color: #e2e8f0; padding: 10px 14px; border-radius: 8px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .form-control:focus { border-color: #6ee7b7; }
  textarea.form-control { resize: vertical; min-height: 300px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; }
  .form-card { background: #111118; border: 1px solid #1e2130; border-radius: 12px; padding: 28px; max-width: 860px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .help-text { font-size: 11px; color: #4a5568; margin-top: 4px; font-family: monospace; }
  .alert-success { background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2); color: #6ee7b7; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
  .alert-error { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: #f87171; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
`

function layout (title, content, activeTab, secret) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin — ${title}</title>
      <style>${sharedStyles}</style>
    </head>
    <body>
      <h1>📬 Admin Panel</h1>
      <p class="subtitle">uvereann.name.ng</p>

      <div class="nav">
        <a href="/api/admin/messages?secret=${secret}" class="${activeTab === 'messages' ? 'active' : ''}">📬 Messages</a>
        <a href="/api/admin/comments?secret=${secret}" class="${activeTab === 'comments' ? 'active' : ''}">💬 Comments</a>
        <a href="/api/admin/likes?secret=${secret}"    class="${activeTab === 'likes'    ? 'active' : ''}">❤️ Likes</a>
        <a href="/api/admin/blog?secret=${secret}"     class="${activeTab === 'blog'     ? 'active' : ''}">✍️ Blog</a>
      </div>

      ${content}

      <p class="footer">Generated at ${new Date().toISOString()}</p>
    </body>
    </html>
  `
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// 1. Contact Messages View
router.get('/messages', (req, res) => {
  const messages = db.prepare(`
    SELECT id, name, email, subject, message, ip_address, created_at
    FROM contact_messages ORDER BY created_at DESC
  `).all()

  const rows = messages.map(m => `
    <tr>
      <td>${m.id}</td>
      <td><strong>${esc(m.name)}</strong><br><a href="mailto:${esc(m.email)}" style="color:#6ee7b7;font-size:13px">${esc(m.email)}</a></td>
      <td style="color:#a0aec0;font-size:13px">${esc(m.subject || '—')}</td>
      <td style="max-width:380px;white-space:pre-wrap;font-size:13px;line-height:1.6">${esc(m.message)}</td>
      <td style="color:#718096;font-size:12px;white-space:nowrap">${fmt(m.created_at)}</td>
      <td style="color:#4a5568;font-size:11px;">${esc(m.ip_address || '—')}</td>
    </tr>
  `).join('')

  const content = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <span style="font-size:14px;color:#a0aec0">Contact Messages</span>
      <span class="badge">${messages.length} total</span>
    </div>
    ${messages.length === 0
      ? '<div class="empty">📭 No messages yet.</div>'
      : `<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>From</th><th>Subject</th><th>Message</th><th>Date</th><th>IP</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`
    }
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('Messages', content, 'messages', req.query.secret))
})

// 2. Comments Moderation View
router.get('/comments', (req, res) => {
  const comments = db.prepare(`
    SELECT c.id, c.author_name, c.author_email, c.content, c.approved, c.created_at,
           p.title as post_title
    FROM blog_comments c
    JOIN blog_posts p ON p.id = c.post_id
    ORDER BY c.approved ASC, c.created_at DESC
  `).all()

  const pendingCount = comments.filter(c => c.approved === 0).length

  const rows = comments.map(c => `
    <tr>
      <td>${c.id}</td>
      <td style="font-size:12px;color:#6ee7b7">${esc(c.post_title)}</td>
      <td><strong>${esc(c.author_name)}</strong>${c.author_email ? `<br><span style="font-size:12px;color:#718096">${esc(c.author_email)}</span>` : ''}</td>
      <td style="max-width:320px;font-size:13px;line-height:1.6">${esc(c.content)}</td>
      <td>${c.approved ? '<span class="badge">Approved</span>' : '<span class="badge badge-warn">Pending</span>'}</td>
      <td style="color:#718096;font-size:12px;white-space:nowrap">${fmt(c.created_at)}</td>
      <td style="white-space:nowrap">
        ${c.approved === 0 ? `<a href="/api/admin/comments/${c.id}/approve?secret=${req.query.secret}" class="btn btn-green">Approve</a>` : ''}
        <a href="/api/admin/comments/${c.id}/delete?secret=${req.query.secret}" class="btn btn-red" onclick="return confirm('Delete?')">Delete</a>
      </td>
    </tr>
  `).join('')

  const content = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <span style="font-size:14px;color:#a0aec0">Blog Comments</span>
      <div style="display:flex;gap:8px">
        <span class="badge badge-warn">${pendingCount} pending</span>
        <span class="badge">${comments.length} total</span>
      </div>
    </div>
    ${comments.length === 0 ? '<div class="empty">💬 No comments yet.</div>' : `<div class="table-wrap"><table>
      <thead><tr><th>#</th><th>Post</th><th>Author</th><th>Comment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`}
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('Comments', content, 'comments', req.query.secret))
})

// 3. Likes Overview
router.get('/likes', (req, res) => {
  const likes = db.prepare(`
    SELECT p.title, p.slug, COUNT(l.id) as like_count
    FROM blog_posts p
    LEFT JOIN blog_likes l ON l.post_id = p.id
    WHERE p.published = 1
    GROUP BY p.id ORDER BY like_count DESC
  `).all()

  const rows = likes.map(l => `
    <tr>
      <td>${esc(l.title)}</td>
      <td><span style="font-family:monospace;font-size:12px;color:#6ee7b7">${esc(l.slug)}</span></td>
      <td><span class="badge">${l.like_count} ❤️</span></td>
    </tr>
  `).join('')

  const content = `
    <div style="margin-bottom:16px"><span style="font-size:14px;color:#a0aec0">Blog Post Likes</span></div>
    ${likes.length === 0 ? '<div class="empty">❤️ No likes yet.</div>' : `<div class="table-wrap"><table>
      <thead><tr><th>Post</th><th>Slug</th><th>Likes</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`}
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('Likes', content, 'likes', req.query.secret))
})

// 4. Blog Posts List
router.get('/blog', (req, res) => {
  const posts = db.prepare(`
    SELECT id, title, slug, published, created_at
    FROM blog_posts
    ORDER BY created_at DESC
  `).all()

  const rows = posts.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>
        <strong style="font-size:14px">${esc(p.title)}</strong>
      </td>
      <td>
        <span style="font-family:monospace;font-size:12px;color:#6ee7b7">
          ${esc(p.slug)}
        </span>
      </td>
      <td>
        ${p.published
          ? '<span class="badge">Published</span>'
          : '<span class="badge badge-draft">Draft</span>'
        }
      </td>
      <td style="color:#718096;font-size:12px;white-space:nowrap">
        ${fmt(p.created_at)}
      </td>
      <td style="white-space:nowrap">
        <a href="/api/admin/blog/${p.id}/edit?secret=${req.query.secret}"
           class="btn btn-blue">Edit</a>
        <a href="/api/admin/blog/${p.id}/toggle?secret=${req.query.secret}"
           class="btn btn-yellow">
          ${p.published ? 'Unpublish' : 'Publish'}
        </a>
        <a href="/api/admin/blog/${p.id}/delete?secret=${req.query.secret}"
           class="btn btn-red"
           onclick="return confirm('Delete this post permanently?')">Delete</a>
      </td>
    </tr>
  `).join('')

  const content = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <span style="font-size:14px;color:#a0aec0">Blog Posts</span>
      <a href="/api/admin/blog/new?secret=${req.query.secret}" class="btn-primary">
        + New Post
      </a>
    </div>
    ${posts.length === 0
      ? '<div class="empty">✍️ No posts yet. <a href="/api/admin/blog/new?secret=' + req.query.secret + '" style="color:#6ee7b7">Write your first post</a></div>'
      : `<div class="table-wrap"><table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table></div>`
    }
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('Blog', content, 'blog', req.query.secret))
})

// 5. New Post Form — GET
router.get('/blog/new', (req, res) => {
  const content = `
    <div style="margin-bottom:20px">
      <a href="/api/admin/blog?secret=${req.query.secret}"
         style="color:#8b949e;text-decoration:none;font-size:13px;font-family:monospace">
        ← Back to posts
      </a>
    </div>
    <h2 style="font-size:1.2rem;color:#e2e8f0;margin-bottom:24px">New Blog Post</h2>
    <div class="form-card">
      <form method="POST" action="/api/admin/blog/new?secret=${req.query.secret}">

        <div class="form-row">
          <div class="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              class="form-control"
              placeholder="My awesome post"
              required
              oninput="generateSlug(this.value)"
            />
          </div>
          <div class="form-group">
            <label>Slug *</label>
            <input
              type="text"
              name="slug"
              id="slug"
              class="form-control"
              placeholder="my-awesome-post"
              required
            />
            <p class="help-text">URL-friendly version of title. Auto-generated, editable.</p>
          </div>
        </div>

        <div class="form-group">
          <label>Excerpt *</label>
          <input
            type="text"
            name="excerpt"
            class="form-control"
            placeholder="A short summary shown in the blog list..."
            required
          />
          <p class="help-text">Shown on the blog listing page. Keep it under 200 characters.</p>
        </div>

        <div class="form-group">
          <label>Content * (Markdown supported)</label>
          <textarea
            name="content"
            class="form-control"
            placeholder="# My Post Title

Write your content here...

## Section Heading

Your paragraph text goes here.

## Another Section

More content..."
            required
          ></textarea>
          <p class="help-text">
            Supports: # Heading, ## Subheading, **bold**, paragraph text.
            Each line renders as a paragraph.
          </p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              class="form-control"
              placeholder="DevOps, Docker, CI/CD"
            />
            <p class="help-text">e.g. DevOps, Terraform, OCI</p>
          </div>
          <div class="form-group">
            <label>Publish immediately?</label>
            <select name="published" class="form-control">
              <option value="1">Yes — publish now</option>
              <option value="0">No — save as draft</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <button type="submit" class="btn-primary">Save Post</button>
          <a href="/api/admin/blog?secret=${req.query.secret}"
             style="color:#8b949e;text-decoration:none;font-size:13px">
            Cancel
          </a>
        </div>
      </form>
    </div>

    <script>
      function generateSlug(title) {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\\s-]/g, '')
          .replace(/\\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        document.getElementById('slug').value = slug
      }
    </script>
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('New Post', content, 'blog', req.query.secret))
})

// 6. New Post Form — POST (save)
router.post('/blog/new', express.urlencoded({ extended: true }), (req, res) => {
  const { title, slug, excerpt, content, tags, published } = req.body

  // Basic validation
  if (!title || !slug || !excerpt || !content) {
    const errorContent = `
      <div class="alert-error">All required fields must be filled in.</div>
      <a href="/api/admin/blog/new?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
    `
    return res.send(layout('Error', errorContent, 'blog', req.query.secret))
  }

  // Parse tags — convert "DevOps, Docker, CI/CD" to JSON array
  const tagsArray = tags
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  try {
    // Check if slug already exists
    const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug)
    if (existing) {
      const errorContent = `
        <div class="alert-error">
          A post with slug "${esc(slug)}" already exists. Choose a different slug.
        </div>
        <a href="/api/admin/blog/new?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
      `
      return res.send(layout('Error', errorContent, 'blog', req.query.secret))
    }

    db.prepare(`
      INSERT INTO blog_posts (title, slug, excerpt, content, tags, published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, slug, excerpt, content, JSON.stringify(tagsArray), parseInt(published) || 0)

    console.log(`✍️  New blog post created: "${title}" (${slug})`)

    // Redirect to blog list with success message
    res.redirect(`/api/admin/blog?secret=${req.query.secret}&msg=created`)
  } catch (err) {
    console.error('Failed to save blog post:', err.message)
    const errorContent = `
      <div class="alert-error">Failed to save post: ${esc(err.message)}</div>
      <a href="/api/admin/blog/new?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
    `
    res.send(layout('Error', errorContent, 'blog', req.query.secret))
  }
})

// 7. Edit Post Form — GET
router.get('/blog/:id/edit', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id)

  if (!post) {
    return res.status(404).send(layout('Not Found',
      '<div class="empty">Post not found.</div>', 'blog', req.query.secret))
  }

  // Parse tags back from JSON for display
  let tagsDisplay = ''
  try {
    const tagsArr = JSON.parse(post.tags)
    tagsDisplay = Array.isArray(tagsArr) ? tagsArr.join(', ') : post.tags
  } catch {
    tagsDisplay = post.tags
  }

  const content = `
    <div style="margin-bottom:20px">
      <a href="/api/admin/blog?secret=${req.query.secret}"
         style="color:#8b949e;text-decoration:none;font-size:13px;font-family:monospace">
        ← Back to posts
      </a>
    </div>
    <h2 style="font-size:1.2rem;color:#e2e8f0;margin-bottom:24px">Edit Post</h2>
    <div class="form-card">
      <form method="POST" action="/api/admin/blog/${post.id}/edit?secret=${req.query.secret}">

        <div class="form-row">
          <div class="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              class="form-control"
              value="${esc(post.title)}"
              required
            />
          </div>
          <div class="form-group">
            <label>Slug *</label>
            <input
              type="text"
              name="slug"
              class="form-control"
              value="${esc(post.slug)}"
              required
            />
            <p class="help-text">Changing the slug will break existing links to this post.</p>
          </div>
        </div>

        <div class="form-group">
          <label>Excerpt *</label>
          <input
            type="text"
            name="excerpt"
            class="form-control"
            value="${esc(post.excerpt)}"
            required
          />
        </div>

        <div class="form-group">
          <label>Content * (Markdown supported)</label>
          <textarea
            name="content"
            class="form-control"
            required
          >${esc(post.content)}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              class="form-control"
              value="${esc(tagsDisplay)}"
            />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="published" class="form-control">
              <option value="1" ${post.published ? 'selected' : ''}>Published</option>
              <option value="0" ${!post.published ? 'selected' : ''}>Draft</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <button type="submit" class="btn-primary">Save Changes</button>
          <a href="/api/admin/blog?secret=${req.query.secret}"
             style="color:#8b949e;text-decoration:none;font-size:13px">
            Cancel
          </a>
        </div>
      </form>
    </div>
  `
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(layout('Edit Post', content, 'blog', req.query.secret))
})

// 8. Edit Post — POST (save changes)
router.post('/blog/:id/edit', express.urlencoded({ extended: true }), (req, res) => {
  const { title, slug, excerpt, content, tags, published } = req.body
  const id = parseInt(req.params.id, 10)

  if (!title || !slug || !excerpt || !content) {
    const errorContent = `
      <div class="alert-error">All required fields must be filled in.</div>
      <a href="/api/admin/blog/${id}/edit?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
    `
    return res.send(layout('Error', errorContent, 'blog', req.query.secret))
  }

  const tagsArray = tags
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  try {
    // Check if new slug conflicts with another post
    const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(slug, id)
    if (existing) {
      const errorContent = `
        <div class="alert-error">
          Slug "${esc(slug)}" is already used by another post.
        </div>
        <a href="/api/admin/blog/${id}/edit?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
      `
      return res.send(layout('Error', errorContent, 'blog', req.query.secret))
    }

    db.prepare(`
      UPDATE blog_posts
      SET title = ?, slug = ?, excerpt = ?, content = ?, tags = ?, published = ?
      WHERE id = ?
    `).run(title, slug, excerpt, content, JSON.stringify(tagsArray), parseInt(published) || 0, id)

    console.log(`✏️  Blog post updated: id ${id} "${title}"`)
    res.redirect(`/api/admin/blog?secret=${req.query.secret}&msg=updated`)
  } catch (err) {
    console.error('Failed to update blog post:', err.message)
    const errorContent = `
      <div class="alert-error">Failed to update post: ${esc(err.message)}</div>
      <a href="/api/admin/blog/${id}/edit?secret=${req.query.secret}" class="btn btn-blue">← Go back</a>
    `
    res.send(layout('Error', errorContent, 'blog', req.query.secret))
  }
})

// 9. Toggle publish/unpublish
router.get('/blog/:id/toggle', (req, res) => {
  const post = db.prepare('SELECT id, published, title FROM blog_posts WHERE id = ?').get(req.params.id)
  if (!post) return res.redirect(`/api/admin/blog?secret=${req.query.secret}`)

  const newState = post.published ? 0 : 1
  db.prepare('UPDATE blog_posts SET published = ? WHERE id = ?').run(newState, post.id)

  console.log(`📝 Blog post "${post.title}" ${newState ? 'published' : 'unpublished'}`)
  res.redirect(`/api/admin/blog?secret=${req.query.secret}`)
})

// 10. Delete post
router.get('/blog/:id/delete', (req, res) => {
  const post = db.prepare('SELECT id, title FROM blog_posts WHERE id = ?').get(req.params.id)
  if (post) {
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(post.id)
    console.log(`🗑️  Blog post deleted: "${post.title}"`)
  }
  res.redirect(`/api/admin/blog?secret=${req.query.secret}`)
})

// ─── ACTION ENDPOINTS ───────────────────────────────────────────────────────

router.get('/comments/:id/approve', (req, res) => {
  db.prepare('UPDATE blog_comments SET approved = 1 WHERE id = ?').run(req.params.id)
  res.redirect(`/api/admin/comments?secret=${req.query.secret}`)
})

router.get('/comments/:id/delete', (req, res) => {
  db.prepare('DELETE FROM blog_comments WHERE id = ?').run(req.params.id)
  res.redirect(`/api/admin/comments?secret=${req.query.secret}`)
})

router.get('/messages.json', (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all()
  res.json({ total: messages.length, data: messages })
})

// ─── HELPERS ────────────────────────────────────────────────────────────────

function esc (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function fmt (dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return dateStr }
}

module.exports = router