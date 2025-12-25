---
project_name: 'mastra-weather-agent'
user_name: 'Oleksii'
date: '2025-12-25'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
existing_patterns_found: 14
status: 'complete'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| TypeScript | ^5.9.3 | Strict mode enabled, ES2022 target |
| Node.js | ≥22.13.0 | ESM modules required |
| @mastra/core | ^0.24.9 | Agent, Tool primitives |
| @mastra/memory | ^0.15.13 | Working memory + conversation history |
| @mastra/libsql | ^0.16.4 | File-based persistence: `file:mastra.db` |
| Zod | ^4.2.1 | Schema validation for all tool I/O |
| Google Gemini | 2.5 Flash | Via `google/gemini-2.5-flash` model ID |
| OpenWeatherMap | v2.5 | Current weather endpoint only |

**Version Constraints:**
- Node.js 22+ required for native ESM and readline/promises
- Zod 4.x uses new API (`z.object()` not `z.schema()`)
- Mastra packages must stay in sync (all 0.x versions)

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

**Import/Export Patterns:**
- Use ESM syntax exclusively (`import`/`export`, never `require()`)
- All imports must include `.js` extension for local files (ESM requirement)
- Barrel exports in `index.ts` files for clean imports

**Type Safety Rules:**
- Strict mode enabled - no implicit `any`, null checks required
- Use Zod schemas as source of truth, infer types with `z.infer<typeof schema>`
- Prefer `unknown` over `any` for external data, then validate with Zod

**Async Patterns:**
- Use `async/await` exclusively (no raw Promise chains)
- Always handle errors with try/catch, never swallow errors silently
- Use `for await...of` for async iterables (streaming)

**Error Handling:**
- Return error codes in tool outputs, never throw from tools
- Use typed error code constants from `lib/errorCodes.ts`
- CLI layer maps error codes to user-friendly messages

### Framework-Specific Rules (Mastra)

**Agent Configuration:**
- Define agents in `src/mastra/agents/` with `.ts` extension
- Use `createTool()` from `@mastra/core` for all tools
- Agent `maxSteps: 5` prevents infinite loops (sufficient for weather queries)
- Model ID format: `google/gemini-2.5-flash` (provider/model)

**Tool Definition Rules:**
- Input/output schemas must be Zod objects (not primitives)
- Tool `execute` function receives `{ context }` with `resourceId` and `threadId`
- Always return success/error union: `{ success: true, data }` or `{ success: false, errorCode }`
- Never throw exceptions from tool execute functions

**Working Memory Pattern:**
- Schema defined with Zod: `default_city`, `preferred_units`, `user_name`
- Access via `context.resourceId` (fixed string for persistence across sessions)
- Thread ID (UUID) is per-session for conversation history
- Working memory persists; conversation history is session-scoped

**Streaming Pattern:**
- Use `agent.stream()` not `agent.generate()` for CLI
- Access token stream via `result.textStream`
- Write chunks directly: `process.stdout.write(chunk)`
- Add newline after stream completes

### Testing Rules

**Test Organization:**
- Tests in top-level `tests/` folder mirroring `src/` structure
- Test files: `*.test.ts` (e.g., `weatherApi.test.ts`)
- Integration tests in `tests/integration/` (if needed)

**Test Structure:**
- Use vitest: `describe`, `it`, `expect`
- One test file per source file
- Group tests by function/behavior in `describe` blocks

**Mocking Rules:**
- Mock external APIs (OpenWeatherMap) in all unit tests
- Use `vi.mock()` for module mocking
- Never make real API calls in unit tests
- Integration tests may use real APIs with test keys

**Coverage Expectations:**
- Focus on tool execute functions and API client
- Test error code paths explicitly
- Working memory operations should be tested

### Code Quality & Style Rules

**Naming Conventions:**
- Files: camelCase (e.g., `weatherAgent.ts`, `getCurrentWeather.ts`)
- React components (Phase 2): PascalCase (e.g., `WeatherCard.tsx`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE for error codes only
- Types/interfaces: PascalCase

**File Organization:**
- One export per file for tools and agents
- Barrel exports (`index.ts`) for public APIs
- Keep files under 200 lines; split if larger

**Import Order:**
1. Node.js built-ins (`node:readline`)
2. External packages (`@mastra/core`, `zod`)
3. Internal absolute imports
4. Relative imports

**Code Style:**
- No trailing semicolons (match existing Mastra patterns)
- Single quotes for strings
- 2-space indentation
- No unused variables or imports

### Development Workflow Rules

**npm Scripts:**
- `npm run dev` - Start Mastra Studio (localhost:4111)
- `npm run cli` - Run CLI application directly
- `npm test` - Run vitest test suite
- `npm run build` - Build for production

**Environment Variables:**
- `GOOGLE_GENERATIVE_AI_API_KEY` - Required for Gemini
- `OPENWEATHERMAP_API_KEY` - Required for weather data
- Store in `.env` file (never commit to git)
- `.env.example` documents required variables

**Git Workflow:**
- Feature branches from `main`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- PR required for merging to main

**Development Process:**
- Run `mastra dev` to test agent in Studio
- Use CLI for end-to-end testing
- Verify streaming works before committing

### Critical Don't-Miss Rules

**Anti-Patterns to Avoid:**
- NEVER use `require()` - ESM only project
- NEVER throw from tool execute functions - return error codes
- NEVER hardcode API keys - use environment variables
- NEVER use `agent.generate()` for CLI - use `agent.stream()`
- NEVER forget `.js` extension on local imports

**Edge Cases to Handle:**
- City name with spaces (e.g., "New York") - URL encode in API calls
- Empty API response - return `CITY_NOT_FOUND` error code
- Rate limit (429) - return `RATE_LIMITED` error code
- Network timeout - return `API_UNAVAILABLE` error code

**Security Rules:**
- API keys in `.env` only, never in code
- `.env` must be in `.gitignore`
- Never log full API responses (may contain sensitive data)

**Performance Gotchas:**
- Don't await the full stream before outputting - stream token by token
- Don't create new Mastra instance per request - reuse singleton
- Working memory reads are async - always await

