import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Server Tests', () => {
  // Increase timeout for all tests in this file
  jest.setTimeout(10000);

  test('Server should be running', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  test('404 handler for non-existent routes', async () => {
    const response = await request(app).get('/non-existent-route');
    expect(response.status).toBe(404);
  });

  // Add cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });
}); 