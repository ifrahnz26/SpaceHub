import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Set default timeout for all tests
jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Connect to test database with timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db', {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't throw error, just log it
  }
});

afterAll(async () => {
  try {
    // Close database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    // Don't throw error, just log it
  }
});

afterEach(async () => {
  try {
    // Clear all collections after each test
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
    // Don't throw error, just log it
  }
}); 