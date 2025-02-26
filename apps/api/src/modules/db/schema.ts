import type { EnumType } from '@/utils/types';
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

export const registrationType = {
  discord: 'discord',
} as const;
export type RegistrationType = EnumType<typeof registrationType>;

export const registrations = pgTable('registrations', {
  id: varchar().primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  type: varchar().notNull(),
  discordId: varchar('discord_id'),
  usernameSuggestion: varchar('username_suggestion'),
});

export const grantCodes = pgTable('grantcodes', {
  id: varchar().primaryKey(),
  userId: varchar().notNull(),
  token: varchar().notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

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
