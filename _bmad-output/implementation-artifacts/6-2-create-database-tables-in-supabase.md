# Story 6.2: Create Database Tables in Supabase

Status: done

## Story

As a **developer**,
I want **the `weather` schema and tables created in Supabase**,
So that **user data has a place to be stored**.

## Acceptance Criteria

1. **Given** Drizzle schema is defined and config exists
   **When** I run `npm run db:generate`
   **Then** migration files are generated in `./drizzle/` directory

2. **Given** migration files are generated
   **When** I run `npm run db:push`
   **Then** the `weather` schema is created in Supabase
   **And** `weather.users` table is created with correct columns and constraints
   **And** `weather.user_preferences` table is created with FK to users
   **And** no errors occur during migration

3. **Given** the tables are created
   **When** I check Supabase dashboard or run `npm run db:studio`
   **Then** I can see the tables and their structure

## Tasks / Subtasks

- [x] Task 1: Add database npm scripts to package.json (AC: #1, #3)
  - [x] 1.1 Add `"db:generate": "drizzle-kit generate"` script
  - [x] 1.2 Add `"db:push": "drizzle-kit push"` script
  - [x] 1.3 Add `"db:studio": "drizzle-kit studio"` script

- [x] Task 2: Generate migration files (AC: #1)
  - [x] 2.1 Ensure `SUPABASE_DATABASE_URL` is set in `.env`
  - [x] 2.2 Run `npm run db:generate`
  - [x] 2.3 Verify migration files created in `./drizzle/` directory
  - [x] 2.4 Review generated SQL for correctness

- [x] Task 3: Push schema to Supabase (AC: #2)
  - [x] 3.1 Run `npm run db:migrate` (applied migrations successfully)
  - [x] 3.2 Verify `weather` schema created
  - [x] 3.3 Verify `weather.users` table with correct structure
  - [x] 3.4 Verify `weather.user_preferences` table with FK constraint

- [x] Task 4: Verify table structure (AC: #3)
  - [x] 4.1 Run verification script to check Supabase tables
  - [x] 4.2 Confirm UUID columns, timestamps, FK relationship
  - [x] 4.3 Verified unique constraint on `user_id` in user_preferences

## Dev Notes

### Architecture Patterns and Constraints

**Source:** [architecture.md#Database Migration: LibSQL to Supabase (Phase 2)](../_bmad-output/architecture.md)

**Expected Table Structure:**

```sql
-- Schema for weather app tables
CREATE SCHEMA IF NOT EXISTS weather;

-- users table
CREATE TABLE weather.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  location TEXT,  -- maps to working memory: default_city
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- user_preferences table
CREATE TABLE weather.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES weather.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  units TEXT DEFAULT 'celsius' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### Dependency on Previous Story

**CRITICAL:** Story 6.1 must be completed first. This story requires:
- `src/db/schema.ts` - Drizzle schema definitions
- `src/db/index.ts` - Drizzle client (optional for this story)
- `drizzle.config.ts` - Drizzle Kit configuration

### Source Tree Components to Touch

**Files to MODIFY:**
```
package.json          # Add db:* scripts
```

**Files CREATED by drizzle-kit (auto-generated):**
```
drizzle/
├── 0000_*.sql       # Initial migration SQL
└── meta/
    └── _journal.json
```

### npm Scripts to Add

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Environment Requirements

**CRITICAL:** `SUPABASE_DATABASE_URL` must be set with a valid Supabase PostgreSQL connection string before running any db commands.

```env
SUPABASE_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Troubleshooting

**Common Issues:**

1. **"Schema 'weather' does not exist"** - Drizzle should create it, but if not, manually run:
   ```sql
   CREATE SCHEMA IF NOT EXISTS weather;
   ```

2. **Connection refused** - Check Supabase connection string format and ensure database is accessible

3. **Permission denied** - Ensure the database user has CREATE SCHEMA privileges

### Testing Standards

- Manual verification via Supabase dashboard or `db:studio`
- No automated tests for this story (infrastructure setup)
- Verification of table structure is acceptance criteria

### Project Structure Notes

- Migration files in `./drizzle/` should NOT be gitignored (track schema changes)
- `drizzle-kit push` is for development; use `drizzle-kit migrate` for production

### References

- [Architecture: Database Migration Section](../_bmad-output/architecture.md#database-migration-libsql-to-supabase-phase-2)
- [Story 6.1: Setup Drizzle Schema](_bmad-output/implementation-artifacts/6-1-setup-drizzle-schema-and-database-client.md)
- [Drizzle Kit Push Documentation](https://orm.drizzle.team/kit-docs/commands#push)
- [Drizzle Kit Generate Documentation](https://orm.drizzle.team/kit-docs/commands#generate)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial `db:push` failed with ENOTFOUND - user updated .env with valid Supabase URL
- `db:push` showed "No changes detected" - used `db:migrate` instead to apply migrations

### Completion Notes List

- Added `db:generate`, `db:migrate`, `db:push`, `db:studio` scripts to package.json
- Generated migration file `drizzle/0000_motionless_zarda.sql` containing:
  - CREATE SCHEMA "weather"
  - CREATE TABLE "weather"."users" with UUID PK, username, location, timestamps
  - CREATE TABLE "weather"."user_preferences" with UUID PK, user_id (unique FK), units, timestamps
  - FK constraint with CASCADE delete
- Applied migrations to Supabase using `drizzle-kit migrate`
- Verified `weather` schema exists in Supabase
- Verified both tables have correct structure: UUID columns, timestamp with timezone, FK relationship
- Added `dotenv` as dev dependency for local scripts
- TypeScript compilation passes
- 232 tests passing (38 are pre-existing TDD placeholders)

### File List

- `package.json` (MODIFIED) - Added db:generate, db:migrate, db:push, db:studio scripts
- `drizzle/0000_motionless_zarda.sql` (NEW) - Auto-generated migration SQL
- `drizzle/meta/_journal.json` (NEW) - Drizzle migration journal
- `drizzle/meta/0000_snapshot.json` (NEW) - Drizzle schema snapshot

### Change Log

- 2026-01-02: Implemented Story 6.2 - Created database tables in Supabase with weather schema
