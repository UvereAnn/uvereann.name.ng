/**
 * app/routers/contact.js — Contact Form API
 *
 * CONCEPT — Input Validation:
 * NEVER trust data from users. Always validate on the server.
 * WHY: Even if your React form validates inputs, someone can
 * bypass your frontend entirely and send raw HTTP requests
 * directly to your API. Server-side validation is mandatory.
 *
 * We use express-validator which provides a clean, readable
 * way to define validation rules.
 *
 * CONCEPT — Sanitization:
 * Beyond validation (is it valid?) we sanitize (make it safe).
 * .trim() removes whitespace. .normalizeEmail() normalises email.
 * .escape() converts < > & to HTML entities (prevents XSS).
 */

const express = require('express')
const { body, validationResult } = require('express-validator')
const { db } = require('../database')

const router = express.Router()

/**
 * Validation rules for the contact form
 *
 * CONCEPT — express-validator:
 * body('fieldName') creates a validator for a specific field
 * .notEmpty() fails if field is missing or empty string
 * .isEmail() fails if not a valid email format
 * .isLength() fails if not within min/max length
 * .trim() removes leading/trailing whitespace
 * .escape() HTML-encodes special characters (security)
 * .withMessage('...') sets the error message for that rule
 */
const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),  // prevents XSS: <script>alert('xss')</script> becomes safe

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()  // converts "User@GMAIL.COM" to "user@gmail.com"
    .isLength({ max: 254 }).withMessage('Email too long'),  // RFC 5321 limit

  body('subject')
    .optional()  // subject is not required
    .trim()
    .isLength({ max: 200 }).withMessage('Subject too long')
    .escape(),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
    .escape()
]

/**
 * POST /api/contact
 *
 * Accepts a contact form submission.
 * Validates inputs, saves to database.
 *
 * Request body: { name, email, subject?, message }
 * Response 200: { success: true, message: "..." }
 * Response 400: { errors: [...validation errors] }
 */
router.post('/', contactValidationRules, (req, res) => {
  // Check if validation passed
  // validationResult() collects all validation errors
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // 400 Bad Request — client sent invalid data
    // Return ALL errors at once so the user can fix everything
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }

  // Validation passed — save to database
  const { name, email, subject, message } = req.body

  // Get client IP for spam tracking
  // req.ip gives us the IP address
  // In production behind a proxy: use req.headers['x-forwarded-for']
  const ipAddress = req.ip || req.connection.remoteAddress

  try {
    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, subject || null, message, ipAddress)

    console.log(`📩 New contact from ${name} (${email}) — id: ${result.lastInsertRowid}`)

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.'
    })
  } catch (err) {
    console.error('Failed to save contact message:', err.message)
    // Don't expose internal error details to client
    res.status(500).json({
      error: 'Failed to send message. Please try again later.'
    })
  }
})

module.exports = router
