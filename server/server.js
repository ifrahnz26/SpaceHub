import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import route handlers
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import resourceRoutes from "./routes/resources.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import { verifyToken } from "./middleware/auth.js";

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (process.env.NODE_ENV !== 'test') {
  const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
  }
}

const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API route definitions
app.use("/api/auth", authRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/bookings", verifyToken, bookingRoutes);
app.use("/api/resources", verifyToken, resourceRoutes);
app.use("/api/events", verifyToken, eventRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Serve React frontend build (only if it exists)
const buildPath = path.join(__dirname, './client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // ✅ PLACE THIS AT THE VERY END!
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Server port
const PORT = process.env.PORT || 5001;

// MongoDB connection and server start
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server only if not in test mode
//if (process.env.NODE_ENV !== 'test') {
  connectDB();
//}

export default app;
