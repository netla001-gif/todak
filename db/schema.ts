import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Shared family feedback on places actually visited. No per-user distinction:
// either partner rating a place updates the same row.
export const placeFeedback = sqliteTable("place_feedback", {
  placeId: text("place_id").primaryKey(),
  rating: text("rating").notNull(), // "liked" | "disliked"
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
