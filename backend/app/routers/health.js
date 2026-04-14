/**
 * app/routers/health.js — Health Check Endpoint
 *
 * CONCEPT: Health checks are how infrastructure tools
 * know if your application is alive and ready.
 *
 * TWO TYPES of health checks:
 *
 * 1. LIVENESS check (/health)
 *    "Is the process running?"
 *    If this fails, restart the process.
 *    Used by: Docker HEALTHCHECK, Kubernetes livenessProbe
 *
 * 2. READINESS check (/health/ready)
 *    "Is the app ready to accept traffic?"
 *    If this fails, stop sending traffic (but don't restart).
 *    Used by: Load balancers, Kubernetes readinessProbe
 *    Example: App is running but database is not connected yet.
 *
 * WHY THIS MATTERS FOR INTERVIEWS:
 * Being able to explain the difference between liveness and
 * readiness probes is a common DevOps interview question.
 * Kubernetes uses these to manage pod lifecycle.
 */

const express = require('express')
const { db } = require('../database')

const router = express.Router()

// Track when the server started
const START_TIME = Date.now()

/**
 * GET /health
 *
 * Basic liveness check.
 * Returns 200 if the server is running.
 * Returns system information useful for debugging.
 */
router.get('/', (req, res) => {
  const uptimeMs = Date.now() - START_TIME
  const uptimeSeconds = Math.floor(uptimeMs / 1000)

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,         // seconds since server started
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version
  })
})

/**
 * GET /health/ready
 *
 * Readiness check — verifies dependencies are working.
 * We check the database is accessible.
 * Returns 200 if ready, 503 if not.
 *
 * 503 = Service Unavailable (the correct HTTP status for "not ready")
 */
router.get('/ready', (req, res) => {
  try {
    // Try a simple database query to verify DB is accessible
    db.prepare('SELECT 1').get()

    res.status(200).json({
      status: 'ready',
      checks: {
        database: 'ok'
      }
    })
  } catch (err) {
    // Database is unavailable — not ready to serve traffic
    console.error('Readiness check failed:', err.message)
    res.status(503).json({
      status: 'not ready',
      checks: {
        database: 'error'
      }
    })
  }
})

module.exports = router
