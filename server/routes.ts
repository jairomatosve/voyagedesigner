import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertTripSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const tokenStore = new Map<string, { userId: string; expiresAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  const session = tokenStore.get(token);
  if (!session || session.expiresAt < Date.now()) {
    tokenStore.delete(token);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = session.userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        passwordHash,
        displayName: name || email.split("@")[0],
      });

      const token = generateToken();
      tokenStore.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        user: { id: user.id, email: user.email, displayName: user.displayName },
        token,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken();
      tokenStore.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });

      res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName },
        token,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", authenticateUser, async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) tokenStore.delete(token);
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ id: user.id, email: user.email, displayName: user.displayName });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/trips", authenticateUser, async (req, res) => {
    try {
      const trips = await storage.getTripsByUser(req.userId!);
      res.json(trips);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  app.post("/api/trips", authenticateUser, async (req, res) => {
    try {
      const parsedData = insertTripSchema.omit({ id: true, ownerId: true }).parse(req.body);
      const trip = await storage.createTrip(parsedData, req.userId!);
      res.status(201).json(trip);
    } catch (error) {
      res.status(400).json({ error: "Invalid trip data" });
    }
  });

  app.post("/api/trips/:id/generate", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });

      const { interests, pace } = req.body;
      const dayCount = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)));

      const days = [];
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(trip.startDate);
        date.setDate(date.getDate() + i);
        days.push({
          day_index: i + 1,
          date: date.toISOString().split("T")[0],
          activities: [
            {
              title: `Explore ${trip.destination} - Day ${i + 1}`,
              description: `Discover the highlights of ${trip.destination} based on your ${interests || "general"} interests.`,
              startTime: "09:00",
              endTime: "12:00",
              estimatedCost: Math.floor(Math.random() * 50) + 20,
            },
            {
              title: `Local Experience - Day ${i + 1}`,
              description: `Enjoy local cuisine and culture in ${trip.destination}.`,
              startTime: "13:00",
              endTime: "17:00",
              estimatedCost: Math.floor(Math.random() * 80) + 30,
            },
          ],
        });
      }

      res.json({ itinerary: { days } });
    } catch (error) {
      console.error("Generate Error:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  app.post("/api/trips/:id/reoptimize", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });

      const { failedActivity } = req.body;

      res.json({
        suggestions: [
          {
            title: `Alternative to ${failedActivity || "activity"}`,
            description: `A great alternative experience in ${trip.destination}.`,
            duration: "2 hours",
            estimatedCost: Math.floor(Math.random() * 60) + 15,
          },
          {
            title: `Relaxed option near ${trip.destination}`,
            description: `Take it easy with this nearby attraction.`,
            duration: "1.5 hours",
            estimatedCost: Math.floor(Math.random() * 40) + 10,
          },
        ],
      });
    } catch (error) {
      console.error("Reoptimize Error:", error);
      res.status(500).json({ error: "Failed to reoptimize itinerary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
