import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { timestamp, pgTable, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar().primaryKey(),
  username: varchar().unique().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  securityStamp: varchar('security_stamp').notNull(),
  discordId: varchar('discord_id').unique('discord_id', { nulls: 'not distinct' }),
  roles: varchar().array(),
});

export const userRelation = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export type User = InferSelectModel<typeof users>;

export const sessions = pgTable('sessions', {
  id: varchar().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  userId: varchar('user_id').notNull(),
  securityStamp: varchar('security_stamp').notNull(),
});

export const sessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = InferSelectModel<typeof sessions>;
