# Story 6.3: Implement SupabaseStore Class

Status: review

## Story

As a **developer**,
I want **a custom storage adapter that extends PostgresStore and uses Drizzle for user data**,
So that **Mastra's memory system works with normalized tables**.

## Acceptance Criteria

1. **Given** Drizzle is configured
   **When** I create `src/mastra/lib/storage/supabaseStore.ts`
   **Then** it exports `SupabaseStore` class extending `PostgresStore`
   **And** the constructor accepts `{ connectionString: string }`
   **And** it initializes a Drizzle instance for custom queries

2. **Given** SupabaseStore is implemented
   **When** `getResourceById({ resourceId })` is called with a valid UUID
   **Then** it queries `weather.users` LEFT JOIN `weather.user_preferences`
   **And** reconstructs workingMemory JSON: `{ default_city, user_name, preferred_units }`
   **And** returns `StorageResourceType` with id, workingMemory, createdAt, updatedAt
   **And** returns `null` if user not found

3. **Given** SupabaseStore is implemented
   **When** `saveResource({ resource })` is called with a new user UUID
   **Then** it parses resource.workingMemory JSON
   **And** uses a Drizzle transaction to:
     - INSERT into users (id, username, location)
     - INSERT into user_preferences (user_id, units)
   **And** handles conflicts gracefully (ON CONFLICT DO NOTHING)
   **And** returns the saved resource via getResourceById

4. **Given** SupabaseStore is implemented
   **When** `updateResource({ resourceId, workingMemory })` is called
   **Then** it parses workingMemory JSON
   **And** uses a Drizzle transaction to:
     - UPSERT users (preserve existing values for null fields)
     - UPSERT user_preferences
   **And** uses `onConflictDoUpdate` for both tables
   **And** returns the updated resource via getResourceById

## Tasks / Subtasks

