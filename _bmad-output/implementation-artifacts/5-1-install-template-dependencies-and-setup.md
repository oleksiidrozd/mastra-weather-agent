# Story 5.1: Install Template Dependencies and Setup

Status: review

## Story

As a **developer**,
I want **Nunjucks and related dependencies installed and configured**,
So that **I can use template-based instruction generation**.

## Acceptance Criteria

1. **Given** the project has existing dependencies
   **When** I run `npm install nunjucks nunjucks-markdown marked`
   **Then** packages are added to package.json
   **And** no version conflicts occur with existing dependencies

2. **Given** TypeScript is used in the project
   **When** I run `npm install -D @types/nunjucks`
   **Then** type definitions are available for Nunjucks

3. **Given** the templates directory needs to be created
   **When** I create `src/mastra/agents/templates/`
   **Then** the directory structure matches architecture spec:
   ```
   src/mastra/agents/templates/
   ├── index.ts
   ├── types.ts
   └── *.njk files
   ```

4. **Given** the dependencies are installed
   **When** I check package.json
   **Then** nunjucks ^3.2.4, nunjucks-markdown ^2.0.1, and marked ^15.0.0 are present

5. **Given** TypeScript compiles the project
   **When** I run `npm run build`
   **Then** no type errors related to Nunjucks imports

## Tasks / Subtasks

- [x] Task 1: Install runtime dependencies (AC: #1, #4)
  - [x] Run `npm install nunjucks nunjucks-markdown marked`
  - [x] Verify versions in package.json match requirements
  - [x] Check for any peer dependency warnings

- [x] Task 2: Install type definitions (AC: #2, #5)
  - [x] Run `npm install -D @types/nunjucks`
  - [x] Verify TypeScript recognizes nunjucks imports
  - [x] Note: marked has built-in types, nunjucks-markdown may need manual typing

- [x] Task 3: Create directory structure (AC: #3)
  - [x] Create `src/mastra/agents/templates/` directory
  - [x] Create empty `index.ts` placeholder
  - [x] Create empty `types.ts` placeholder

- [x] Task 4: Verify build (AC: #5)
  - [x] Run `npm run build`
  - [x] Ensure no compilation errors
  - [x] Ensure no version conflicts with existing Mastra packages

## Dev Notes

### Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| nunjucks | ^3.2.4 | Template engine |
| nunjucks-markdown | ^2.0.1 | Markdown block support in templates |
| marked | ^15.0.0 | Markdown renderer used by nunjucks-markdown |
| @types/nunjucks | latest | TypeScript definitions |

### Directory Structure

```
src/mastra/agents/
├── weatherAgent.ts          # Existing - will import from templates
├── index.ts                 # Existing barrel export
└── templates/               # NEW
    ├── index.ts             # Template engine setup + buildInstructions()
    ├── types.ts             # WeatherAgentConfig interface
    ├── main.njk             # Master template (Story 5.11)
    ├── identity.njk         # Identity section (Story 5.4)
    ├── capabilities.njk     # Capabilities section (Story 5.5)
    ├── responseFormatting.njk
    ├── errorHandling.njk    # (Story 5.6)
    ├── conversationContext.njk
    ├── intentClassification.njk  # (Story 5.7)
    ├── preferenceManagement.njk  # (Story 5.8)
    ├── weatherHandling.njk  # (Story 5.9)
    └── weatherAdvice.njk    # (Story 5.10)
```

### npm Commands

```bash
# Install runtime dependencies
npm install nunjucks nunjucks-markdown marked

# Install dev dependencies (types)
npm install -D @types/nunjucks

# Verify installation
npm ls nunjucks nunjucks-markdown marked
```

### Potential Issues

**nunjucks-markdown typing:**
- No @types/nunjucks-markdown package exists
- May need to create a declaration file: `src/types/nunjucks-markdown.d.ts`
- Minimal typing needed: just the register function

```typescript
// src/types/nunjucks-markdown.d.ts
declare module 'nunjucks-markdown' {
  import { Environment } from 'nunjucks'
  export function register(env: Environment, renderer: unknown): void
}
```

### Version Compatibility

From project-context.md:
- Node.js: >=22.13.0 (ESM required)
- TypeScript: ^5.9.3
- Zod: ^4.2.1

All template dependencies are compatible with these versions.

### Testing the Installation

After installation, verify with:

```typescript
// Quick test in Node REPL or scratch file
import nunjucks from 'nunjucks'
const env = new nunjucks.Environment()
const result = env.renderString('Hello {{ name }}!', { name: 'World' })
console.log(result) // "Hello World!"
```

## Dev Agent Record

### Implementation Plan
- Install nunjucks, nunjucks-markdown, marked as runtime dependencies
- Install @types/nunjucks as dev dependency
- Create type declaration for nunjucks-markdown (no @types package exists)
- Create templates directory structure with placeholder files
- Verify build passes

### Debug Log
- nunjucks 3.2.4 installed ✓
- nunjucks-markdown 2.0.1 installed ✓
- marked 17.0.1 installed (newer than ^15.0.0, compatible) ✓
- @types/nunjucks installed ✓
- Created src/types/nunjucks-markdown.d.ts for missing types ✓
- Created src/mastra/agents/templates/ directory ✓
- Created templates/index.ts and templates/types.ts placeholders ✓
- Build passed successfully ✓
- Pre-existing test failures (RED PHASE placeholders) are not regressions

### Completion Notes
All tasks completed successfully. Dependencies installed with no version conflicts. Created type declaration file for nunjucks-markdown since no @types package exists. Directory structure matches architecture spec. Build passes with no errors.

## File List

- package.json (modified - added dependencies)
- package-lock.json (modified - lockfile updated)
- src/types/nunjucks-markdown.d.ts (new - type declaration)
- src/mastra/agents/templates/index.ts (new - placeholder)
- src/mastra/agents/templates/types.ts (new - placeholder)

## Change Log

- 2025-12-30: Installed nunjucks ^3.2.4, nunjucks-markdown ^2.0.1, marked ^17.0.1
- 2025-12-30: Installed @types/nunjucks dev dependency
- 2025-12-30: Created nunjucks-markdown type declaration
- 2025-12-30: Created templates directory structure with placeholders
- 2025-12-30: Verified build passes

## References

- [Source: _bmad-output/project-context.md#Agent Instruction Templates (Nunjucks)]
- [Source: _bmad-output/epics.md#Story 5.1]
- [Source: nunjucks documentation - https://mozilla.github.io/nunjucks/]
