# Story 6.1: Setup Drizzle Schema and Database Client

Status: done

## Story

As a **developer**,
I want **Drizzle ORM configured with schema definitions for users and preferences tables**,
So that **I have type-safe database access for custom tables**.

## Acceptance Criteria

1. **Given** the project needs Supabase integration
   **When** I create `src/db/schema.ts`
   **Then** it defines:
   - `weatherSchema` using `pgSchema('weather')`
   - `users` table with: id (UUID PK), username (TEXT), location (TEXT), created_at, updated_at
   - `userPreferences` table with: id (UUID PK), user_id (UUID FK to users), units (TEXT), created_at, updated_at
   **And** `userPreferences.userId` has a unique constraint and CASCADE delete

2. **Given** the schema is defined
   **When** I create `src/db/index.ts`
   **Then** it initializes a pg Pool with `SUPABASE_DATABASE_URL`
   **And** exports a configured Drizzle instance with the schema

3. **Given** Drizzle Kit is needed for migrations
   **When** I create `drizzle.config.ts`
   **Then** it configures:
   - Schema path: `./src/db/schema.ts`
   - Output path: `./drizzle`
   - Dialect: `postgresql`
   - DB credentials from `SUPABASE_DATABASE_URL`

## Tasks / Subtasks

- [x] Task 1: Create Drizzle schema file (AC: #1)
  - [x] 1.1 Create `src/db/` directory
  - [x] 1.2 Create `src/db/schema.ts` with `weatherSchema` using `pgSchema('weather')`
  - [x] 1.3 Define `users` table with UUID PK, username, location, timestamps
  - [x] 1.4 Define `userPreferences` table with UUID PK, FK to users, units, timestamps
  - [x] 1.5 Add unique constraint on `userId` and CASCADE delete on FK

- [x] Task 2: Create Drizzle database client (AC: #2)
  - [x] 2.1 Create `src/db/index.ts`
  - [x] 2.2 Initialize pg Pool with `SUPABASE_DATABASE_URL` from environment
  - [x] 2.3 Create and export Drizzle instance with schema
  - [x] 2.4 Export pool for potential reuse

- [x] Task 3: Create Drizzle Kit configuration (AC: #3)
  - [x] 3.1 Create `drizzle.config.ts` at project root
  - [x] 3.2 Configure schema path to `./src/db/schema.ts`
  - [x] 3.3 Configure output path to `./drizzle`
  - [x] 3.4 Set dialect to `postgresql`
  - [x] 3.5 Configure dbCredentials using `SUPABASE_DATABASE_URL`

## Dev Notes

### Architecture Patterns and Constraints

**Source:** [architecture.md#Database Migration: LibSQL to Supabase (Phase 2)](../_bmad-output/architecture.md)

- Use `pgSchema('weather')` to create tables in a separate PostgreSQL schema from Mastra's `public` schema
- All timestamps must use `withTimezone: true` for consistency with Supabase
- Use `defaultRandom()` for UUID generation (PostgreSQL native)
- Drizzle ORM version: `^0.45.1` (already installed)
- pg driver version: `^8.16.3` (already installed)
- drizzle-kit version: `^0.31.8` (already installed as dev dependency)

**Working Memory Field Mapping:**
| Working Memory Field | Normalized Table.Column |
|---------------------|-------------------------|
| `default_city` | `weather.users.location` |
| `user_name` | `weather.users.username` |
| `preferred_units` | `weather.user_preferences.units` |

### Source Tree Components to Touch

**Files to CREATE:**
```
src/
└── db/
    ├── schema.ts     # Drizzle schema definitions
    └── index.ts      # Drizzle client initialization

drizzle.config.ts     # Drizzle Kit configuration (project root)
```

### Code Implementation Reference

**Schema Definition Pattern (from architecture.md):**
```typescript
// src/db/schema.ts
import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const weatherSchema = pgSchema('weather');

export const users = weatherSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username'),
  location: text('location'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userPreferences = weatherSchema.table('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).unique().notNull(),
  units: text('units').default('celsius').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**Drizzle Client Pattern (from architecture.md):**
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export { pool };
```

**Drizzle Config Pattern (from architecture.md):**
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!,
  },
});
```

### Testing Standards

- No unit tests required for this story (schema definitions and config files)
- Verification will occur in Story 6.2 when running `db:push`
- TypeScript compilation serves as validation of schema correctness

### Import Conventions

Follow existing project patterns:
```typescript
// 1. External packages first
import { pgSchema, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// 2. Internal modules (use .js extension for ESM)
import * as schema from './schema.js';
```

### Project Structure Notes

- `src/db/` is a NEW directory at the same level as `src/mastra/` and `src/cli/`
- This follows the architecture pattern of separating concerns
- `drizzle.config.ts` goes in project root (same level as `package.json`)

### References

- [Architecture: Database Migration Section](../_bmad-output/architecture.md#database-migration-libsql-to-supabase-phase-2)
- [Implementation Plan](~/.claude/plans/buzzing-discovering-meteor.md)
- [Drizzle ORM PostgreSQL Documentation](https://orm.drizzle.team/docs/get-started-postgresql)
- [Drizzle Schema Docs](https://orm.drizzle.team/docs/sql-schema-declaration)

### Environment Requirements

Ensure `SUPABASE_DATABASE_URL` is set in `.env`:
```env
SUPABASE_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Current .env status:** Placeholder added, user needs to provide actual Supabase connection string.

### Dependencies Already Installed

```json
{
  "dependencies": {
    "drizzle-orm": "^0.45.1",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@types/pg": "^8.16.0",
    "drizzle-kit": "^0.31.8"
  }
}
```

No additional package installation required.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - No issues encountered during implementation.

### Completion Notes List

- Created `src/db/schema.ts` with `weatherSchema` using `pgSchema('weather')` to isolate from Mastra's public schema
- Defined `users` table: UUID PK with `defaultRandom()`, username (TEXT), location (TEXT), created_at/updated_at with timezone
- Defined `userPreferences` table: UUID PK, userId FK to users with CASCADE delete and UNIQUE constraint, units (TEXT default 'celsius')
- Created `src/db/index.ts` with pg Pool using `SUPABASE_DATABASE_URL` and Drizzle instance with schema
- Created `drizzle.config.ts` at project root with postgresql dialect and proper paths
- TypeScript compilation passes - schema types are valid
- No unit tests required per story Dev Notes - verification via `db:push` in Story 6.2
- 232 tests passing, 38 failures are pre-existing TDD "red phase" placeholders unrelated to this story

### File List

- `src/db/schema.ts` (NEW) - Drizzle schema definitions for weather.users and weather.user_preferences tables
- `src/db/index.ts` (NEW) - Drizzle client initialization with pg Pool
- `drizzle.config.ts` (NEW) - Drizzle Kit configuration for migrations

### Change Log

- 2026-01-02: Implemented Story 6.1 - Setup Drizzle schema and database client for Supabase integration
