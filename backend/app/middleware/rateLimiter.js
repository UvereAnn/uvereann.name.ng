/**
 * app/middleware/rateLimiter.js — Rate Limiting
 *
 * CONCEPT: Rate limiting controls how many requests
 * a single IP address can make in a time window.
 *
 * WHY IT MATTERS:
 * Without rate limiting:
 * - Someone can spam your contact form
 * - Someone can DoS your server with millions of requests
 * - Brute force attacks become easy
 *
 * express-rate-limit tracks requests in memory per IP.
 * For production with multiple servers you would use Redis,
 * but for a single VPS, memory is fine.
 *
 * We create TWO limiters:
 * 1. apiRateLimiter   → general API routes (relaxed)
 * 2. contactRateLimiter → contact form (strict, prevent spam)
 */

const rateLimit = require('express-rate-limit')

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 * Covers /api/projects, /api/blog
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // max requests per window per IP
  // --- ADDED THIS LINE for test sake---
  skip: () => process.env.NODE_ENV === 'test',
  // ---------------------
  standardHeaders: true,     // adds RateLimit-* headers to response
  legacyHeaders: false,      // disables old X-RateLimit-* headers

  // Custom message when limit is exceeded
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please wait 15 minutes.',
    retryAfter: '15 minutes'
  },

  // Handler function when limit is hit
  handler: (req, res, next, options) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip} on ${req.path}`)
    res.status(429).json(options.message)
  }
})

/**
 * Contact form rate limiter — much stricter
 * 5 submissions per hour per IP
 *
 * WHY: Contact forms are prime targets for spam.
 * A real human submits at most 1-2 times.
 * 5 per hour is generous and still blocks bots.
 */
const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // max 5 contact form submissions per hour
  // --- ADDED THIS LINE for test sake ---
  skip: () => process.env.NODE_ENV === 'test',
  // ---------------------
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many submissions',
    message: 'Too many contact form submissions. Please try again in an hour.',
    retryAfter: '1 hour'
  },
  handler: (req, res, next, options) => {
    console.warn(`⚠️  Contact rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json(options.message)
  }
})

module.exports = { apiRateLimiter, contactRateLimiter }
