import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../server.js';

dotenv.config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://timorauser:timorapass123@timora.zygerj1.mongodb.net/?retryWrites=true&w=majority&appName=Timora');
}, 20000);

afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    await mongoose.connection.collections[collectionName].deleteMany({});
  }
}, 20000);

afterAll(async () => {
  await mongoose.connection.close();
}, 20000);

describe('Server Tests', () => {
  it('Server should be running', async () => {
    const res = await request(app).get('/'); // ✅ Working route
    expect(res.statusCode).toBe(200);
  });

  it('404 handler for non-existent routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });
});
