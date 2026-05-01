/**
 * app.js — Express Application
 */

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

// Import our route handlers
const healthRouter = require('./app/routers/health')
const projectsRouter = require('./app/routers/projects')
const blogRouter = require('./app/routers/blog')
const contactRouter = require('./app/routers/contact')

// Import our middleware
const { apiRateLimiter, contactRateLimiter } = require('./app/middleware/rateLimiter')

// Initialize the database
const { initializeDatabase } = require('./app/database')
initializeDatabase()

const app = express()

// ============================================================
// MIDDLEWARE STACK
// ============================================================

/**
 * 1. CORS — Updated for Production Reliability
 * This specifically addresses the "Missing Header" and 
 * "CORS Policy" errors seen in the browser console.
 */
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches our variable or is on our domain
    if (
      allowedOrigin === '*' || 
      origin === allowedOrigin || 
      origin.includes('uvereann.name.ng')
    ) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

/**
 * 2. Body Parser
 */
app.use(express.json({ limit: '10kb' }))

/**
 * 3. Request Logger
 */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

/**
 * 4. General API Rate Limiter
 */
app.use('/api/', apiRateLimiter)

// ============================================================
// ROUTES
// ============================================================

app.use('/health', healthRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/blog', blogRouter)

// Contact form gets a stricter rate limiter
app.use('/api/contact', contactRateLimiter, contactRouter)

// ============================================================
// ERROR HANDLING
// ============================================================

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET /health',
      'GET /api/projects',
      'GET /api/projects/:id',
      'GET /api/blog',
      'GET /api/blog/:id',
      'POST /api/contact'
    ]
  })
})

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error(`❌ Error on ${req.method} ${req.path}:`, err.message)

  const isDev = process.env.NODE_ENV !== 'production'

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  })
})

module.exports = app