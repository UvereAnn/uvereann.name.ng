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
 *
 * WHAT WAS ADDED:
 * - sendEmailNotification() function using the Resend API
 * - Called after saving to DB (fire-and-forget pattern)
 * - If email fails, the form submission still succeeds
 * - escapeHtml() helper to prevent XSS in email HTML body
 */

const express = require('express')
const { body, validationResult } = require('express-validator')
const { db } = require('../database')

const router = express.Router()

// ─── Email Helper ─────────────────────────────────────────────────────────────

/**
 * sendEmailNotification()
 *
 * Calls the Resend API to email you when someone submits the form.
 *
 * CONCEPT — Why async/await here?
 * fetch() is asynchronous — it takes time to get a response
 * from the Resend API over the network. async/await lets
 * Node.js handle other requests while waiting, instead of
 * blocking the entire server.
 *
 * CONCEPT — Graceful degradation:
 * If RESEND_API_KEY is not set (e.g. during local development),
 * we skip silently. This means the same code works in dev
 * (no email) and production (email sends) without any changes.
 */
async function sendEmailNotification ({ name, email, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.NOTIFY_EMAIL

  // Skip if not configured — useful during local development
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.log('INFO: Resend not configured — skipping email notification')
    return { sent: false, reason: 'not configured' }
  }

  if (!toEmail) {
    console.log('INFO: NOTIFY_EMAIL not set — skipping email notification')
    return { sent: false, reason: 'NOTIFY_EMAIL not set' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // WHO the email appears to come from
        // IMPORTANT: On Resend free tier without a verified domain,
        // use onboarding@resend.dev as the from address.
        // Once you verify uvereann.name.ng in Resend, change this to:
        // 'Portfolio Contact <contact@uvereann.name.ng>'
        from: 'Portfolio Contact <onboarding@resend.dev>',

        // YOUR inbox — where you want to receive the notifications
        to: [toEmail],

        subject: `New contact from ${name}: ${subject || 'No subject'}`,

        // html: the rich email body your inbox renders
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6ee7b7; border-bottom: 2px solid #6ee7b7; padding-bottom: 10px;">
              New Portfolio Contact
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555; width: 100px;">Name</td>
                <td style="padding: 8px; color: #333;">${escapeHtml(name)}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Email</td>
                <td style="padding: 8px;">
                  <a href="mailto:${escapeHtml(email)}" style="color: #6ee7b7;">
                    ${escapeHtml(email)}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Subject</td>
                <td style="padding: 8px; color: #333;">${escapeHtml(subject || 'Not provided')}</td>
              </tr>
            </table>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="font-weight: bold; color: #555; margin: 0 0 8px;">Message:</p>
              <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Sent from uvereann.name.ng portfolio contact form
            </p>
          </div>
        `,

        // text: plain text fallback for email clients that
        // do not render HTML (always include both)
        text: `New contact from your portfolio:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject || 'Not provided'}\n\nMessage:\n${message}`
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`Email notification sent — Resend ID: ${data.id}`)
      return { sent: true, id: data.id }
    } else {
      console.error('Resend API error:', data)
      return { sent: false, error: data }
    }
  } catch (err) {
    console.error('Failed to call Resend API:', err.message)
    return { sent: false, error: err.message }
  }
}

/**
 * escapeHtml()
 *
 * CONCEPT — XSS prevention in email HTML:
 * We build HTML strings using user-submitted data (name, email,
 * message). If someone submits <script>alert('xss')</script>,
 * we must escape it so it renders as visible text, not code.
 *
 * Note: express-validator's .escape() already does this for
 * req.body values before they reach our route handler.
 * We escape again here as a defence-in-depth measure because
 * we are building raw HTML strings for the email body.
 */
function escapeHtml (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

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

// ─── Route ────────────────────────────────────────────────────────────────────

/**
 * POST /api/contact
 *
 * Accepts a contact form submission.
 * Validates inputs, saves to database, sends email notification.
 *
 * Request body: { name, email, subject?, message }
 * Response 200: { success: true, message: "..." }
 * Response 400: { errors: [...validation errors] }
 *
 * CHANGE FROM ORIGINAL:
 * Route handler is now async because sendEmailNotification()
 * uses await internally. The route itself does NOT await the
 * email call — it fires and forgets so the user gets an
 * immediate response regardless of email delivery.
 */
router.post('/', contactValidationRules, async (req, res) => {
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

  // ── Step 1: Save to database (primary action — must succeed) ──
  let savedId
  try {
    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, subject || null, message, ipAddress)

    savedId = result.lastInsertRowid
    console.log(`New contact from ${name} (${email}) — id: ${savedId}`)
  } catch (err) {
    console.error('Failed to save contact message:', err.message)
    // Don't expose internal error details to client
    return res.status(500).json({
      error: 'Failed to send message. Please try again later.'
    })
  }

  // ── Step 2: Send email notification (fire and forget) ──────────
  //
  // CONCEPT — Fire and forget:
  // We do NOT await this call. We kick off the email send and
  // immediately respond to the user with success.
  //
  // WHY: The user should not wait for the Resend API to respond.
  // If Resend takes 2 seconds or fails completely, the user
  // already has their success response and the message is safe
  // in the database regardless.
  //
  // The .then() logs any failure server-side so you can monitor
  // whether emails are being delivered.
  sendEmailNotification({ name, email, subject, message })
    .then(result => {
      if (!result.sent) {
        console.log(
          `Email not sent for message id ${savedId}:`,
          result.reason || result.error
        )
      }
    })

  // ── Step 3: Respond to the user immediately ────────────────────
  res.status(200).json({
    success: true,
    message: 'Thank you for your message! I will get back to you soon.'
  })
})

module.exports = router