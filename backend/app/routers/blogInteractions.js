/**
 * app/routers/blogInteractions.js — Comments & Likes
 *
 * ENDPOINTS:
 *   GET  /api/blog/:slug/comments       → get all comments for a post
 *   POST /api/blog/:slug/comments       → add a comment
 *   POST /api/blog/:slug/like           → toggle like (add or remove)
 *   GET  /api/blog/:slug/likes          → get like count
 *
 * CONCEPT — Likes with IP tracking:
 * We store the IP address with each like so one person cannot
 * like a post 1000 times. On the second like from the same IP,
 * we remove the like (toggle). This is simple and free.
 *
 * CONCEPT — Comments moderation:
 * Comments are stored with approved = 0 by default.
 * You approve them via the admin panel so spam does not
 * appear publicly. Only approved comments are returned.
 */

const express = require('express')
const { body, validationResult } = require('express-validator')
const { db } = require('../database')

const router = express.Router({ mergeParams: true })
// mergeParams: true lets us access :slug from the parent router

// ─── Comment Validation ───────────────────────────────────────

const commentValidation = [
  body('author_name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters')
    .escape(),

  body('author_email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 254 }),

  body('content')
    .trim()
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ min: 3, max: 1000 }).withMessage('Comment must be 3–1000 characters')
    .escape()
]

// ─── GET comments for a post ──────────────────────────────────

router.get('/comments', (req, res) => {
  const { slug } = req.params

  // Get the post id from slug first
  const post = db.prepare(
    'SELECT id FROM blog_posts WHERE slug = ? AND published = 1'
  ).get(slug)

  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }

  // Only return approved comments publicly
  const comments = db.prepare(`
    SELECT id, author_name, content, created_at
    FROM blog_comments
    WHERE post_id = ? AND approved = 1
    ORDER BY created_at ASC
  `).all(post.id)

  res.json({
    data: comments,
    total: comments.length
  })
})

// ─── POST a new comment ───────────────────────────────────────

router.post('/comments', commentValidation, (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    })
  }

  const { slug } = req.params
  const { author_name, author_email, content } = req.body
  const ipAddress = req.ip || req.connection.remoteAddress

  // Verify the post exists
  const post = db.prepare(
    'SELECT id FROM blog_posts WHERE slug = ? AND published = 1'
  ).get(slug)

  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }

  try {
    const result = db.prepare(`
      INSERT INTO blog_comments (post_id, author_name, author_email, content, ip_address, approved)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(post.id, author_name, author_email || null, content, ipAddress)

    console.log(`💬 New comment on post ${slug} from ${author_name} — id: ${result.lastInsertRowid}`)

    // approved = 0 means it awaits your approval in the admin panel
    res.status(201).json({
      success: true,
      message: 'Comment submitted! It will appear after review.'
    })
  } catch (err) {
    console.error('Failed to save comment:', err.message)
    res.status(500).json({ error: 'Failed to submit comment. Try again later.' })
  }
})

// ─── GET like count for a post ────────────────────────────────

router.get('/likes', (req, res) => {
  const { slug } = req.params

  const post = db.prepare(
    'SELECT id FROM blog_posts WHERE slug = ? AND published = 1'
  ).get(slug)

  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }

  const result = db.prepare(
    'SELECT COUNT(*) as count FROM blog_likes WHERE post_id = ?'
  ).get(post.id)

  // Check if this IP has liked the post (to show liked state in UI)
  const ipAddress = req.ip || req.connection.remoteAddress
  const userLiked = db.prepare(
    'SELECT id FROM blog_likes WHERE post_id = ? AND ip_address = ?'
  ).get(post.id, ipAddress)

  res.json({
    count: result.count,
    liked: !!userLiked  // true if current IP has liked
  })
})

// ─── POST toggle like ─────────────────────────────────────────

router.post('/like', (req, res) => {
  const { slug } = req.params
  const ipAddress = req.ip || req.connection.remoteAddress

  const post = db.prepare(
    'SELECT id FROM blog_posts WHERE slug = ? AND published = 1'
  ).get(slug)

  if (!post) {
    return res.status(404).json({ error: 'Post not found' })
  }

  // Check if this IP already liked this post
  const existing = db.prepare(
    'SELECT id FROM blog_likes WHERE post_id = ? AND ip_address = ?'
  ).get(post.id, ipAddress)

  if (existing) {
    // Already liked — remove the like (toggle off)
    db.prepare('DELETE FROM blog_likes WHERE id = ?').run(existing.id)
    const count = db.prepare('SELECT COUNT(*) as count FROM blog_likes WHERE post_id = ?').get(post.id)
    return res.json({ liked: false, count: count.count })
  } else {
    // Not liked yet — add the like (toggle on)
    db.prepare(
      'INSERT INTO blog_likes (post_id, ip_address) VALUES (?, ?)'
    ).run(post.id, ipAddress)
    const count = db.prepare('SELECT COUNT(*) as count FROM blog_likes WHERE post_id = ?').get(post.id)
    return res.json({ liked: true, count: count.count })
  }
})

module.exports = router