// Database schema for authentication system using Drizzle ORM
import { pgTable, varchar, text, integer, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

// Users table with background profiling fields
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),

  // Background profiling fields
  software_experience: jsonb('software_experience').default([]),
  hardware_familiarity: jsonb('hardware_familiarity').default([]),
  years_coding: integer('years_coding').default(0),
  years_hardware: integer('years_hardware').default(0),
  primary_languages: jsonb('primary_languages').default([]),
  development_area: varchar('development_area', { length: 100 }),
  preferred_platforms: jsonb('preferred_platforms').default([]),
  robotics_experience: varchar('robotics_experience', { length: 50 }).default('none'),

  // Calculated fields
  skill_level: varchar('skill_level', { length: 50 }).default('beginner'),
  interests: jsonb('interests').default([]),
  learning_path: text('learning_path'),

  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  ip_address: varchar('ip_address', { length: 45 }),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
