import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", {
  code: text("code").primaryKey(), state: text("state").notNull(), version: integer("version").notNull().default(0), expiresAt: integer("expires_at").notNull(),
}, t => [index("idx_rooms_expires_at").on(t.expiresAt)]);
export const members = sqliteTable("members", {
  id: text("id").primaryKey(), roomCode: text("room_code").notNull().references(() => rooms.code, { onDelete: "cascade" }), tokenHash: text("token_hash").notNull(), lastSeen: integer("last_seen").notNull(),
}, t => [uniqueIndex("idx_members_token_hash").on(t.tokenHash), index("idx_members_room_code").on(t.roomCode)]);
export const limits = sqliteTable("request_limits", { key: text("key").primaryKey(), count: integer("count").notNull(), resetAt: integer("reset_at").notNull() });
