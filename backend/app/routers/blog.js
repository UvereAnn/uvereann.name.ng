/**
 * app/routers/blog.js — Blog API
 *
 * Similar structure to projects router.
 * Demonstrates accessing by both ID and slug.
 *
 * CONCEPT — URL Slugs:
 * A slug is a URL-friendly version of a title.
 * "Why CORS Confuses Everyone" → "why-cors-confuses-everyone"
 * Slugs are better than IDs in URLs because:
 * - They are readable and memorable
 * - Better for SEO
 * - Don't expose your database structure
 */

const express = require('express')
const { db } = require('../database')

const router = express.Router()

function parsePost (post, includeContent = false) {
  const parsed = {
    ...post,
    tags: JSON.parse(post.tags),
    published: post.published === 1
  }
  // Don't send full content in list view — saves bandwidth
  if (!includeContent) {
    delete parsed.content
  }
  return parsed
}

/**
 * GET /api/blog
 * Returns all published posts WITHOUT content (just metadata)
 *
 * WHY NO CONTENT IN LIST:
 * If you have 20 blog posts each with 2000 words, returning
 * all content in the list would send 40,000 words over the
 * network. Instead we return just title, excerpt, tags.
 * The full content is only loaded when viewing a single post.
 * This pattern is called "list vs detail" or "summary vs full".
 */
router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT id, title, slug, excerpt, tags, published, created_at
    FROM blog_posts
    WHERE published = 1
    ORDER BY created_at DESC
  `).all()

  res.json({
    data: posts.map(p => parsePost(p, false)),
    total: posts.length
  })
})

/**
 * GET /api/blog/:identifier
 * Accepts both numeric ID and slug
 *
 * Examples:
 *   GET /api/blog/1
 *   GET /api/blog/understanding-cors
 */
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params
  const isNumericId = /^\d+$/.test(identifier)

  let post
  if (isNumericId) {
    post = db.prepare('SELECT * FROM blog_posts WHERE id = ? AND published = 1').get(parseInt(identifier, 10))
  } else {
    post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').get(identifier)
  }

  if (!post) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Blog post "${identifier}" does not exist`
    })
  }

  // Return full content for single post view
  res.json({ data: parsePost(post, true) })
})

module.exports = router
