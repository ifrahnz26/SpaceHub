import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
  department: String,
  purpose: String,
  date: String,
  timeSlots: {
    type: [String],
    required: true,
    validate: (slots) => Array.isArray(slots) && slots.length > 0,
  },
  attendees: Number,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
    eventDetails: {
      duration: String,        // e.g., "2 hours"
      yearOfStudents: [Number], // e.g., [1, 2]
      usagePurpose: String,    // e.g., "Hackathon"
      subjectOrType: String,   // e.g., "AI Lab"
      description: String,     // more context
    }
  },

  // ✅ New fields for Venue Incharge
  eventSummary: { type: String },               // Summary after event
  blockedByIncharge: { type: Boolean, default: false }, // True if slot blocked manually
  reason: { type: String },                     // Reason for blocked slot

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
