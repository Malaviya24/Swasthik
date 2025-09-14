import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoUrl: text("photo_url"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // 'text' | 'image' | 'voice'
  metadata: jsonb("metadata"), // for storing additional data like image URLs, voice transcripts
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  reminderType: text("reminder_type").notNull(), // 'medication' | 'appointment' | 'vaccination' | 'checkup'
  scheduledAt: timestamp("scheduled_at").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recordType: text("record_type").notNull(), // 'symptom_check' | 'medication_lookup' | 'image_analysis'
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

// Additional schemas for health features
export const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  genericName: z.string(),
  category: z.string(),
  description: z.string(),
  dosage: z.string(),
  sideEffects: z.array(z.string()),
  precautions: z.array(z.string()),
  interactions: z.array(z.string()),
  price: z.string()
});

export const healthCenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  hospitalType: z.enum(["Government", "Private"]),
  address: z.string(),
  phone: z.string(),
  rating: z.number(),
  distance: z.string(),
  specialties: z.array(z.string()),
  timings: z.string(),
  emergency: z.boolean()
});

export const symptomAnalysisSchema = z.object({
  age: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : undefined),
  gender: z.string().optional(),
  symptoms: z.string(),
  duration: z.string().optional()
});

export const medicationSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required')
});

export const healthCenterSearchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  type: z.string().optional(),
  search: z.string().optional()
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type Medication = z.infer<typeof medicationSchema>;
export type HealthCenter = z.infer<typeof healthCenterSchema>;
export type SymptomAnalysisRequest = z.infer<typeof symptomAnalysisSchema>;
export type MedicationSearchRequest = z.infer<typeof medicationSearchSchema>;
export type HealthCenterSearchRequest = z.infer<typeof healthCenterSearchSchema>;
