# Story 5.3: Create Template Engine Setup

Status: review

## Story

As a **developer**,
I want **a configured Nunjucks environment with Markdown support**,
So that **templates can be rendered with variable substitution**.

## Acceptance Criteria

1. **Given** Nunjucks dependencies are installed
   **When** I create `src/mastra/agents/templates/index.ts`
   **Then** it configures Nunjucks Environment with:
   - FileSystemLoader pointing to templates directory
   - `autoescape: false` (generating text, not HTML)
   - `trimBlocks: true` and `lstripBlocks: true`

2. **Given** markdown support is needed
   **When** the environment is configured
   **Then** nunjucks-markdown extension is registered with marked renderer

3. **Given** `buildInstructions()` is called with partial config
   **When** the function executes
   **Then** it merges with defaultConfig
   **And** renders `main.njk` with the merged configuration
   **And** returns the complete instructions string

4. **Given** `buildInstructions()` is called with no arguments
   **When** the function executes
   **Then** it uses all default values from defaultConfig

5. **Given** the templates directory uses ESM
   **When** I need to resolve the directory path
   **Then** I use `fileURLToPath(import.meta.url)` pattern

## Tasks / Subtasks

- [x] Task 1: Create Nunjucks environment (AC: #1, #5)
  - [x] Import nunjucks and configure Environment
  - [x] Set up FileSystemLoader with correct path resolution
  - [x] Configure autoescape, trimBlocks, lstripBlocks

- [x] Task 2: Register markdown extension (AC: #2)
  - [x] Import nunjucks-markdown and marked
  - [x] Register extension with environment
  - [x] Type declaration created in Story 5.1

- [x] Task 3: Implement buildInstructions function (AC: #3, #4)
  - [x] Import types from types.ts
  - [x] Merge partial config with defaults
  - [x] Render main.njk template
  - [x] Return rendered string

- [x] Task 4: Export public API (AC: #3, #4)
  - [x] Export buildInstructions function
  - [x] Re-export types for convenience
  - [x] Add JSDoc documentation

## Dev Notes

### Implementation

```typescript
// src/mastra/agents/templates/index.ts
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import nunjucks from 'nunjucks'
import markdown from 'nunjucks-markdown'
import { marked } from 'marked'
import type { WeatherAgentConfig } from './types.js'
import { defaultConfig } from './types.js'

// ESM path resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure Nunjucks environment
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(__dirname, {
    watch: false,
    noCache: process.env.NODE_ENV === 'development',
  }),
  {
    autoescape: false,    // We're generating text, not HTML
    trimBlocks: true,     // Remove first newline after block tags
    lstripBlocks: true,   // Strip leading whitespace from block tags
  }
)

// Register markdown extension
markdown.register(env, marked)

/**
 * Build the complete instructions string for the Weather Agent.
 *
 * @param config - Partial configuration to override defaults
 * @returns The rendered instructions string
 *
 * @example
 * // Use all defaults
 * const instructions = buildInstructions()
 *
 * @example
 * // Custom agent name
 * const instructions = buildInstructions({ agentName: 'Stormy' })
 */
export function buildInstructions(config?: Partial<WeatherAgentConfig>): string {
  const mergedConfig: WeatherAgentConfig = {
    ...defaultConfig,
    ...config,
  }

  return env.render('main.njk', mergedConfig)
}

// Re-export types for convenience
export type { WeatherAgentConfig } from './types.js'
export { defaultConfig } from './types.js'
```

### Type Declaration for nunjucks-markdown

If @types/nunjucks-markdown doesn't exist, create:

```typescript
// src/types/nunjucks-markdown.d.ts
declare module 'nunjucks-markdown' {
  import type { Environment } from 'nunjucks'

  interface MarkdownRenderer {
    parse(text: string): string
  }

  export function register(
    env: Environment,
    renderer: MarkdownRenderer | typeof import('marked')
  ): void
}
```

And update tsconfig.json if needed:
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

### Nunjucks Configuration Explained

| Option | Value | Why |
|--------|-------|-----|
| autoescape | false | We're generating agent instructions (text), not HTML |
| trimBlocks | true | Cleaner output - removes newline after `{% %}` tags |
| lstripBlocks | true | Allows indented template code without affecting output |
| watch | false | No file watching in production |
| noCache | dev only | Cache templates in production for performance |

### ESM Path Resolution Pattern

From project-context.md:
```typescript
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

This is required because `__dirname` is not available in ESM modules.

### Markdown Extension Usage

In templates, use:
```nunjucks
{% markdown %}
## Section Header

This is **bold** and *italic* text.

- Bullet point
- Another point
{% endmarkdown %}
```

Note: For agent instructions, we may not use markdown blocks heavily since instructions are plain text, but it's available if needed.

### Directory Structure After This Story

```
src/mastra/agents/templates/
├── index.ts    ← THIS STORY
├── types.ts    ← Story 5.2
└── main.njk    ← Story 5.11 (placeholder for now)
```

### Testing the Setup

```typescript
// Quick test
import { buildInstructions } from './templates/index.js'

// Should not throw, returns empty string until main.njk exists
const result = buildInstructions()
console.log(typeof result === 'string') // true

// With config
const custom = buildInstructions({ agentName: 'TestBot' })
console.log(custom.includes('TestBot')) // true (once templates exist)
```

### Error Handling

The function should throw clear errors if:
- main.njk template is missing
- Template syntax errors exist
- Required variables are missing

```typescript
// Nunjucks will throw TemplateNotFound or similar
// Let it propagate - developer error, not runtime error
```

## Dev Agent Record

### Implementation Plan
- Configure Nunjucks Environment with FileSystemLoader and ESM path resolution
- Register nunjucks-markdown extension with marked renderer
- Implement buildInstructions function that merges config and renders templates
- Export public API with re-exports and JSDoc documentation
- Create placeholder main.njk for testing

### Debug Log
- Nunjucks Environment configured with autoescape:false, trimBlocks:true, lstripBlocks:true ✓
- FileSystemLoader using ESM path resolution (__dirname via import.meta.url) ✓
- nunjucks-markdown registered with marked renderer ✓
- buildInstructions uses mergeConfig from types.ts ✓
- getEnvironment helper added for testing ✓
- Placeholder main.njk created for testing ✓
- Build passes ✓
- 13 unit tests pass ✓

### Completion Notes
All tasks completed. Template engine is fully configured with Nunjucks, markdown support, and ESM path resolution. Created placeholder main.njk to enable testing - this will be replaced with full implementation in Story 5.11. Added getEnvironment() helper for testing and advanced usage.

## File List

- src/mastra/agents/templates/index.ts (modified - full implementation)
- src/mastra/agents/templates/main.njk (new - placeholder template)
- tests/mastra/agents/templates/index.test.ts (new - 13 unit tests)

## Change Log

- 2025-12-30: Configured Nunjucks environment with FileSystemLoader
- 2025-12-30: Registered nunjucks-markdown extension
- 2025-12-30: Implemented buildInstructions function with config merging
- 2025-12-30: Added getEnvironment helper and re-exports
- 2025-12-30: Created placeholder main.njk template
- 2025-12-30: Added unit tests (13 tests, all pass)

## References

- [Source: _bmad-output/project-context.md#Nunjucks Configuration]
- [Source: _bmad-output/project-context.md#Template Import Pattern]
- [Source: _bmad-output/epics.md#Story 5.3]
- [Source: nunjucks API documentation]
