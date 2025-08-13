import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dashboardData = pgTable("dashboard_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  dataSource: text("data_source").notNull(), // 'csv' or 'firebase'
  dataConfig: jsonb("data_config"), // Firebase config or CSV metadata
  data: jsonb("data").notNull(), // The actual data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardDataId: varchar("dashboard_data_id").references(() => dashboardData.id),
  type: text("type").notNull(), // 'trend', 'anomaly', 'recommendation'
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDashboardDataSchema = createInsertSchema(dashboardData).pick({
  dataSource: true,
  dataConfig: true,
  data: true,
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DashboardData = typeof dashboardData.$inferSelect;
export type InsertDashboardData = z.infer<typeof insertDashboardDataSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;
export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
