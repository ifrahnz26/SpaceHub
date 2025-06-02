import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  subjectOrType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: String,
  },
  yearOfStudents: {
    type: [String],
  },
  usagePurpose: {
    type: String,
  },
  department: {
    type: String,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
  },
  posterImage: {
    type: Buffer,
  },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);


export default Event; 