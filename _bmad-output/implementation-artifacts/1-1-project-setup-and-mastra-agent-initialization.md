# Story 1.1: Project Setup and Mastra Agent Initialization

Status: review

## Story

As a **developer**,
I want **a configured Mastra instance with persistent LibSQL storage and working memory schema**,
So that **I have the foundation for memory-enabled agent operations**.

## Acceptance Criteria

1. **Given** the project has Mastra dependencies installed
   **When** I run the application
   **Then** Mastra creates/connects to `mastra.db` file
   **And** working memory schema is defined with Zod (`{ default_city?, preferred_units, user_name? }`)
   **And** no errors occur on initialization

2. **Given** the Mastra instance is configured
   **When** I import it from `src/mastra/index.ts`
   **Then** the instance has memory and storage configured correctly
   **And** I can access the working memory schema for validation

3. **Given** `.env` file contains `GOOGLE_GENERATIVE_AI_API_KEY` and `OPENWEATHERMAP_API_KEY`
   **When** the application starts
   **Then** API keys are loaded from environment variables (NFR5)
   **And** API keys are never logged or displayed (NFR6)

4. **Given** `.env` file is missing required keys
   **When** the application starts
   **Then** a clear error message indicates which keys are missing
   **And** the application does not crash

5. **Given** the project has a `.gitignore` file
   **When** I check its contents
   **Then** `.env` and `mastra.db` are excluded (NFR7)

## Tasks / Subtasks

- [x] Task 1: Create `.env.example` with required environment variables (AC: #3)
  - [x] Add `GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here`
  - [x] Add `OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here`

- [x] Task 2: Update `.gitignore` to exclude sensitive files (AC: #5)
  - [x] Add `.env` if not present (already present)
  - [x] Add `mastra.db` if not present (already present via `*.db` pattern)

- [x] Task 3: Create working memory schema file (AC: #1, #2)
  - [x] Create `src/mastra/lib/types.ts` with Zod schema:
    ```typescript
    z.object({
      default_city: z.string().optional(),
      preferred_units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
      user_name: z.string().optional()
    })
    ```

- [x] Task 4: Create error codes file (AC: #4)
  - [x] Create `src/mastra/lib/errorCodes.ts` with:
    ```typescript
    export const ErrorCodes = {
      CITY_NOT_FOUND: "CITY_NOT_FOUND",
      API_KEY_INVALID: "API_KEY_INVALID",
      API_UNAVAILABLE: "API_UNAVAILABLE",
      RATE_LIMITED: "RATE_LIMITED",
    } as const;
    ```

- [x] Task 5: Configure Mastra instance in `src/mastra/index.ts` (AC: #1, #2)
  - [x] Import and configure LibSQL storage adapter with `file:mastra.db`
  - [x] Configure memory with working memory schema
  - [x] Export configured Mastra instance
  - [x] Include environment variable validation on initialization (deferred to tool usage per Dev Notes)

- [x] Task 6: Verify configuration works (AC: #1, #2)
  - [x] Run `npm run dev` to confirm Mastra Studio starts
  - [x] Verify `mastra.db` file is created in project root (created on first memory operation)

## Dev Notes

### Critical Architecture Requirements

**Storage Configuration:**
- Use `@mastra/libsql` with connection string: `file:mastra.db`
- Database file location: project root (next to package.json)
- This enables persistence across CLI restarts (NFR13)

**Working Memory Schema (EXACT):**
```typescript
import { z } from "zod";

export const workingMemorySchema = z.object({
  default_city: z.string().optional(),
  preferred_units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  user_name: z.string().optional()
});

export type WorkingMemory = z.infer<typeof workingMemorySchema>;
```

**Memory Configuration:**
- Thread-scoped conversation history: last 20 messages
- Resource ID: Fixed string `"cli-user"` for working memory persistence
- Thread ID: UUID, regenerated per session (handled in CLI layer, not here)

### File Structure Requirements

Create these files:
```
src/mastra/
├── index.ts              # Mastra instance export (MODIFY existing)
└── lib/
    ├── types.ts          # Working memory schema + shared types (CREATE)
    └── errorCodes.ts     # Error code constants (CREATE)
```

### Implementation Pattern (src/mastra/index.ts)

```typescript
import { Mastra } from "@mastra/core";
import { LibSQLStorage } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { workingMemorySchema } from "./lib/types.js";

// LibSQL storage for persistence
const storage = new LibSQLStorage({
  url: "file:mastra.db",
});

// Memory with working memory schema
const memory = new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      template: workingMemorySchema,
    },
  },
});

export const mastra = new Mastra({
  memory,
  // agents will be added in Story 1.2
});
```

### Environment Variable Validation

Do NOT throw on missing env vars at module load time. The validation should happen when tools/agents actually need the keys. This prevents blocking Mastra Studio startup.

For now, just ensure the pattern for later validation:
```typescript
// src/mastra/lib/env.ts (optional helper for later)
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

### Dependencies Already Installed

From package.json (DO NOT add new dependencies):
- `@mastra/core` ^0.24.9
- `@mastra/memory` ^0.15.13
- `@mastra/libsql` ^0.16.4
- `zod` ^4.2.1

### Import Rules (ESM)

- All local imports MUST include `.js` extension: `import { x } from "./lib/types.js"`
- Use ESM syntax only: `import`/`export`, never `require()`
- Node.js built-ins use `node:` prefix: `import readline from "node:readline"`

### Testing Notes

- Tests will be added in a separate testing story
- For now, verify by running `npm run dev` and checking Mastra Studio loads
- Verify `mastra.db` file is created after first run

### Project Structure Notes

- This story establishes the foundation that ALL other stories depend on
- The `src/mastra/index.ts` file is the central Mastra configuration
- Tools and agents will import from this file in subsequent stories
- Keep the lib folder flat for now (types.ts, errorCodes.ts)

### References

- [Source: _bmad-output/architecture.md#Data Architecture]
- [Source: _bmad-output/architecture.md#Project Structure (Final)]
- [Source: _bmad-output/prd.md#Non-Functional Requirements - NFR5, NFR6, NFR7, NFR13]
- [Source: _bmad-output/project-context.md#Framework-Specific Rules (Mastra)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Updated `.env.example` with both `GOOGLE_GENERATIVE_AI_API_KEY` and `OPENWEATHERMAP_API_KEY`
- `.gitignore` already had correct patterns (`.env` and `*.db`)
- Created `src/mastra/lib/types.ts` with Zod working memory schema
- Created `src/mastra/lib/errorCodes.ts` with typed error constants
- Configured `src/mastra/index.ts` with:
  - `LibSQLStore` from `@mastra/libsql` (corrected from docs - not `LibSQLStorage`)
  - `Mastra` from `@mastra/core/mastra` (corrected import path)
  - `createAgentMemory()` factory for agents to use with working memory schema
  - Storage uses `schema` property (not `template`) for Zod schemas
- Verified Mastra Studio starts successfully on http://localhost:4111
- Note: `mastra.db` file created on first memory operation (when agents use memory)

### File List

- [x] `.env.example` - Modified (added OpenWeatherMap key)
- [x] `.gitignore` - Verified (no changes needed)
- [x] `src/mastra/lib/types.ts` - Created
- [x] `src/mastra/lib/errorCodes.ts` - Created
- [x] `src/mastra/index.ts` - Modified

### Change Log

- 2025-12-26: Story 1.1 implemented - Mastra foundation with LibSQL storage and working memory schema
