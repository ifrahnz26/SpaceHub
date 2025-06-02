import request from 'supertest';
import app from '../server.js';

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