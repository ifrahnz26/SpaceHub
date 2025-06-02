const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
  test('Server should be running', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  test('404 handler for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });
}); 