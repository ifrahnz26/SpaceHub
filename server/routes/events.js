import express from 'express';
import multer from 'multer';
// import path from 'path';
import Event from '../models/Event.js';
import Resource from '../models/Resource.js'; // Import Resource model to populate venue name

const router = express.Router();

// Set up memory storage for uploaded images
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const upload = multer({ storage: storage });

// POST route to create a new event
router.post('/', upload.single('posterImage'), async (req, res) => {
  try {
    console.log('Received POST request to /api/events');
    console.log('Request body:', req.body);

    // Assuming user information including assignedVenueId is available in req.user
    // This requires an authentication middleware to populate req.user
    if (!req.user || !req.user.assignedVenueId) {
      return res.status(401).json({ message: 'Unauthorized or venue not assigned' });
    }

    const { subjectOrType, description, duration, yearOfStudents, usagePurpose, department, date, time, venue } = req.body;

const newEvent = new Event({
  subjectOrType,
  description,
  duration,
  yearOfStudents: Array.isArray(yearOfStudents) ? yearOfStudents : [yearOfStudents],
  usagePurpose,
  department,
  venue: venue || req.user.assignedVenueId, // Use provided venue or fallback
  date: new Date(date),
  time,
  posterImage: req.file ? req.file.buffer : undefined,
});


    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET route to fetch all events and populate venue name
router.get('/', async (req, res) => {
  try {
    console.log('Received GET request to /api/events');
    // Find events and populate the 'venue' field, selecting only the 'name'
    const events = await Event.find().populate('venue');

    // Convert image buffer to Base64 for sending to frontend and format venue name
    const eventsWithFormattedData = events.map(event => ({
      ...event.toObject(),
      // Access the populated venue name and set it directly
      posterImage: event.posterImage ? `data:image/jpeg;base64,${event.posterImage.toString('base64')}` : undefined,
    }));

    res.json(eventsWithFormattedData);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch a single event by ID and populate venue name
router.patch('/:eventId', upload.single('posterImage'), async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const updateFields = {
        subjectOrType: req.body.subjectOrType,
        description: req.body.description,
        duration: req.body.duration,
        yearOfStudents: Array.isArray(req.body['yearOfStudents[]']) 
          ? req.body['yearOfStudents[]'] 
          : [req.body['yearOfStudents[]']],
        usagePurpose: req.body.usagePurpose,
        department: req.body.department,
        venue: req.body.venue || req.user.assignedVenueId,
        date: new Date(req.body.date),
        time: req.body.time,
      };
  
      if (req.file) {
        updateFields.posterImage = req.file.buffer;
      }
  
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updateFields, { new: true });
  
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: error.message });
    }
  });
  
// You can add other routes here (PATCH, DELETE) if needed later

export default router;