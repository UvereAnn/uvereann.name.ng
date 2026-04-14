/**
 * app/routers/projects.js — Projects API
 *
 * CONCEPT: A router is a mini Express app that handles
 * a subset of your routes. We mount it in app.js at /api/projects.
 *
 * So inside this file:
 *   router.get('/')    → handles GET /api/projects
 *   router.get('/:id') → handles GET /api/projects/1
 *
 * CONCEPT — Route Parameters:
 * :id is a named parameter. Express captures whatever is in
 * that URL position and puts it in req.params.id.
 * GET /api/projects/3 → req.params.id === '3' (string!)
 *
 * CONCEPT — Query Parameters:
 * ?category=DevOps is a query string.
 * Express puts these in req.query.
 * GET /api/projects?category=DevOps → req.query.category === 'DevOps'
 */

const express = require('express')
const { db } = require('../database')

const router = express.Router()

/**
 * Helper: parse tags from JSON string back to array
 * WHY: SQLite doesn't have an array type, so we store
 * arrays as JSON strings. We parse on every read.
 */
function parseProject (project) {
  return {
    ...project,
    tags: JSON.parse(project.tags),
    featured: project.featured === 1  // convert 0/1 to false/true
  }
}

/**
 * GET /api/projects
 * GET /api/projects?category=DevOps
 * GET /api/projects?featured=true
 *
 * Returns all projects, optionally filtered.
 */
router.get('/', (req, res) => {
  const { category, featured } = req.query

  // Build query dynamically based on filters
  // CONCEPT: Prepared statements prevent SQL injection.
  // Never use string concatenation to build SQL queries.
  // BAD:  `SELECT * FROM projects WHERE category = '${category}'`
  // GOOD: Use ? placeholders and pass values separately
  let query = 'SELECT * FROM projects'
  const params = []
  const conditions = []

  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (featured === 'true') {
    conditions.push('featured = 1')
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY featured DESC, created_at DESC'

  const projects = db.prepare(query).all(...params)

  res.json({
    data: projects.map(parseProject),
    total: projects.length
  })
})

/**
 * GET /api/projects/:id
 *
 * Returns a single project by ID.
 * Returns 404 if not found.
 *
 * CONCEPT — HTTP Status Codes:
 * 200 OK          → success, resource found
 * 404 Not Found   → resource doesn't exist
 * 400 Bad Request → client sent invalid data
 * 500 Server Error → something broke server-side
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)

  // Validate: id must be a positive integer
  if (isNaN(id) || id < 1) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Project ID must be a positive integer'
    })
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id)

  if (!project) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Project with id ${id} does not exist`
    })
  }

  res.json({ data: parseProject(project) })
})

module.exports = router
