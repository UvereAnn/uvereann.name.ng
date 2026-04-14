/**
 * tests/projects.test.js
 */

const request = require('supertest')
const app = require('../app')

describe('Projects API', () => {

  describe('GET /api/projects', () => {
    it('should return 200 with data array', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return projects with required fields', async () => {
      const response = await request(app).get('/api/projects')
      const project = response.body.data[0]

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('title')
      expect(project).toHaveProperty('description')
      expect(project).toHaveProperty('tags')
      expect(project).toHaveProperty('category')
      expect(Array.isArray(project.tags)).toBe(true)
    })

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/projects?category=DevOps')
        .expect(200)

      response.body.data.forEach(project => {
        expect(project.category).toBe('DevOps')
      })
    })

    it('should return only featured projects when featured=true', async () => {
      const response = await request(app)
        .get('/api/projects?featured=true')
        .expect(200)

      response.body.data.forEach(project => {
        expect(project.featured).toBe(true)
      })
    })
  })

  describe('GET /api/projects/:id', () => {
    it('should return a single project by ID', async () => {
      const response = await request(app)
        .get('/api/projects/1')
        .expect(200)

      expect(response.body.data.id).toBe(1)
      expect(response.body.data).toHaveProperty('title')
    })

    it('should return 404 for non-existent project', async () => {
      await request(app)
        .get('/api/projects/9999')
        .expect(404)
    })

    it('should return 400 for invalid ID (not a number)', async () => {
      await request(app)
        .get('/api/projects/abc')
        .expect(400)
    })

    it('should return 400 for negative ID', async () => {
      await request(app)
        .get('/api/projects/-1')
        .expect(400)
    })
  })

})

describe('Blog API', () => {

  describe('GET /api/blog', () => {
    it('should return 200 with data array', async () => {
      const response = await request(app)
        .get('/api/blog')
        .expect(200)

      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('should NOT include content in list view', async () => {
      const response = await request(app).get('/api/blog')
      // List view should not include full content (bandwidth optimisation)
      response.body.data.forEach(post => {
        expect(post).not.toHaveProperty('content')
      })
    })

    it('should include excerpt in list view', async () => {
      const response = await request(app).get('/api/blog')
      response.body.data.forEach(post => {
        expect(post).toHaveProperty('excerpt')
        expect(post).toHaveProperty('slug')
      })
    })
  })

  describe('GET /api/blog/:identifier', () => {
    it('should return full post by ID including content', async () => {
      const response = await request(app)
        .get('/api/blog/1')
        .expect(200)

      expect(response.body.data).toHaveProperty('content')
      expect(response.body.data.content.length).toBeGreaterThan(0)
    })

    it('should return post by slug', async () => {
      const response = await request(app)
        .get('/api/blog/understanding-cors')
        .expect(200)

      expect(response.body.data.slug).toBe('understanding-cors')
    })

    it('should return 404 for non-existent post', async () => {
      await request(app)
        .get('/api/blog/this-post-does-not-exist')
        .expect(404)
    })
  })

})
