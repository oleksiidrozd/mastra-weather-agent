import { pgSchema, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

export const weatherSchema = pgSchema('weather')

// User profile and preferences
export const users = weatherSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username'),
  location: text('location'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const userPreferences = weatherSchema.table('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  units: text('units').default('celsius').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const threads = weatherSchema.table('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceId: text('resourceId').notNull(),
  title: text('title'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('threads_resourceId_createdAt_idx').on(table.resourceId, table.createdAt),
])

export const messages = weatherSchema.table('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  role: text('role').notNull(),
  resourceId: text('resourceId'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('messages_thread_id_createdAt_idx').on(table.threadId, table.createdAt),
])
