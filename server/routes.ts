import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertTripSchema } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://your-project.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "dummy";
export const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

// Extending Express Request object to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: import("@supabase/supabase-js").User;
    }
  }
}

// Simple authentication middleware using Supabase JWT
async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  // Verify the JWT with Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // === TRIPS CRUD ===

  // Get all trips for the authenticated user
  app.get("/api/trips", authenticateUser, async (req, res) => {
    try {
      const trips = await storage.getTripsByUser(req.user.id);
      res.json(trips);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  // Get a specific trip
  app.get("/api/trips/:id", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  // Create a new trip
  app.post("/api/trips", authenticateUser, async (req, res) => {
    try {
      const parsedData = insertTripSchema.omit({ id: true, ownerId: true }).parse(req.body);
      const trip = await storage.createTrip(parsedData, req.user.id);
      res.status(201).json(trip);
    } catch (error) {
      res.status(400).json({ error: "Invalid trip data" });
    }
  });

  // === AI FEATURES ===

  // Generate Itinerary (Gemini)
  app.post("/api/trips/:id/generate", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });

      const { interests, pace } = req.body;

      // Use gemini-1.5-flash for fast generic generation
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a travel planning assistant. Plan a day-by-day JSON itinerary for a trip to ${trip.destination} from ${trip.startDate} to ${trip.endDate}. Interests: ${interests}, Pace: ${pace}. Return JSON output only matching this structure: { "itinerary": { "days": [ { "day_index": 1, "date": "...", "activities": [ { "title": "...", "description": "...", "startTime": "...", "endTime": "...", "estimatedCost": 0 } ] } ] } }`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const responseText = result.response.text();
      const itinerary = JSON.parse(responseText);

      res.json({ itinerary });

    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Reoptimize Itinerary (Gemini)
  app.post("/api/trips/:id/reoptimize", authenticateUser, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });

      const { failedActivity, timeAvailable, constraints } = req.body;

      // Use gemini-1.5-flash since we want speed
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are an intelligent travel reoptimizer. A trip to ${trip.destination} had a disruption. The activity "${failedActivity}" failed. I have ${timeAvailable} hours available. 
Constraints: ${JSON.stringify(constraints)}.
Suggest 2 optimized alternatives. 
Return valid JSON only matching this structure: { "suggestions": [ { "title": "...", "description": "...", "duration": "...", "estimatedCost": 0 } ] }`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const responseText = result.response.text();
      const suggestions = JSON.parse(responseText);

      res.json({ suggestions });

    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to reoptimize itinerary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
