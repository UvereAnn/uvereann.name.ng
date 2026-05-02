/**
 * app/routers/admin.js — Protected Admin Messages Viewer
 *
 * CONCEPT — Why render HTML from the backend?
 * For a simple admin view, we can generate HTML directly in
 * Node.js instead of building a separate React page.
 * This keeps the admin view completely separate from the
 * public frontend — no React bundle, no extra routes,
 * no risk of exposing it to public users.
 *
 * HOW TO ACCESS:
 * Visit: https://your-backend-url/api/admin/messages?secret=YOUR_ADMIN_SECRET
 *
 * CONCEPT — Query parameter authentication:
 * Not the most secure method (vs JWT tokens or sessions),
 * but perfectly fine for a personal portfolio where you
 * are the only person who needs access. The secret is
 * never in your code — it lives in environment variables.
 *
 * SECURITY:
 * - Wrong secret → 401 Unauthorized (no clue what the correct one is)
 * - No secret    → 401 Unauthorized
 * - Correct secret → see all messages
 * - Secret lives ONLY in .env and Railway env variables
 */

const express = require('express')
const { db } = require('../database')

const router = express.Router()

// ─── Auth Middleware ──────────────────────────────────────────────────────────

/**
 * requireAdminSecret()
 *
 * Checks the ?secret= query parameter against ADMIN_SECRET env var.
 * If wrong or missing, return 401 and stop processing.
 *
 * CONCEPT — Middleware on a specific router:
 * router.use() applies middleware to ALL routes in this router.
 * Every route in admin.js automatically requires the secret.
 * You cannot forget to add the check to a new route.
 */
router.use((req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET
  const providedSecret = req.query.secret

  // If ADMIN_SECRET is not set in .env, block all access
  if (!adminSecret) {
    return res.status(503).send(`
      <h2>Admin not configured</h2>
      <p>Set ADMIN_SECRET in your environment variables.</p>
    `)
  }

  // Compare secrets — reject if missing or wrong
  if (!providedSecret || providedSecret !== adminSecret) {
    // Log the attempt (useful for detecting probing)
    console.warn(`⚠️  Unauthorized admin access attempt from IP: ${req.ip}`)

    // 401 = Unauthorized
    // We give a vague message — don't confirm the route exists
    return res.status(401).send(`
      <!DOCTYPE html>
      <html>
        <head><title>401</title></head>
        <body style="font-family: monospace; padding: 40px; background: #0a0a0f; color: #f87171;">
          <h2>401 — Unauthorized</h2>
          <p>Invalid or missing secret.</p>
        </body>
      </html>
    `)
  }

  // Secret is correct — allow through
  next()
})

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/messages?secret=YOUR_SECRET
 *
 * Returns an HTML page showing all contact form submissions.
 * Most recent first.
 */
router.get('/messages', (req, res) => {
  try {
    // Fetch all messages, newest first
    const messages = db.prepare(`
      SELECT id, name, email, subject, message, ip_address, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `).all()

    const count = messages.length

    // Build the HTML page
    // CONCEPT — Template literals for HTML:
    // We use backtick strings to build HTML with dynamic data.
    // escapeHtml() prevents XSS — if someone put <script> in
    // their message, it displays as text, not executable code.
    const rows = messages.map(msg => `
      <tr>
        <td>${msg.id}</td>
        <td>
          <strong>${escapeHtml(msg.name)}</strong><br>
          <a href="mailto:${escapeHtml(msg.email)}" style="color: #6ee7b7; font-size: 13px;">
            ${escapeHtml(msg.email)}
          </a>
        </td>
        <td style="color: #a0aec0; font-size: 13px;">${escapeHtml(msg.subject || '—')}</td>
        <td style="max-width: 400px; white-space: pre-wrap; font-size: 13px; line-height: 1.6;">
          ${escapeHtml(msg.message)}
        </td>
        <td style="color: #718096; font-size: 12px; white-space: nowrap;">
          ${formatDate(msg.created_at)}
        </td>
        <td style="color: #4a5568; font-size: 11px;">${escapeHtml(msg.ip_address || '—')}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin — Contact Messages</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: #0a0a0f;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 32px 24px;
            min-height: 100vh;
          }

          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 32px;
            flex-wrap: wrap;
            gap: 12px;
          }

          h1 {
            font-size: 1.5rem;
            color: #6ee7b7;
            font-weight: 700;
          }

          .badge {
            background: rgba(110,231,183,0.1);
            color: #6ee7b7;
            border: 1px solid rgba(110,231,183,0.3);
            padding: 4px 14px;
            border-radius: 99px;
            font-size: 13px;
            font-family: monospace;
          }

          .empty {
            text-align: center;
            padding: 80px 20px;
            color: #4a5568;
          }

          .table-wrap {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid #1e2130;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          thead {
            background: #111118;
          }

          th {
            text-align: left;
            padding: 12px 16px;
            color: #718096;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #1e2130;
            white-space: nowrap;
          }

          td {
            padding: 14px 16px;
            vertical-align: top;
            border-bottom: 1px solid #13141f;
            color: #e2e8f0;
          }

          tr:last-child td {
            border-bottom: none;
          }

          tr:hover td {
            background: rgba(110,231,183,0.03);
          }

          a { color: #6ee7b7; }

          .footer {
            margin-top: 24px;
            color: #4a5568;
            font-size: 12px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>📬 Contact Messages</h1>
            <p style="color: #718096; margin-top: 4px; font-size: 13px;">
              uvereann.name.ng — Admin View
            </p>
          </div>
          <span class="badge">${count} message${count !== 1 ? 's' : ''}</span>
        </div>

        ${count === 0 ? `
          <div class="empty">
            <p style="font-size: 2rem; margin-bottom: 12px;">📭</p>
            <p>No messages yet.</p>
          </div>
        ` : `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `}

        <p class="footer">
          Viewing ${count} record${count !== 1 ? 's' : ''} •
          Generated at ${new Date().toISOString()}
        </p>
      </body>
      </html>
    `

    // Send HTML response
    // CONCEPT: res.send() with a string sends it as-is.
    // We set Content-Type so the browser renders it as HTML.
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    console.error('Admin messages error:', err.message)
    res.status(500).send('<h2>Database error</h2><p>' + err.message + '</p>')
  }
})

/**
 * GET /api/admin/messages.json?secret=YOUR_SECRET
 *
 * Same data but as JSON — useful if you want to build
 * something on top of this later.
 */
router.get('/messages.json', (req, res) => {
  try {
    const messages = db.prepare(`
      SELECT id, name, email, subject, message, ip_address, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `).all()

    res.json({
      total: messages.length,
      data: messages
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate (dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

module.exports = router