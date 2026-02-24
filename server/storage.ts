import { users, trips, tripMembers, tripDestinations, itineraryDays, activities, expenses } from "@shared/schema";
import type { User, InsertUser, Trip, TripMember, TripDestination } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User Profile Methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trip Methods
  createTrip(trip: Omit<typeof trips.$inferInsert, "id">, destinations: Omit<typeof tripDestinations.$inferInsert, "id" | "tripId">[], ownerId: string): Promise<Trip & { destinations: TripDestination[] }>;
  getTrip(tripId: string): Promise<(Trip & { destinations: TripDestination[] }) | undefined>;
  getTripsByUser(userId: string): Promise<(Trip & { destinations: TripDestination[] })[]>;
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

  async createTrip(insertTrip: Omit<typeof trips.$inferInsert, "id">, destinations: Omit<typeof tripDestinations.$inferInsert, "id" | "tripId">[], ownerId: string): Promise<Trip & { destinations: TripDestination[] }> {
    return await db.transaction(async (tx) => {
      const tripPayload = { ...insertTrip, ownerId } as typeof trips.$inferInsert;
      const [trip] = await tx.insert(trips).values(tripPayload).returning();

      // Automatically add the owner as an admin
      await tx.insert(tripMembers).values({
        tripId: trip.id,
        userId: ownerId,
        role: "admin",
      });

      // Insert all trip destinations
      const insertedDestinations = [];
      if (destinations && destinations.length > 0) {
        const destValues = destinations.map((d) => ({
          tripId: trip.id,
          location: d.location,
          orderIndex: d.orderIndex,
          startDate: d.startDate,
          endDate: d.endDate,
          transportType: d.transportType || null
        }));
        const inserted = await tx.insert(tripDestinations).values(destValues).returning();
        insertedDestinations.push(...inserted);
      }

      return { ...trip, destinations: insertedDestinations };
    });
  }

  async getTrip(tripId: string): Promise<(Trip & { destinations: TripDestination[] }) | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));
    if (!trip) return undefined;

    const destinations = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, tripId)).orderBy(tripDestinations.orderIndex);
    return { ...trip, destinations };
  }

  async getTripsByUser(userId: string): Promise<(Trip & { destinations: TripDestination[] })[]> {
    const userTrips = await db
      .select({ trip: trips })
      .from(trips)
      .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(eq(tripMembers.userId, userId));

    const result = [];
    for (const { trip } of userTrips) {
      const destinations = await db.select().from(tripDestinations).where(eq(tripDestinations.tripId, trip.id)).orderBy(tripDestinations.orderIndex);
      result.push({ ...trip, destinations });
    }

    return result;
  }
}

export const storage = new DatabaseStorage();
