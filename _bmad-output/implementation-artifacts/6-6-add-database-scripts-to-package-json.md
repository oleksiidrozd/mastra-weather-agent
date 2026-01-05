# Story 6.6: Add Database Scripts to package.json

Status: done

## Story

As a **developer**,
I want **convenient npm scripts for database operations**,
So that **I can easily manage migrations and inspect the database**.

## Acceptance Criteria

1. **Given** Drizzle Kit is installed
   **When** I update `package.json`
   **Then** it includes scripts:
   ```json
   {
     "db:generate": "drizzle-kit generate",
     "db:push": "drizzle-kit push",
     "db:studio": "drizzle-kit studio"
   }
   ```

2. **Given** the scripts are added
   **When** I run `npm run db:studio`
   **Then** Drizzle Studio opens in browser for database inspection

## Tasks / Subtasks

- [x] Task 1: Add database scripts to package.json (AC: #1)
  - [x] 1.1 Add `"db:generate": "drizzle-kit generate"` script
  - [x] 1.2 Add `"db:push": "drizzle-kit push"` script
  - [x] 1.3 Add `"db:studio": "drizzle-kit studio"` script
  - [x] 1.4 Added bonus `"db:migrate": "drizzle-kit migrate"` script

- [x] Task 2: Verify scripts work (AC: #2)
  - [x] 2.1 Scripts verified during Story 6.2 implementation
  - [x] 2.2 Verified connection to Supabase database

## Dev Notes

### Architecture Patterns and Constraints

**Source:** [architecture.md#Database Migration: LibSQL to Supabase (Phase 2)](../_bmad-output/architecture.md)

These scripts provide developer convenience for database management.

### Dependency on Previous Stories

**Note:** This story can technically be done earlier (after 6.1), but is placed here for logical flow. Requires:
- `drizzle.config.ts` exists (Story 6.1)
- `drizzle-kit` installed (already in devDependencies)

### Source Tree Components to Touch

**Files to MODIFY:**
```
package.json   # Add db:* scripts
```

### Current package.json Scripts (Before)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "dev": "mastra dev",
    "build": "mastra build",
    "start": "mastra start",
    "cli": "npx tsx src/cli/index.ts"
  }
}
```

### Target package.json Scripts (After)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "dev": "mastra dev",
    "build": "mastra build",
    "start": "mastra start",
    "cli": "npx tsx src/cli/index.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Script Descriptions

| Script | Purpose |
|--------|---------|
| `db:generate` | Generate SQL migration files from schema changes |
| `db:push` | Push schema changes directly to database (dev only) |
| `db:studio` | Open Drizzle Studio GUI for database inspection |

### Environment Requirements

`SUPABASE_DATABASE_URL` must be set for all db commands to work.

### Testing Standards

- Manual verification: Run each script and verify expected behavior
- `db:studio` should open browser at `https://local.drizzle.studio`

### Project Structure Notes

- Scripts use `drizzle-kit` which is already installed as devDependency
- `drizzle.config.ts` at project root is required for these scripts

### References

- [Architecture: Database Migration Section](../_bmad-output/architecture.md#database-migration-libsql-to-supabase-phase-2)
- [Story 6.1: Setup Drizzle Schema](_bmad-output/implementation-artifacts/6-1-setup-drizzle-schema-and-database-client.md)
- [Drizzle Kit Commands](https://orm.drizzle.team/kit-docs/commands)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - this story was completed as part of Story 6.2

### Completion Notes List

- Scripts were already added during Story 6.2 implementation
- `db:generate`, `db:migrate`, `db:push`, `db:studio` all present in package.json
- Scripts verified working during Story 6.2

### File List

- `package.json` (MODIFIED in Story 6.2) - Contains all db:* scripts

### Change Log

- 2026-01-02: Marked as done - scripts already implemented in Story 6.2
