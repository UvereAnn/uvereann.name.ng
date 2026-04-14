/**
 * tests/contact.test.js
 *
 * CONCEPT — Testing POST endpoints:
 * We test both HAPPY PATH (valid data works)
 * and UNHAPPY PATHS (bad data is rejected).
 * This is where security bugs hide.
 */

const request = require('supertest')
const app = require('../app')

describe('Contact API', () => {
  const validContact = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Testing the contact form',
    message: 'This is a test message that is long enough to be valid.'
  }

  describe('POST /api/contact — valid data', () => {
    it('should return 200 with success message', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send(validContact)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('message')
    })

    it('should work without optional subject field', async () => {
      const { subject, ...noSubject } = validContact
      await request(app)
        .post('/api/contact')
        .send(noSubject)
        .expect(200)
    })
  })

  describe('POST /api/contact — validation failures', () => {
    it('should return 400 when name is missing', async () => {
      const { name, ...noName } = validContact
      const response = await request(app)
        .post('/api/contact')
        .send(noName)
        .expect(400)

      const fields = response.body.errors.map(e => e.field)
      expect(fields).toContain('name')
    })

    it('should return 400 when email is invalid', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ ...validContact, email: 'not-an-email' })
        .expect(400)

      const fields = response.body.errors.map(e => e.field)
      expect(fields).toContain('email')
    })

    it('should return 400 when message is too short', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ ...validContact, message: 'Hi' })
        .expect(400)

      const fields = response.body.errors.map(e => e.field)
      expect(fields).toContain('message')
    })

    it('should return 400 when message is missing', async () => {
      const { message, ...noMessage } = validContact
      const response = await request(app)
        .post('/api/contact')
        .send(noMessage)
        .expect(400)

      expect(response.body.errors.length).toBeGreaterThan(0)
    })

    it('should return 400 when name is too long', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ ...validContact, name: 'A'.repeat(101) })
        .expect(400)
    })

    it('should return 400 when body is empty', async () => {
      await request(app)
        .post('/api/contact')
        .send({})
        .expect(400)
    })
  })
})
