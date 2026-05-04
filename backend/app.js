/**
 * app.js — Express Application
 *
 * CHANGES:
 * - Added blogInteractionsRouter for comments and likes
 * - Mounted at /api/blog/:slug (merged params so slug is accessible)
 */

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const healthRouter          = require('./app/routers/health')
const projectsRouter        = require('./app/routers/projects')
const blogRouter            = require('./app/routers/blog')
const contactRouter         = require('./app/routers/contact')
const adminRouter           = require('./app/routers/admin')
const blogInteractionsRouter = require('./app/routers/blogInteractions')

const { apiRateLimiter, contactRateLimiter } = require('./app/middleware/rateLimiter')
const { initializeDatabase } = require('./app/database')

initializeDatabase()

const app = express()

// ── Middleware ────────────────────────────────────────────────

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (
      allowedOrigin === '*' ||
      origin === allowedOrigin ||
      origin.includes('uvereann.name.ng')
    ) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked for origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(express.json({ limit: '10kb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/api/', apiRateLimiter)

// ── Routes ────────────────────────────────────────────────────

app.use('/health',                    healthRouter)
app.use('/api/projects',              projectsRouter)
app.use('/api/blog',                  blogRouter)
app.use('/api/blog/:slug',            blogInteractionsRouter)
app.use('/api/contact',               contactRateLimiter, contactRouter)
app.use('/api/admin',                 adminRouter)

// ── Error Handling ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET  /health',
      'GET  /health/ready',
      'GET  /api/projects',
      'GET  /api/projects/:id',
      'GET  /api/blog',
      'GET  /api/blog/:slug',
      'GET  /api/blog/:slug/comments',
      'POST /api/blog/:slug/comments',
      'GET  /api/blog/:slug/likes',
      'POST /api/blog/:slug/like',
      'POST /api/contact',
      'GET  /api/admin/messages?secret=',
      'GET  /api/admin/comments?secret=',
      'GET  /api/admin/likes?secret='
    ]
  })
})

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`❌ Error on ${req.method} ${req.path}:`, err.message)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  })
})

module.exports = app