/**
 * tests/health.test.js
 *
 * CONCEPT — Testing with Supertest:
 * supertest lets you make HTTP requests to your Express app
 * WITHOUT starting a real server (no port binding).
 * It works directly with the app object.
 *
 * WHY TEST HEALTH ENDPOINTS?
 * Health checks are critical infrastructure. If they break,
 * your monitoring, load balancers, and Kubernetes probes
 * all think your service is down.
 *
 * CONCEPT — describe() and it():
 * describe() groups related tests
 * it() (or test()) is a single test case
 * The strings are the test names you see in output
 *
 * CONCEPT — expect():
 * Jest's assertion function. If the assertion fails, the test fails.
 * .expect(200) asserts the HTTP status code is 200
 * .expect('Content-Type', /json/) asserts the content type
 */

const request = require('supertest')
const app = require('../app')

describe('Health Endpoints', () => {

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body.status).toBe('ok')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('version')
    })

    it('should return uptime as a number', async () => {
      const response = await request(app).get('/health')
      expect(typeof response.body.uptime).toBe('number')
      expect(response.body.uptime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('GET /health/ready', () => {
    it('should return 200 when database is accessible', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200)

      expect(response.body.status).toBe('ready')
      expect(response.body.checks.database).toBe('ok')
    })
  })

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/this-does-not-exist')
        .expect(404)

      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('availableRoutes')
    })
  })

})
