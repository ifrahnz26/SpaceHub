import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Resource from "./models/Resource.js";
import Booking from "./models/Booking.js";

dotenv.config();

// Function to create dummy data
const createDummyData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB - booking_system database");

    // Clear existing data
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Faculty users
    const faculty1 = await User.create({
      name: "Dr. John Smith",
      email: "faculty@test.com",
      password: hashedPassword,
      role: "Faculty",
      department: "CSE"
    });

    const faculty2 = await User.create({
      name: "Dr. Sarah Johnson",
      email: "faculty2@test.com",
      password: hashedPassword,
      role: "Faculty",
      department: "ISE"
    });

    // Add more faculty members
    const faculty3 = await User.create({
      name: "Dr. David Kumar",
      email: "faculty3@test.com",
      password: hashedPassword,
      role: "Faculty",
      department: "CSE"
    });

    const faculty4 = await User.create({
      name: "Dr. Priya Sharma",
      email: "faculty4@test.com",
      password: hashedPassword,
      role: "Faculty",
      department: "ISE"
    });

    const faculty5 = await User.create({
      name: "Dr. Rajesh Patel",
      email: "faculty5@test.com",
      password: hashedPassword,
      role: "Faculty",
      department: "AIML"
    });

    // Create Venue Incharge users
    const venueIncharge1 = await User.create({
      name: "Mr. Robert Chen",
      email: "incharge@test.com",
      password: hashedPassword,
      role: "Venue Incharge",
      department: "CSE"
    });

    const venueIncharge2 = await User.create({
      name: "Ms. Emily Brown",
      email: "incharge2@test.com",
      password: hashedPassword,
      role: "Venue Incharge",
      department: "ISE"
    });

    // Add AIML venue incharge
    const venueIncharge3 = await User.create({
      name: "Mr. Amit Singh",
      email: "incharge3@test.com",
      password: hashedPassword,
      role: "Venue Incharge",
      department: "AIML"
    });

    // Create HOD users
    const hod1 = await User.create({
      name: "Prof. Michael Wilson",
      email: "hod@test.com",
      password: hashedPassword,
      role: "HOD",
      department: "CSE"
    });

    const hod2 = await User.create({
      name: "Prof. Lisa Anderson",
      email: "hod2@test.com",
      password: hashedPassword,
      role: "HOD",
      department: "ISE"
    });

    // Add AIML HOD
    const hod3 = await User.create({
      name: "Prof. Sanjay Gupta",
      email: "hod3@test.com",
      password: hashedPassword,
      role: "HOD",
      department: "AIML"
    });

    // Create resources
    const resources = await Resource.create([
      {
        name: "CSE Lab 101",
        type: "Lab",
        department: "CSE",
        description: "Main computer lab for CSE department",
        capacity: 40,
        features: "Projector, Smart Board, High-speed Internet"
      },
      {
        name: "CSE Seminar Hall",
        type: "Seminar Hall",
        department: "CSE",
        description: "Main seminar hall for CSE department",
        capacity: 100,
        features: "Projector, Sound System, Air Conditioning"
      },
      {
        name: "ISE Lab 201",
        type: "Lab",
        department: "ISE",
        description: "Main computer lab for ISE department",
        capacity: 35,
        features: "Projector, Smart Board, High-speed Internet"
      },
      {
        name: "ISE Seminar Hall",
        type: "Seminar Hall",
        department: "ISE",
        description: "Main seminar hall for ISE department",
        capacity: 80,
        features: "Projector, Sound System, Air Conditioning"
      },
      // Add AIML resources
      {
        name: "AIML Lab 301",
        type: "Lab",
        department: "AIML",
        description: "Main computer lab for AIML department",
        capacity: 45,
        features: "Projector, Smart Board, High-speed Internet, GPU Workstations"
      },
      {
        name: "AIML Seminar Hall",
        type: "Seminar Hall",
        department: "AIML",
        description: "Main seminar hall for AIML department",
        capacity: 90,
        features: "Projector, Sound System, Air Conditioning, Video Conferencing"
      }
    ]);

    // Create bookings
    await Booking.create([
      {
        userId: faculty1._id,
        resourceId: resources[0]._id,
        department: "CSE",
        purpose: "AI Workshop",
        date: "2024-03-20",
        timeSlots: ["09:00-11:00", "11:00-13:00"],
        attendees: 30,
        status: "Approved",
        eventDetails: {
          duration: "4 hours",
          yearOfStudents: [2, 3],
          usagePurpose: "Workshop",
          subjectOrType: "AI Lab",
          description: "Introduction to Machine Learning workshop"
        }
      }
    ]);

    console.log("Dummy data created successfully");
    return { venueIncharge1, venueIncharge2, resources };
  } catch (error) {
    console.error("Error creating dummy data:", error);
    throw error;
  }
};

// Function to link venue incharges with resources
const linkVenueIncharges = async (venueIncharges, resources) => {
  try {
    // Get all venue incharges
    const incharges = await User.find({ role: "Venue Incharge" });
    console.log(`Found ${incharges.length} venue incharges`);

    // For each venue incharge, find a resource in their department
    for (const incharge of incharges) {
      // Find all resources in the incharge's department
      const departmentResources = resources.filter(r => r.department === incharge.department);
      
      if (departmentResources.length > 0) {
        // Find a resource that isn't assigned to anyone
        const assignedResourceIds = await User.distinct('assignedVenueId');
        const availableResource = departmentResources.find(r => !assignedResourceIds.includes(r._id));

        if (availableResource) {
          await User.findByIdAndUpdate(incharge._id, {
            assignedVenueId: availableResource._id
          });
          console.log(`Assigned ${availableResource.name} (${availableResource.department}) to ${incharge.name} (${incharge.department})`);
        } else {
          console.log(`No available resources found for ${incharge.name} in ${incharge.department}`);
        }
      }
    }

    // Verify assignments
    const assignedIncharges = await User.find({ 
      role: "Venue Incharge",
      assignedVenueId: { $exists: true, $ne: null }
    }).populate('assignedVenueId');

    console.log("\nVerification of assignments:");
    for (const incharge of assignedIncharges) {
      if (incharge.assignedVenueId) {
        console.log(`${incharge.name} (${incharge.department}) -> ${incharge.assignedVenueId.name} (${incharge.assignedVenueId.department})`);
      }
    }
  } catch (error) {
    console.error("Error linking venue incharges:", error);
    throw error;
  }
};

// Main function to run the seeding process
const seedDatabase = async () => {
  try {
    const { venueIncharge1, venueIncharge2, resources } = await createDummyData();
    await linkVenueIncharges([venueIncharge1, venueIncharge2], resources);
    console.log("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error in seeding process:", error);
    process.exit(1);
  }
};

seedDatabase(); 