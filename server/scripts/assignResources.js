import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Resource from "../models/Resource.js";

dotenv.config();

const assignResources = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://timorauser:timorapass123@timora.zygerj1.mongodb.net/?retryWrites=true&w=majority&appName=Timora');
    console.log("Connected to MongoDB");

    // Get all venue incharges
    const venueIncharges = await User.find({ role: "Venue Incharge" });
    console.log(`Found ${venueIncharges.length} venue incharges`);

    // Get all resources
    const resources = await Resource.find();
    console.log(`Found ${resources.length} resources`);

    // Assign resources to venue incharges
    for (const incharge of venueIncharges) {
      // Find a resource in the same department that isn't assigned to anyone
      const availableResource = await Resource.findOne({
        department: incharge.department,
        _id: { $nin: await User.distinct('assignedVenueId') }
      });

      if (availableResource) {
        await User.findByIdAndUpdate(incharge._id, {
          assignedVenueId: availableResource._id
        });
        console.log(`Assigned ${availableResource.name} (${availableResource.department}) to ${incharge.name} (${incharge.department})`);
      } else {
        console.log(`No available resources found for ${incharge.name} in ${incharge.department}`);
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

    console.log("\nResource assignment completed");
    process.exit(0);
  } catch (error) {
    console.error("Error assigning resources:", error);
    process.exit(1);
  }
};

assignResources(); 