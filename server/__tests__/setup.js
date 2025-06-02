import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Set default timeout for all tests
jest.setTimeout(10000);

beforeAll(async () => {
  try {
    // Connect to test database with timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db', {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });
    console.log('Connected to MongoDB for testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Close database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
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
    throw error;
  }
}); 