import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Groups table
export const groups = pgTable("groups", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Unified notes table that can store both regular notes and URLs
export const notes = pgTable("notes", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  pinned: timestamp("pinned"),
  groupId: text("group_id").references(() => groups.id, { onDelete: 'set null' }),
  isUrl: boolean("is_url").default(false),
});

// URLs table with group relationship
export const groupUrls = pgTable("group_urls", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  pinned: timestamp("pinned"), // By default, this is nullable
  groupId: text("group_id").references(() => groups.id, { onDelete: 'set null' }),
});

// Many-to-many relationship table (for URLs that belong to multiple groups)
export const urlToGroups = pgTable("url_to_groups", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  urlId: text("url_id").notNull().references(() => groupUrls.id, { onDelete: 'cascade' }),
  groupId: text("group_id").notNull().references(() => groups.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});
