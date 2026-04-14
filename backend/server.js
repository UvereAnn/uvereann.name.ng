/**
 * server.js — Entry Point
 *
 * CONCEPT: This is the file Node.js runs first.
 * Its ONLY job is to start the HTTP server.
 * All the Express configuration lives in app.js.
 *
 * WHY SEPARATE server.js FROM app.js?
 * During testing, we import app.js directly without
 * starting a real server. If everything was in one file,
 * tests would try to bind to a port and conflict.
 * Separation = testability.
 */

// Load environment variables from .env BEFORE anything else
// WHY: Every other module may use process.env, so load it first
require('dotenv').config()

const app = require('./app')

const PORT = process.env.PORT || 3000

// .listen() starts the HTTP server
// Node.js will now accept connections on this port
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✅ CORS enabled for: ${process.env.ALLOWED_ORIGIN}`)
  console.log(`📖 Test the API: http://localhost:${PORT}/health`)
})

/**
 * Graceful shutdown
 *
 * CONCEPT: When your server receives SIGTERM (e.g. when you
 * Ctrl+C, or when a container orchestrator stops the process),
 * we want to:
 * 1. Stop accepting new requests
 * 2. Finish handling in-progress requests
 * 3. Close database connections
 * 4. Exit cleanly
 *
 * WHY: Abrupt shutdown can corrupt the database or drop
 * requests that are mid-flight. This is called "graceful shutdown"
 * and it is a production best practice.
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\nSIGINT received (Ctrl+C). Shutting down...')
  server.close(() => {
    process.exit(0)
  })
})

module.exports = server
