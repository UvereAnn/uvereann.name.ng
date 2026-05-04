/**
 * app/routers/admin.js — Integrated Admin Panel
 *
 * FEATURES:
 * - Tabbed navigation (Messages, Comments, Likes)
 * - Comment moderation (Approve/Delete)
 * - Security: Secret-key required via query param (?secret=...)
 * - IP tracking for messages
 *  ACCESS:
 * /api/admin/messages?secret=YOUR_SECRET   → contact messages
 * /api/admin/comments?secret=YOUR_SECRET   → pending comments
 * /api/admin/comments/:id/approve?secret=  → approve a comment
 * /api/admin/comments/:id/delete?secret=   → delete a comment
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
  .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2130; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead { background: #111118; }
  th { text-align: left; padding: 11px 16px; color: #718096; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e2130; white-space: nowrap; }
  td { padding: 13px 16px; vertical-align: top; border-bottom: 1px solid #13141f; color: #e2e8f0; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(110,231,183,0.02); }
  .empty { text-align: center; padding: 60px; color: #4a5568; }
  .footer { margin-top: 20px; color: #4a5568; font-size: 11px; font-family: monospace; }
  .btn { padding: 4px 12px; border-radius: 5px; font-size: 12px; text-decoration: none; border: 1px solid; cursor: pointer; display: inline-block; }
  .btn-green { color: #6ee7b7; border-color: rgba(110,231,183,0.4); background: rgba(110,231,183,0.08); }
  .btn-red   { color: #f87171; border-color: rgba(248,113,113,0.4); background: rgba(248,113,113,0.08); }
`

function layout(title, content, activeTab, secret) {
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
        ${c.approved === 0 ? `<a href="/api/admin/comments/${c.id}/approve?secret=${req.query.secret}" class="btn btn-green">Approve</a> ` : ''}
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

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  } catch { return dateStr }
}

module.exports = router