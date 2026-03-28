import type { EnumType } from '@/utils/types';
import type { InferSelectModel } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { timestamp, pgTable, varchar, integer, unique } from 'drizzle-orm/pg-core';

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

export type Registration = InferSelectModel<typeof registrations>;

export const grantCodes = pgTable('grantcodes', {
  id: varchar().primaryKey(),
  userId: varchar().notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar().notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const sessions = pgTable('sessions', {
  id: varchar().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  securityStamp: varchar('security_stamp').notNull(),
});

export const sessionRelation = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = InferSelectModel<typeof sessions>;

export const progressItems = pgTable('progress_items', {
  id: varchar().primaryKey(),
  mangaId: varchar('manga_id').notNull(),
  chapterId: varchar('chapter_id').notNull(),
  chapterName: varchar('chapter_name').notNull(),
  updatedAt: timestamp('expires_at').notNull(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentPage: integer('current_page').notNull(),
  totalPages: integer('total_pages').notNull(),
  mangaMetaId: varchar('manga_meta_id').references(() => mangaMetas.id, { onDelete: 'restrict' }),
}, t => [
  unique().on(t.userId, t.chapterId, t.mangaId),
]);

export const progressItemRelation = relations(progressItems, ({ one }) => ({
  user: one(users, {
    fields: [progressItems.userId],
    references: [users.id],
  }),
}));

export type ProgressItem = InferSelectModel<typeof progressItems>;

export const lists = pgTable('lists', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const listRelation = relations(lists, ({ one }) => ({
  user: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
}));

export type List = InferSelectModel<typeof lists>;

export const listItems = pgTable('list_items', {
  id: varchar().primaryKey(),
  listId: varchar('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  mangaId: varchar('mangda_id').notNull(),
  mangaMetaId: varchar('manga_meta_id').references(() => mangaMetas.id, { onDelete: 'restrict' }),
});

export const listItemRelation = relations(listItems, ({ one }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
}));

export type ListItem = InferSelectModel<typeof listItems>;

export const mangaMetas = pgTable('manga_metas', {
  id: varchar().primaryKey(),
  data: varchar().notNull(),
});

export type MangaMetaDb = InferSelectModel<typeof mangaMetas>;

export const cacheItems = pgTable('cache_items', {
  key: varchar().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  data: varchar().notNull(),
});
