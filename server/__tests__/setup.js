import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://timorauser:timorapass123@timora.zygerj1.mongodb.net/?retryWrites=true&w=majority&appName=Timora');
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
}); 





