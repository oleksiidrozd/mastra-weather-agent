import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const weatherSchema = pgSchema('weather')

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
