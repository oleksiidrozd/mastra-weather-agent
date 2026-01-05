# Story 6.5: Integrate SupabaseStore with Memory Configuration

Status: done

## Story

As a **developer**,
I want **the application to use SupabaseStore instead of LibSQLStore**,
So that **user data is stored in Supabase**.

## Acceptance Criteria

1. **Given** SupabaseStore is ready
   **When** I update `src/mastra/lib/memory.ts`
   **Then** it imports `SupabaseStore` from `./storage/index.js`
   **And** replaces `LibSQLStore` with:
   ```typescript
   export const storage = new SupabaseStore({
     connectionString: process.env.SUPABASE_DATABASE_URL!,
   })
   ```
   **And** removes `@mastra/libsql` import

2. **Given** `SUPABASE_DATABASE_URL` is not set
   **When** the application starts
   **Then** it throws a clear error about missing environment variable

## Tasks / Subtasks

- [x] Task 1: Update memory.ts imports (AC: #1)
  - [x] 1.1 Remove `import { LibSQLStore } from '@mastra/libsql'`
  - [x] 1.2 Add `import { SupabaseStore } from './storage/index.js'`

- [x] Task 2: Replace storage instantiation (AC: #1)
  - [x] 2.1 Replace `LibSQLStore` with `SupabaseStore`
  - [x] 2.2 Change config from `{ url: 'file:mastra.db' }` to `{ connectionString: process.env.SUPABASE_DATABASE_URL! }`

- [x] Task 3: Add environment variable validation (AC: #2)
  - [x] 3.1 Check if `SUPABASE_DATABASE_URL` is defined
  - [x] 3.2 Throw descriptive error if missing

## Dev Notes

### Architecture Patterns and Constraints

**Source:** [architecture.md#Database Migration: LibSQL to Supabase (Phase 2)](../_bmad-output/architecture.md)

This is the integration point where the migration switches from LibSQL to Supabase.

### Dependency on Previous Stories

**CRITICAL:** Stories 6.1-6.4 must be completed first:
- `src/db/schema.ts` - Drizzle schema
- `src/db/index.ts` - Drizzle client
- `src/mastra/lib/storage/supabaseStore.ts` - SupabaseStore class
- `src/mastra/lib/storage/index.ts` - Export barrel
- Tables must exist in Supabase (Story 6.2)

### Source Tree Components to Touch

**Files to MODIFY:**
```
src/mastra/lib/memory.ts   # Replace LibSQLStore with SupabaseStore
```

### Current Implementation (Before)

```typescript
// src/mastra/lib/memory.ts
import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { workingMemorySchema } from './types.js'

// LibSQL storage for persistence
export const storage = new LibSQLStore({
  url: 'file:mastra.db',
})

// Memory configuration with working memory schema
export const createAgentMemory = () => new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      schema: workingMemorySchema,
      scope: 'resource',
    },
  },
})
```

### Target Implementation (After)

```typescript
// src/mastra/lib/memory.ts
import { Memory } from '@mastra/memory'
import { SupabaseStore } from './storage/index.js'
import { workingMemorySchema } from './types.js'

// Validate environment variable
if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    'SUPABASE_DATABASE_URL environment variable is required. ' +
    'Please set it to your Supabase PostgreSQL connection string.'
  )
}

// Supabase storage for persistence
export const storage = new SupabaseStore({
  connectionString: process.env.SUPABASE_DATABASE_URL,
})

// Memory configuration with working memory schema
export const createAgentMemory = () => new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      schema: workingMemorySchema,
      scope: 'resource',
    },
  },
})
```

### Import Conventions

```typescript
// 1. External packages
import { Memory } from '@mastra/memory'

// 2. Internal modules (use .js extension for ESM)
import { SupabaseStore } from './storage/index.js'
import { workingMemorySchema } from './types.js'
```

### Environment Requirements

```env
SUPABASE_DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Breaking Change Notes

- `mastra.db` file will no longer be used after this change
- Existing LibSQL data is NOT migrated (new Supabase tables start empty)
- If data migration is needed, that's a separate task

### Testing Standards

- Manual verification: Run CLI, set preferences, verify in Supabase dashboard
- Verify error message when `SUPABASE_DATABASE_URL` is not set
- Integration tests in Story 6.7

### Project Structure Notes

- `@mastra/libsql` dependency can be removed from package.json after full migration
- Keep LibSQL dependency for now in case rollback is needed

### References

- [Architecture: Database Migration Section](../_bmad-output/architecture.md#database-migration-libsql-to-supabase-phase-2)
- [Current memory.ts](src/mastra/lib/memory.ts)
- [Story 6.4: Storage Export Barrel](_bmad-output/implementation-artifacts/6-4-create-storage-export-barrel.md)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

- Updated `src/mastra/lib/memory.ts` to use SupabaseStore instead of LibSQLStore
- Removed `import { LibSQLStore } from '@mastra/libsql'`
- Added `import { SupabaseStore } from './storage/index.js'`
- Added environment variable validation with descriptive error message
- Changed storage instantiation to use `connectionString: process.env.SUPABASE_DATABASE_URL`
- TypeScript compilation passes

### File List

- `src/mastra/lib/memory.ts` (MODIFIED) - Replaced LibSQLStore with SupabaseStore

### Change Log

- 2026-01-02: Implemented Story 6.5 - Integrated SupabaseStore with memory configuration
