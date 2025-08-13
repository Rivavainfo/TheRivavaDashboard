import { type User, type InsertUser, type DashboardData, type InsertDashboardData, type AIInsight, type InsertAIInsight } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  saveDashboardData(data: InsertDashboardData): Promise<DashboardData>;
  getDashboardData(id: string): Promise<DashboardData | undefined>;
  
  saveAIInsights(insights: InsertAIInsight[]): Promise<AIInsight[]>;
  getAIInsights(dashboardDataId: string): Promise<AIInsight[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dashboardData: Map<string, DashboardData>;
  private aiInsights: Map<string, AIInsight>;

  constructor() {
    this.users = new Map();
    this.dashboardData = new Map();
    this.aiInsights = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveDashboardData(data: InsertDashboardData): Promise<DashboardData> {
    const id = randomUUID();
    const dashboardDataEntry: DashboardData = {
      id,
      userId: null,
      dataSource: data.dataSource,
      dataConfig: data.dataConfig || null,
      data: data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    this.dashboardData.set(id, dashboardDataEntry);
    return dashboardDataEntry;
  }

  async getDashboardData(id: string): Promise<DashboardData | undefined> {
    return this.dashboardData.get(id);
  }

  async saveAIInsights(insights: InsertAIInsight[]): Promise<AIInsight[]> {
    const savedInsights: AIInsight[] = [];
    for (const insight of insights) {
      const id = randomUUID();
      const aiInsight: AIInsight = {
        id,
        dashboardDataId: insight.dashboardDataId || null,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        createdAt: new Date(),
      };
      this.aiInsights.set(id, aiInsight);
      savedInsights.push(aiInsight);
    }
    return savedInsights;
  }

  async getAIInsights(dashboardDataId: string): Promise<AIInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      insight => insight.dashboardDataId === dashboardDataId
    );
  }
}

export const storage = new MemStorage();
