import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

/**
 * ✅ Get ALL resources
 * Used for registration dropdowns (e.g., Venue Incharge)
 */
/**
 * ✅ Get ALL resources (for analytics)
 */
router.get("/all", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    console.error("❌ Failed to fetch resources:", err.message);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    console.error("❌ Failed to fetch resources:", err.message);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});


/**
 * ✅ Get resources by department
 * Used for department-specific filtering
 */
router.get("/department/:department", async (req, res) => {
  try {
    const resources = await Resource.find({ department: req.params.department });
    res.json(resources);
  } catch (err) {
    console.error("❌ Failed to fetch resources by department:", err.message);
    res.status(500).json({ error: "Failed to fetch resources by department" });
  }
});

/**
 * ✅ Get a single resource by ID
 * Used for fetching specific venue details
 */
router.get("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    res.json(resource);
  } catch (err) {
    console.error("❌ Failed to fetch resource:", err.message);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

/**
 * ✅ Add a new resource (Lab/Seminar Hall)
 * Example POST body: { name: "CSE Lab 1", type: "Lab", department: "CSE" }
 */
router.post("/", async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error("❌ Failed to add resource:", err.message);
    res.status(500).json({ error: "Failed to add resource" });
  }
});

export default router;
