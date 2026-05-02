/**
 * app.js — Express Application
 *
 * CONCEPT: This file creates and configures the Express app.
 * Think of it as setting up the pipeline that every
 * HTTP request flows through.
 *
 * WHY EXPORT THE APP?
 * Tests import this directly (without starting a server).
 * server.js imports this and calls .listen() on it.
 * This pattern is the standard in Node.js projects.
 *
 * CHANGES:
 * - Added adminRouter import and mount at /api/admin
 * - Updated CORS to fix "Missing Header" production errors
 * - Updated 404 availableRoutes to include admin endpoints
 */

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

// Import our route handlers (one file per feature)
const healthRouter   = require('./app/routers/health')
const projectsRouter = require('./app/routers/projects')
const blogRouter     = require('./app/routers/blog')
const contactRouter  = require('./app/routers/contact')
const adminRouter    = require('./app/routers/admin')

// Import our middleware
const { apiRateLimiter, contactRateLimiter } = require('./app/middleware/rateLimiter')

// Initialize the database when the app starts
// WHY HERE: We want the DB ready before we accept requests
const { initializeDatabase } = require('./app/database')
initializeDatabase()

// Create the Express application
const app = express()

// ============================================================
// MIDDLEWARE STACK
// ============================================================
// CONCEPT: Middleware runs on EVERY request, in this order.
// Each middleware either passes to the next (next()) or
// sends a response and stops the chain.
// ============================================================

/**
 * 1. CORS — Cross-Origin Resource Sharing
 *
 * CONCEPT: Browsers enforce a security policy called Same-Origin Policy.
 * It blocks your React frontend (port 5173) from calling your
 * backend (port 3000) unless the backend explicitly allows it.
 *
 * This middleware adds response headers that tell the browser:
 * "Yes, requests from ALLOWED_ORIGIN are permitted."
 *
 * Updated to use a function-based origin check which fixes
 * the "Missing Header" and "CORS Policy" errors in production.
 * In production: ALLOWED_ORIGIN will be https://uvereann.name.ng
 */
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    // Check if the origin matches our variable or is on our domain
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

/**
 * 2. Body Parser — Parse JSON request bodies
 *
 * CONCEPT: When the frontend sends a POST request with JSON data
 * (like a contact form submission), the body arrives as a raw
 * string. express.json() parses it into a JavaScript object
 * and puts it in req.body.
 *
 * Without this: req.body is undefined
 * With this: req.body = { name: "...", email: "...", message: "..." }
 *
 * limit: '10kb' prevents someone sending huge payloads to crash server
 */
app.use(express.json({ limit: '10kb' }))

/**
 * 3. Request Logger — Morgan
 *
 * CONCEPT: Logs every HTTP request to your terminal.
 * In development you see detailed logs.
 * In production you use 'combined' format (Apache-style logs).
 *
 * Example log line:
 * GET /api/projects 200 4.234 ms - 512
 * (method) (path) (status) (response time) (bytes)
 *
 * WHY: When something breaks, logs tell you what happened.
 * Without logs, debugging production issues is nearly impossible.
 */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

/**
 * 4. General API Rate Limiter
 *
 * CONCEPT: Rate limiting prevents abuse.
 * Without it, someone could send 10,000 requests/second to your
 * server, using all its resources (called a DoS attack).
 *
 * This allows 100 requests per 15 minutes per IP address.
 * Applies to all /api/* routes.
 */
app.use('/api/', apiRateLimiter)

// ============================================================
// ROUTES
// ============================================================
// CONCEPT: We mount each router at a prefix.
// app.use('/api/projects', projectsRouter) means:
// - Any request to /api/projects/... goes to projectsRouter
// - The router then handles the rest of the path
// ============================================================

app.use('/health',       healthRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/blog',     blogRouter)

// Contact form gets a stricter rate limiter
// WHY: More sensitive endpoint, don't want spam submissions
app.use('/api/contact',  contactRateLimiter, contactRouter)

// Admin routes — protected by secret key inside adminRouter itself
// CONCEPT: The auth check lives inside admin.js using router.use().
// Every route in that file automatically requires the secret.
// Mounting it here just tells Express "route /api/admin/* there".
app.use('/api/admin',    adminRouter)

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * 404 Handler — catches any route not matched above
 *
 * CONCEPT: If a request gets to this point, no route handled it.
 * We return a 404 with a helpful message.
 * The 404 status tells the client "this URL doesn't exist".
 */
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
      'GET  /api/blog/:id',
      'POST /api/contact',
      'GET  /api/admin/messages?secret=YOUR_SECRET',
      'GET  /api/admin/messages.json?secret=YOUR_SECRET'
    ]
  })
})

/**
 * Global Error Handler
 *
 * CONCEPT: Express has a special 4-argument middleware for errors.
 * When any route calls next(error) or throws, Express skips
 * all normal middleware and comes here.
 *
 * WHY: Centralised error handling means you don't have to
 * try/catch in every single route. Errors bubble up to here.
 *
 * In production we hide internal details (security best practice).
 * In development we show the full error for debugging.
 */
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Always log errors server-side (even in production)
  console.error(`❌ Error on ${req.method} ${req.path}:`, err.message)

  const isDev = process.env.NODE_ENV !== 'production'

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    // Only show stack trace in development
    ...(isDev && { stack: err.stack })
  })
})

module.exports = app