import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["Student", "Faculty", "HOD", "Venue Incharge"],
    required: true,
  },

  department: {
    type: String,
    enum: ["CSE", "ISE", "AIML"],
    required: true,
  },

  // ✅ For Venue Incharge only: reference to the venue they manage
  assignedVenueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    default: null,
  },
});

export default mongoose.model("User", userSchema);
