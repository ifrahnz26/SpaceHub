import express from "express";
import Booking from "../models/Booking.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Resource from "../models/Resource.js";

const router = express.Router();

const VALID_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
];

// ✅ GET: Available slots for a resource and date
router.get("/available-slots", async (req, res) => {
  const { resourceId, date } = req.query;
  if (!resourceId || !date) return res.status(400).json({ error: "Missing required parameters" });

  try {
    const bookings = await Booking.find({
      resourceId,
      date,
      $or: [{ status: "Approved" }, { blocked: true }],
    });

    const bookedSet = new Set();
    bookings.forEach((b) => b.timeSlots.forEach((s) => bookedSet.add(s)));

    const availableSlots = VALID_SLOTS.filter((s) => !bookedSet.has(s));
    res.json({ availableSlots });
  } catch (err) {
    console.error("Slot fetch error:", err);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

// ✅ Faculty: Create booking request
router.post("/", verifyToken, async (req, res) => {
  const { resourceId, date, timeSlots, purpose, attendees } = req.body;

  if (!resourceId || !date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const invalid = timeSlots.some((s) => !VALID_SLOTS.includes(s));
  if (invalid) return res.status(400).json({ error: "Invalid slot" });

  try {
    // First get the resource to check its department
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const existing = await Booking.find({
      resourceId,
      date,
      timeSlots: { $in: timeSlots },
      $or: [{ status: "Approved" }, { blocked: true }],
    });

    if (existing.length > 0) {
      return res.status(400).json({ error: "Some slots already booked or blocked" });
    }

    const booking = new Booking({
      userId: req.user.id,
      resourceId,
      department: resource.department, // Use the venue's department instead of user's department
      date,
      timeSlots,
      purpose,
      attendees,
      status: "Pending",
    });

    await booking.save();
    res.status(201).json({ message: "Booking request submitted" });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// ✅ HOD: Approve or reject
router.patch("/:id/status", verifyToken, async (req, res) => {
  if (req.user.role !== "HOD") return res.status(403).json({ error: "Unauthorized" });

  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Status updated", booking: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// ✅ Faculty: Get own bookings
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("resourceId", "name")
      .sort({ createdAt: -1 });

    res.json(bookings.map((b) => ({ ...b._doc, resource: b.resourceId })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch your bookings" });
  }
});

// ✅ HOD: Department bookings
router.get("/hod", verifyToken, async (req, res) => {
  if (req.user.role !== "HOD") return res.status(403).json({ error: "Unauthorized" });

  try {
    // First get all resources (venues) that belong to the HOD's department
    const resources = await Resource.find({ department: req.user.department });
    
    if (resources.length === 0) {
      return res.json([]);
    }
    
    const resourceIds = resources.map(r => r._id);

    // Then find bookings for those resources
    const bookings = await Booking.find({ 
      resourceId: { $in: resourceIds }
    })
      .populate("userId", "name role department")
      .populate("resourceId", "name type capacity department")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch HOD bookings" });
  }
});

//
// ─── ✅ VENUE INCHARGE FEATURES ──────────────────────────────────────────────
//

// ✅ POST: Block slots
router.post("/block", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge") return res.status(403).json({ error: "Unauthorized" });

  const { resourceId, date, timeSlots, reason } = req.body;

  if (!resourceId || !date || !Array.isArray(timeSlots) || !reason) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const conflict = await Booking.find({
      resourceId,
      date,
      timeSlots: { $in: timeSlots },
      $or: [{ status: "Approved" }, { blocked: true }],
    });

    if (conflict.length > 0) {
      return res.status(400).json({ error: "Some slots already booked or blocked" });
    }

    const blockEntry = new Booking({
      userId: req.user.id,
      resourceId,
      department: req.user.department,
      date,
      timeSlots,
      purpose: reason,
      blocked: true,
      blockedByIncharge: true,
      status: "Approved",
    });

    await blockEntry.save();
    res.status(201).json({ message: "Slot(s) blocked" });
  } catch (err) {
    res.status(500).json({ error: "Failed to block slots" });
  }
});

// ✅ DELETE: Unblock
router.delete("/block/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge") return res.status(403).json({ error: "Unauthorized" });

  try {
    const deleted = await Booking.findOneAndDelete({ _id: req.params.id, blocked: true });
    if (!deleted) return res.status(404).json({ error: "Block entry not found" });

    res.json({ message: "Blocked slot entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete block" });
  }
});

// ✅ PATCH: Add summary
router.patch("/:id/summary", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge") return res.status(403).json({ error: "Unauthorized" });

  const { eventSummary } = req.body;
  if (!eventSummary) return res.status(400).json({ error: "Event summary required" });

  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { eventSummary },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Event summary updated", booking: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update summary" });
  }
});

// ✅ GET: Venue Incharge – View all bookings (for their department)
router.get("/incharge", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge")
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const bookings = await Booking.find({ department: req.user.department })
      .populate("userId", "name")
      .populate("resourceId", "name")
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// DELETE: Unblock multiple slots by date/resource/slot
router.delete("/unblock-multiple", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge") return res.status(403).json({ error: "Unauthorized" });

  const { resourceId, date, timeSlots } = req.body;
  if (!resourceId || !date || !Array.isArray(timeSlots)) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const result = await Booking.deleteMany({
      resourceId,
      date,
      blocked: true,
      timeSlots: { $in: timeSlots },
    });

    res.json({ message: `Unblocked ${result.deletedCount} slot(s)` });
  } catch (err) {
    res.status(500).json({ error: "Unblock failed" });
  }
});

// routes/bookings.js
router.patch("/:id/event-details", verifyToken, async (req, res) => {
  if (req.user.role !== "Venue Incharge") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { eventDetails } = req.body;
  if (!eventDetails) return res.status(400).json({ error: "Missing event details" });

  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { eventDetails },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Event details updated", booking: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update event details" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "Approved" }).populate("venueId");
    const data = bookings.map((b) => ({
      venueName: b.venueId.name,
      purpose: b.purpose,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

// ✅ GET: Venue schedule for a specific date
router.get("/venue-schedule", async (req, res) => {
  const { venueId, date } = req.query;
  if (!venueId || !date) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const bookings = await Booking.find({
      resourceId: venueId,
      date,
      $or: [
        { status: "Approved" },
        { blocked: true }
      ]
    }).populate("userId", "name");

    res.json(bookings);
  } catch (err) {
    console.error("Failed to fetch venue schedule:", err);
    res.status(500).json({ error: "Failed to fetch venue schedule" });
  }
});

// Get all bookings
router.get("/", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("resourceId", "name type")
      .populate("userId", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET all bookings for analytics
router.get("/analytics-all", async (req, res) => {
  try {
    const bookings = await Booking.find({}) // Fetch all bookings
      .populate("resourceId", "name type"); // Populate resourceId
    const data = bookings.map((b) => ({
      _id: b._id,
      status: b.status,
      date: b.date,
      timeSlots: b.timeSlots,
      resourceId: b.resourceId?._id, 
      purpose: b.purpose,
      blocked: b.blocked, 
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings for analytics" });
  }
});

// Get booking by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("resourceId", "name type")
      .populate("userId", "name email");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post("/", verifyToken, async (req, res) => {
  try {
    const { venue, date, startTime, endTime, purpose } = req.body;
    const booking = new Booking({
      venue,
      date,
      startTime,
      endTime,
      purpose,
      status: "pending",
      venueIncharge: req.user.id
    });
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { venue, date, startTime, endTime, purpose, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { venue, date, startTime, endTime, purpose, status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
