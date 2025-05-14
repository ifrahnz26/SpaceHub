import { 
  users, 
  resources, 
  bookings
} from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage {
  constructor() {
    this.users = new Map();
    this.resources = new Map();
    this.bookings = new Map();
    
    this.userCurrentId = 1;
    this.resourceCurrentId = 1;
    this.bookingCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeData();
  }

  // Initialize sample data
  async initializeData() {
    // Create HOD users for each department
    const cseHod = await this.createUser({
      username: "csehod",
      password: "password", // This will be hashed
      name: "Dr. Rajesh Kumar",
      role: "HOD",
      department: "CSE"
    });
    
    const iseHod = await this.createUser({
      username: "isehod",
      password: "password", // This will be hashed
      name: "Dr. Priya Sharma",
      role: "HOD",
      department: "ISE"
    });
    
    const aimlHod = await this.createUser({
      username: "aimlhod",
      password: "password", // This will be hashed
      name: "Dr. Suresh Reddy",
      role: "HOD",
      department: "AIML"
    });
    
    // Create faculty users
    const cseFaculty = await this.createUser({
      username: "csefaculty",
      password: "password", // This will be hashed
      name: "Prof. Anand Verma",
      role: "Faculty",
      department: "CSE"
    });
    
    const iseFaculty = await this.createUser({
      username: "isefaculty",
      password: "password", // This will be hashed
      name: "Prof. Lakshmi Narayan",
      role: "Faculty",
      department: "ISE"
    });
    
    const aimlFaculty = await this.createUser({
      username: "aimlfaculty",
      password: "password", // This will be hashed
      name: "Prof. Deepa Iyer",
      role: "Faculty",
      department: "AIML"
    });
    
    // Create student users
    const cseStudent = await this.createUser({
      username: "csestudent",
      password: "password", // This will be hashed
      name: "Rahul Patel",
      role: "Student",
      department: "CSE"
    });
    
    const iseStudent = await this.createUser({
      username: "isestudent",
      password: "password", // This will be hashed
      name: "Priya Singh",
      role: "Student",
      department: "ISE"
    });
    
    const aimlStudent = await this.createUser({
      username: "aimlstudent",
      password: "password", // This will be hashed
      name: "Arjun Reddy",
      role: "Student",
      department: "AIML"
    });
    
    // Create resources for each department
    // CSE Resources
    await this.createResource({
      name: "CSE Lab 101",
      description: "Computer Science Main Lab",
      type: "Lab",
      department: "CSE",
      capacity: 30,
      features: "Core i7 PCs, Projector, Wi-Fi"
    });
    
    await this.createResource({
      name: "CSE Lab 102",
      description: "Networking Lab",
      type: "Lab",
      department: "CSE",
      capacity: 25,
      features: "Networking equipment, Server racks, Cisco routers"
    });
    
    await this.createResource({
      name: "CSE Seminar Hall A",
      description: "Main Seminar Hall for CSE Department",
      type: "Seminar Hall",
      department: "CSE",
      capacity: 100,
      features: "Projector, Audio system, Podium, Air conditioning"
    });
    
    // ISE Resources
    await this.createResource({
      name: "ISE Lab 201",
      description: "Information Science Main Lab",
      type: "Lab",
      department: "ISE",
      capacity: 30,
      features: "Core i5 PCs, Smart board, Wi-Fi"
    });
    
    await this.createResource({
      name: "ISE Lab 202",
      description: "Database Systems Lab",
      type: "Lab",
      department: "ISE",
      capacity: 25,
      features: "Workstations, Oracle DB installations, Network storage"
    });
    
    await this.createResource({
      name: "ISE Seminar Hall B",
      description: "Information Science Department Seminar Hall",
      type: "Seminar Hall",
      department: "ISE",
      capacity: 80,
      features: "HD Projector, Surround sound, Video conferencing"
    });
    
    // AIML Resources
    await this.createResource({
      name: "AIML Lab 301",
      description: "Machine Learning Lab",
      type: "Lab",
      department: "AIML",
      capacity: 30,
      features: "CUDA-enabled GPUs, High-end workstations, AI development tools"
    });
    
    await this.createResource({
      name: "AIML Lab 302",
      description: "Deep Learning Research Lab",
      type: "Lab",
      department: "AIML",
      capacity: 20,
      features: "Tesla GPUs, Neural network visualization tools, Cloud computing access"
    });
    
    await this.createResource({
      name: "AIML Seminar Hall C",
      description: "AI and Machine Learning Department Seminar Hall",
      type: "Seminar Hall",
      department: "AIML",
      capacity: 90,
      features: "4K Projectors, Recording equipment, Live streaming capabilities"
    });
  }

  // User Methods
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Resource Methods
  async getResources() {
    return Array.from(this.resources.values());
  }
  
  async getResourcesByDepartment(department) {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.department === department
    );
  }
  
  async getResource(id) {
    return this.resources.get(id);
  }
  
  async createResource(insertResource) {
    const id = this.resourceCurrentId++;
    const resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }
  
  // Booking Methods
  async getBookings() {
    return Array.from(this.bookings.values());
  }
  
  async getBookingsByUser(userId) {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async getBookingsByDepartment(department) {
    // Get all resources for this department
    const departmentResources = await this.getResourcesByDepartment(department);
    const resourceIds = departmentResources.map(r => r.id);
    
    // Return bookings for these resources
    return Array.from(this.bookings.values()).filter(
      (booking) => resourceIds.includes(booking.resourceId)
    );
  }
  
  async getPendingBookingsByDepartment(department) {
    const departmentBookings = await this.getBookingsByDepartment(department);
    return departmentBookings.filter(booking => booking.status === 'Pending');
  }
  
  async getBooking(id) {
    return this.bookings.get(id);
  }
  
  async createBooking(insertBooking) {
    const id = this.bookingCurrentId++;
    const booking = { 
      ...insertBooking, 
      id, 
      status: 'Pending',
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id, status) {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async checkSlotAvailability(resourceId, date, startTime, endTime) {
    // Get all approved bookings for this resource on this date
    const existingBookings = Array.from(this.bookings.values()).filter(
      (booking) => 
        booking.resourceId === resourceId && 
        booking.date === date &&
        booking.status === 'Approved'
    );
    
    // Convert times to minutes for easier comparison
    const convertTimeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newStartMinutes = convertTimeToMinutes(startTime);
    const newEndMinutes = convertTimeToMinutes(endTime);
    
    // Check for overlap with any existing booking
    for (const booking of existingBookings) {
      const existingStartMinutes = convertTimeToMinutes(booking.startTime);
      const existingEndMinutes = convertTimeToMinutes(booking.endTime);
      
      // Check if there's overlap
      if (!(newEndMinutes <= existingStartMinutes || newStartMinutes >= existingEndMinutes)) {
        return false; // Not available, there's a conflict
      }
    }
    
    return true; // Slot is available
  }
}

export const storage = new MemStorage();