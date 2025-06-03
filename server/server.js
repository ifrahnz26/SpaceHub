import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import client from "prom-client";

// Route handlers
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";
import resourceRoutes from "./routes/resources.js";
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import { verifyToken } from "./middleware/auth.js";

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Check required env vars
if (process.env.NODE_ENV !== "test") {
  const required = ["PORT", "MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error("Missing required env vars:", missing);
    process.exit(1);
  }
}

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  "https://timora-client.vercel.app",
  "http://localhost:3000",
  "https://timora-client-il83u2ud3-ifrahs-projects-46f27517.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

/* ---------------- Prometheus Setup ---------------- */
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCount = new client.Counter({
  name: "httptotal",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "httptime",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

const memoryUsageGauge = new client.Gauge({
  name: "nodememory",
  help: "Memory usage in bytes",
  labelNames: ["type"],
});

register.registerMetric(httpRequestCount);
register.registerMetric(httpRequestDuration);
register.registerMetric(memoryUsageGauge);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    httpRequestCount.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).inc();
    end({ method: req.method, route: req.route?.path || req.path, status: res.statusCode });
  });
  next();
});

setInterval(() => {
  const mem = process.memoryUsage();
  for (const key in mem) {
    memoryUsageGauge.labels(key).set(mem[key]);
  }
}, 10000);

/* ---------------- Routes ---------------- */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", verifyToken, userRoutes);
app.use("/api/bookings", verifyToken, bookingRoutes);
app.use("/api/resources", verifyToken, resourceRoutes);
app.use("/api/events", verifyToken, eventRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ---------------- Error Handler ---------------- */
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/* ---------------- Static Client (if built) ---------------- */
const buildPath = path.join(__dirname, "./client/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

/* ---------------- Connect to DB and Start Server ---------------- */
const PORT = process.env.PORT || 5001;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Prometheus metrics at: http://localhost:${PORT}/metrics`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

connectDB();

export default app;