- [x] Task 1: Create storage directory and SupabaseStore class structure (AC: #1)
  - [x] 1.1 Create `src/mastra/lib/storage/` directory
  - [x] 1.2 Create `src/mastra/lib/storage/supabaseStore.ts`
  - [x] 1.3 Import `PostgresStore` from `@mastra/pg`
  - [x] 1.4 Import Drizzle client and schema from `../../../db/index.js`
  - [x] 1.5 Create `SupabaseStore` class extending `PostgresStore`
  - [x] 1.6 Initialize Drizzle instance in constructor

- [x] Task 2: Implement getResourceById method (AC: #2)
  - [x] 2.1 Override `getResourceById({ resourceId })` method
  - [x] 2.2 Query `users` LEFT JOIN `userPreferences` using Drizzle
  - [x] 2.3 Return `null` if no user found
  - [x] 2.4 Reconstruct workingMemory JSON from normalized fields
  - [x] 2.5 Return `StorageResourceType` with id, workingMemory, createdAt, updatedAt

- [x] Task 3: Implement saveResource method (AC: #3)
  - [x] 3.1 Override `saveResource({ resource })` method
  - [x] 3.2 Parse `resource.workingMemory` JSON string
  - [x] 3.3 Use Drizzle transaction for atomicity
  - [x] 3.4 INSERT into `users` table with `onConflictDoNothing()`
  - [x] 3.5 INSERT into `userPreferences` table with `onConflictDoNothing()`
  - [x] 3.6 Return result via `getResourceById()`

- [x] Task 4: Implement updateResource method (AC: #4)
  - [x] 4.1 Override `updateResource({ resourceId, workingMemory, metadata })` method
  - [x] 4.2 Parse `workingMemory` JSON string
  - [x] 4.3 Use Drizzle transaction for atomicity
  - [x] 4.4 UPSERT `users` with `onConflictDoUpdate()`, preserving existing values
  - [x] 4.5 UPSERT `userPreferences` with `onConflictDoUpdate()`
  - [x] 4.6 Return result via `getResourceById()`

## Dev Notes

### Architecture Patterns and Constraints

**Source:** [architecture.md#Database Migration: LibSQL to Supabase (Phase 2)](../_bmad-output/architecture.md)

**Hybrid Storage Pattern:**
- `PostgresStore` handles Mastra-managed tables (threads, messages, workflows)
- `SupabaseStore` overrides ONLY resource methods for custom user tables
- All other operations delegate to parent class

**Working Memory Field Mapping:**
| Working Memory Field | Normalized Table.Column |
|---------------------|-------------------------|
| `default_city` | `weather.users.location` |
| `user_name` | `weather.users.username` |
| `preferred_units` | `weather.user_preferences.units` |

### Dependency on Previous Stories

**CRITICAL:** Stories 6.1 and 6.2 must be completed first:
- `src/db/schema.ts` - Drizzle schema definitions
- `src/db/index.ts` - Drizzle client
- Tables must exist in Supabase

### Source Tree Components to Touch

**Files to CREATE:**
```
src/mastra/lib/storage/
└── supabaseStore.ts   # SupabaseStore class
```

### StorageResourceType Interface

From `@mastra/core/storage`:
```typescript
interface StorageResourceType {
  id: string;
  workingMemory?: string;  // JSON string
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Complete Implementation Pattern

```typescript
// src/mastra/lib/storage/supabaseStore.ts
import { PostgresStore } from '@mastra/pg';
import type { StorageResourceType } from '@mastra/core/storage';
import { db } from '../../../db/index.js';
import { users, userPreferences } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export class SupabaseStore extends PostgresStore {
  private drizzle = db;

  async getResourceById({ resourceId }: { resourceId: string }): Promise<StorageResourceType | null> {
    const result = await this.drizzle
      .select()
      .from(users)
      .leftJoin(userPreferences, eq(users.id, userPreferences.userId))
      .where(eq(users.id, resourceId));

    if (!result.length) return null;

    const row = result[0];
    return {
      id: resourceId,
      workingMemory: JSON.stringify({
        default_city: row.users.location ?? undefined,
        user_name: row.users.username ?? undefined,
        preferred_units: row.user_preferences?.units ?? 'celsius',
      }),
      createdAt: row.users.createdAt,
      updatedAt: row.users.updatedAt,
    };
  }

  async saveResource({ resource }: { resource: StorageResourceType }): Promise<StorageResourceType> {
    const wm = JSON.parse(resource.workingMemory || '{}');

    await this.drizzle.transaction(async (tx) => {
      await tx.insert(users).values({
        id: resource.id,
        username: wm.user_name ?? null,
        location: wm.default_city ?? null,
      }).onConflictDoNothing();

      await tx.insert(userPreferences).values({
        userId: resource.id,
        units: wm.preferred_units ?? 'celsius',
      }).onConflictDoNothing();
    });

    const saved = await this.getResourceById({ resourceId: resource.id });
    return saved!;
  }

  async updateResource({
    resourceId,
    workingMemory,
    metadata
  }: {
    resourceId: string;
    workingMemory?: string;
    metadata?: Record<string, unknown>;
  }): Promise<StorageResourceType> {
    const wm = JSON.parse(workingMemory || '{}');

    await this.drizzle.transaction(async (tx) => {
      // Upsert user
      await tx.insert(users).values({
        id: resourceId,
        username: wm.user_name ?? null,
        location: wm.default_city ?? null,
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          ...(wm.user_name !== undefined && { username: wm.user_name }),
          ...(wm.default_city !== undefined && { location: wm.default_city }),
          updatedAt: new Date(),
        },
      });

      // Upsert preferences
      await tx.insert(userPreferences).values({
        userId: resourceId,
        units: wm.preferred_units ?? 'celsius',
      }).onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...(wm.preferred_units !== undefined && { units: wm.preferred_units }),
          updatedAt: new Date(),
        },
      });
    });

    const updated = await this.getResourceById({ resourceId });
    return updated!;
  }
}
```

### Import Conventions

Follow existing project patterns:
```typescript
// 1. External packages
import { PostgresStore } from '@mastra/pg';
import type { StorageResourceType } from '@mastra/core/storage';
import { eq } from 'drizzle-orm';

// 2. Internal modules (use .js extension for ESM)
import { db } from '../../../db/index.js';
import { users, userPreferences } from '../../../db/schema.js';
```

### Edge Cases to Handle

1. **New user (UUID not in DB):** Creates user + default preferences via transaction
2. **Empty workingMemory:** Uses defaults (celsius, null city/name)
3. **Partial updates:** Conditional set in onConflictDoUpdate preserves existing values
4. **User exists, preferences don't:** FK constraint + transaction ensures atomicity

### Testing Standards

- Unit tests for JSON <-> normalized mapping
- Integration test: save resource → verify in DB → retrieve and verify
- Test partial updates (update only city, verify units preserved)
- Tests go in `tests/mastra/lib/storage/supabaseStore.test.ts`

### Project Structure Notes

- `src/mastra/lib/storage/` is a NEW directory
- Follows the pattern of `src/mastra/lib/` for shared utilities
- Export barrel will be added in Story 6.4

### References

- [Architecture: Database Migration Section](../_bmad-output/architecture.md#database-migration-libsql-to-supabase-phase-2)
- [Implementation Plan](~/.claude/plans/buzzing-discovering-meteor.md)
- [PostgresStore Type Definitions](node_modules/@mastra/pg/dist/storage/index.d.ts)
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions)
- [Drizzle Upsert](https://orm.drizzle.team/docs/insert#on-conflict-do-update)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- User noted that resourceId should use UUID instead of string - implemented `resourceIdToUuid()` helper using uuid v5 for deterministic mapping
- Return UUID from database in `getResourceById` instead of original resourceId string

### Completion Notes List

- Created `src/mastra/lib/storage/supabaseStore.ts` extending `PostgresStore`
- Implemented `resourceIdToUuid()` helper using uuid v5 to convert string resourceIds (like "cli-user") to deterministic UUIDs
- Implemented `getResourceById()`: LEFT JOIN users + user_preferences, returns null if not found, reconstructs workingMemory JSON
- Implemented `saveResource()`: Uses Drizzle transaction, INSERT with onConflictDoNothing for both tables
- Implemented `updateResource()`: Uses Drizzle transaction, UPSERT with onConflictDoUpdate, conditional sets preserve existing values
- Working memory mapping: default_city→location, user_name→username, preferred_units→units
- Returns database UUID as resource ID (not original string resourceId)
- Created comprehensive unit tests in `tests/mastra/lib/storage/supabaseStore.test.ts`
- 10 new tests passing (242 total passing, 38 pre-existing TDD placeholders failing)
- TypeScript compilation passes

### File List

- `src/mastra/lib/storage/supabaseStore.ts` (NEW) - SupabaseStore class with resource methods
- `tests/mastra/lib/storage/supabaseStore.test.ts` (NEW) - Unit tests for UUID conversion and JSON mapping

### Change Log

- 2026-01-02: Implemented Story 6.3 - SupabaseStore class with hybrid storage pattern
