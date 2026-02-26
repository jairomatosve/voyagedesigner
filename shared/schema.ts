import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid, integer, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table (Profiles linked to Supabase Auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", { length: 20 }), // Optional for now, but captured in signup
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trips Table
export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  destination: text("destination"),
  visibility: varchar("visibility", { length: 20 }).default("private").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalBudget: real("total_budget").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 20 }).default("planning").notNull(), // planning, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ownerId: uuid("owner_id").references(() => users.id).notNull(), // FK to users
});

// Trip Destinations (Multi-stop logic)
export const tripDestinations = pgTable("trip_destinations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  location: text("location").notNull(),
  orderIndex: integer("order_index").notNull(), // 0, 1, 2...
  startDate: timestamp("start_date").notNull(), // Arrival
  endDate: timestamp("end_date").notNull(), // Departure
  transportType: varchar("transport_type", { length: 20 }), // flight, train, bus, car, ship - To get to the NEXT destination
});

// Trip Members (Multi-user roles)
export const tripMembers = pgTable("trip_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // admin, editor, viewer
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Itinerary Days
export const itineraryDays = pgTable("itinerary_days", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  date: timestamp("date").notNull(),
  dayIndex: integer("day_index").notNull(),
  notes: text("notes"),
});

// Activities
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  itineraryDayId: uuid("itinerary_day_id").references(() => itineraryDays.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  estimatedCost: real("estimated_cost").default(0),
  status: varchar("status", { length: 20 }).default("planned").notNull(), // planned, passed, failed
  type: varchar("type", { length: 50 }), // food, transport, attraction, etc.
});

// Expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(), // Who paid
  category: varchar("category", { length: 50 }).notNull(), // transport, food, accommodation, activities, other
  amount: real("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

// Zod Schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertTripSchema = createInsertSchema(trips);
export const selectTripSchema = createSelectSchema(trips);
export type Trip = z.infer<typeof selectTripSchema>;

export const insertTripDestinationSchema = createInsertSchema(tripDestinations);
export type TripDestination = typeof tripDestinations.$inferSelect;

export const insertTripMemberSchema = createInsertSchema(tripMembers);
export type TripMember = typeof tripMembers.$inferSelect;

export const insertItineraryDaySchema = createInsertSchema(itineraryDays);
export type ItineraryDay = typeof itineraryDays.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities);
export type Activity = typeof activities.$inferSelect;

export const insertExpenseSchema = createInsertSchema(expenses);
export type Expense = typeof expenses.$inferSelect;
