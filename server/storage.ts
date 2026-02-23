import { users, trips, tripMembers, itineraryDays, activities, expenses } from "@shared/schema";
import type { User, InsertUser, Trip, InsertTrip, TripMember } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User Profile Methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trip Methods
  createTrip(trip: Omit<InsertTrip, "id">, ownerId: string): Promise<Trip>;
  getTrip(tripId: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createTrip(insertTrip: Omit<InsertTrip, "id">, ownerId: string): Promise<Trip> {
    // Start transaction since we need to create trip and trip_members
    return await db.transaction(async (tx) => {
      const [trip] = await tx.insert(trips).values({ ...insertTrip, ownerId }).returning();

      // Automatically add the owner as an admin
      await tx.insert(tripMembers).values({
        tripId: trip.id,
        userId: ownerId,
        role: "admin",
      });

      return trip;
    });
  }

  async getTrip(tripId: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    return trip;
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    const userTrips = await db
      .select({ trip: trips })
      .from(trips)
      .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(eq(tripMembers.userId, userId));
    return userTrips.map((rs) => rs.trip);
  }
}

export const storage = new DatabaseStorage();
