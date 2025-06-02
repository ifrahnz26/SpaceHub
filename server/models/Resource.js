import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, enum: ["Lab", "Seminar Hall"], required: true },
  capacity: { type: Number, required: true },
  features: { type: String, required: true },
  description: { type: String, required: true }
});

export default mongoose.model("Resource", resourceSchema);
