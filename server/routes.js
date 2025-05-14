import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { z } from "zod";
import { departmentEnum, insertBookingSchema } from "../shared/schema.js";

export async function registerRoutes(app) {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    const resources = await storage.getResources();
    res.json(resources);
  });
  
  app.get("/api/resources/:department", async (req, res) => {
    const department = req.params.department;
    
    // Validate department
    if (!departmentEnum.enumValues.includes(department)) {
      return res.status(400).json({ message: "Invalid department" });
    }
    
    const resources = await storage.getResourcesByDepartment(department);
    res.json(resources);
  });
  
  app.get("/api/resources/details/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    
    const resource = await storage.getResource(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  });
  
  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    
    if (user.role === "HOD") {
      // HODs see bookings for their department
      const bookings = await storage.getBookingsByDepartment(user.department);
      
      // Enhance bookings with resource and user information
      const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
        const resource = await storage.getResource(booking.resourceId);
        const bookingUser = await storage.getUser(booking.userId);
        
        return {
          ...booking,
          resource: resource,
          user: bookingUser ? {
            id: bookingUser.id,
            name: bookingUser.name,
            role: bookingUser.role,
            department: bookingUser.department
          } : null
        };
      }));
      
      return res.json(enhancedBookings);
    } else {
      // Students and Faculty see only their own bookings
      const bookings = await storage.getBookingsByUser(user.id);
      
      // Enhance bookings with resource information
      const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
        const resource = await storage.getResource(booking.resourceId);
        
        return {
          ...booking,
          resource: resource
        };
      }));
      
      return res.json(enhancedBookings);
    }
  });
  
  app.get("/api/bookings/pending", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    
    if (user.role !== "HOD") {
      return res.status(403).json({ message: "Forbidden. Only HODs can access pending approvals." });
    }
    
    // Get pending bookings for HOD's department
    const pendingBookings = await storage.getPendingBookingsByDepartment(user.department);
    
    // Enhance bookings with resource and user information
    const enhancedBookings = await Promise.all(pendingBookings.map(async (booking) => {
      const resource = await storage.getResource(booking.resourceId);
      const bookingUser = await storage.getUser(booking.userId);
      
      return {
        ...booking,
        resource: resource,
        user: bookingUser ? {
          id: bookingUser.id,
          name: bookingUser.name,
          role: bookingUser.role,
          department: bookingUser.department
        } : null
      };
    }));
    
    res.json(enhancedBookings);
  });
  
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Validate request body
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if the resource exists
      const resource = await storage.getResource(bookingData.resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Check if the user belongs to the same department as the resource
      const user = req.user;
      if (resource.department !== user.department) {
        return res.status(403).json({
          message: "You can only book resources from your own department"
        });
      }
      
      // Check if the slot is available
      const isAvailable = await storage.checkSlotAvailability(
        bookingData.resourceId,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime
      );
      
      if (!isAvailable) {
        return res.status(409).json({
          message: "The selected time slot is not available"
        });
      }
      
      // Create the booking
      const booking = await storage.createBooking({
        ...bookingData,
        userId: user.id
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/bookings/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    
    if (user.role !== "HOD") {
      return res.status(403).json({ message: "Forbidden. Only HODs can approve or reject bookings." });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    
    const { status } = req.body;
    if (status !== "Approved" && status !== "Rejected") {
      return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'." });
    }
    
    // Get the booking
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Get the resource to check department
    const resource = await storage.getResource(booking.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    // Check if HOD belongs to the same department as the resource
    if (resource.department !== user.department) {
      return res.status(403).json({
        message: "You can only manage bookings for resources in your department"
      });
    }
    
    // Update the booking status
    const updatedBooking = await storage.updateBookingStatus(id, status);
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(updatedBooking);
  });
  
  app.get("/api/check-availability", async (req, res) => {
    const { resourceId, date, startTime, endTime } = req.query;
    
    if (!resourceId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    const isAvailable = await storage.checkSlotAvailability(
      parseInt(resourceId),
      date,
      startTime,
      endTime
    );
    
    res.json({ available: isAvailable });
  });

  const httpServer = createServer(app);

  return httpServer;
}