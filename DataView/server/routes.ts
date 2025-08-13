import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIInsights } from "./services/ai-analysis";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Insights endpoint
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: "Valid data array is required" });
      }

      const insights = await generateAIInsights(data);
      res.json(insights);
    } catch (error) {
      console.error("AI insights generation error:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  // Save dashboard data
  app.post("/api/dashboard-data", async (req, res) => {
    try {
      const { dataSource, dataConfig, data } = req.body;
      
      const savedData = await storage.saveDashboardData({
        dataSource,
        dataConfig,
        data,
      });

      res.json(savedData);
    } catch (error) {
      console.error("Save dashboard data error:", error);
      res.status(500).json({ message: "Failed to save dashboard data" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard-data/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await storage.getDashboardData(id);
      
      if (!data) {
        return res.status(404).json({ message: "Dashboard data not found" });
      }

      res.json(data);
    } catch (error) {
      console.error("Get dashboard data error:", error);
      res.status(500).json({ message: "Failed to retrieve dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
