import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const groupUrls = pgTable("group_urls", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  pinned: timestamp("pinned"), // By default, this is nullable
});
