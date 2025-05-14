import { pgTable, pgEnum, serial, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create enums
export const roleEnum = pgEnum('role', ['Student', 'Faculty', 'HOD']);
export const departmentEnum = pgEnum('department', ['CSE', 'ISE', 'AIML']);
export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Approved', 'Rejected']);
export const resourceTypeEnum = pgEnum('resource_type', ['Lab', 'Seminar Hall']);

// Create tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: roleEnum("role").notNull(),
  department: departmentEnum("department").notNull(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: resourceTypeEnum("type").notNull(),
  department: departmentEnum("department").notNull(),
  capacity: integer("capacity"),
  features: text("features"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  resourceId: integer("resource_id").references(() => resources.id).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // Format: YYYY-MM-DD
  startTime: varchar("start_time", { length: 5 }).notNull(), // Format: HH:MM
  endTime: varchar("end_time", { length: 5 }).notNull(), // Format: HH:MM
  purpose: text("purpose").notNull(),
  status: bookingStatusEnum("status").default("Pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertResourceSchema = createInsertSchema(resources);
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  createdAt: true,
  userId: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  department: z.enum(["CSE", "ISE", "AIML"], {
    required_error: "Department is required",
  }),
});