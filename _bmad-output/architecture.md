---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2025-12-25'
inputDocuments:
  - '_bmad-output/prd.md'
  - 'docs/context/product_brief.md'
  - '_bmad-output/analysis/brainstorming-session-2025-12-25.md'
documentCounts:
  prd: 1
  briefs: 1
  brainstorming: 1
  ux: 0
  research: 0
  projectDocs: 0
  epics: 0
hasProjectContext: false
workflowType: 'architecture'
project_name: 'mastra-weather-agent'
user_name: 'Oleksii'
date: '2025-12-25'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (25 FRs):**
The PRD defines a CLI-first weather agent demonstrating 4 core Mastra concepts:

| Category | FR Count | Key Requirements |
|----------|----------|------------------|
| Core Agent | 4 | Natural language input, streaming output, intent classification, persona |
| Weather Information | 5 | City-specific queries, default city fallback, OpenWeatherMap integration |
| Temperature Conversion | 3 | Bidirectional C↔F conversion using conversation context |
| Preference Management | 5 | Default city, preferred units, cross-session persistence |
| Session Management | 3 | New session, exit, returning user greeting |
| Error Handling | 5 | Off-topic redirect, gibberish handling, clarification, API failures |

**Non-Functional Requirements (13 NFRs):**

| Category | Requirements | Architectural Impact |
|----------|--------------|---------------------|
| Performance | Response <2s, API <5s, Memory <100ms | Streaming required, async operations |
| Security | Env-only API keys, no logging secrets | `.env` configuration, gitignore |
| Integration | Rate limit handling, network retry | Error boundaries, graceful degradation |
| Reliability | No crash on bad input, graceful shutdown | Input validation, SIGINT handling |

**Scale & Complexity:**

- Primary domain: CLI Tool (Phase 1) → Web App (Phase 2)
- Complexity level: Low
- Estimated architectural components: 6 (Mastra instance, Agent, 4 Tools)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|------------|--------|--------|
| Mastra AI Framework | Product Brief | Architecture must follow Mastra patterns |
| Google Gemini 2.5 Flash | Brainstorming | Model configuration in agent |
| LibSQL Storage | PRD (NFR) | File-based storage, not in-memory |
| OpenWeatherMap API | PRD | External dependency, rate limits |
| maxSteps: 3 | Brainstorming | Classify → Tool → Respond flow |

### Cross-Cutting Concerns Identified

1. **Memory Persistence** - Working memory must survive CLI restarts; conversation history thread-scoped
2. **Error Handling** - API failures, invalid input, rate limits all need graceful responses
3. **Streaming** - Token-by-token output must work without blocking CLI responsiveness
4. **Shared Core Pattern** - Agent/tools must work identically for CLI and future React UI
5. **API Key Security** - Environment-only, never in code or logs

## Starter Template Evaluation

### Primary Technology Domain

**Mastra AI Framework CLI Application** - specialized domain with framework-provided project structure.

### Existing Project Foundation

Project already initialized with Mastra CLI (`npx create-mastra@latest`).

**Current State:**
- Mastra dependencies installed and configured
- Standard project structure in place
- TypeScript ES2022 with ESM modules
- Empty placeholder folders ready for implementation

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript 5.9.3 with strict mode
- Node.js ≥22.13.0 with ESM modules
- Target: ES2022

**Build Tooling:**
- Mastra CLI for dev/build/start commands
- TypeScript noEmit (Mastra handles bundling)

**Project Structure:**
```
src/mastra/
├── index.ts      # Mastra instance export
├── agents/       # Agent definitions
├── tools/        # Tool definitions
└── workflows/    # Workflow definitions (not needed)
```

**Dependencies Installed:**
- `@mastra/core` ^0.24.9 - Agent, Tool, Workflow primitives
- `@mastra/memory` ^0.15.13 - Memory management with working memory + conversation history
- `@mastra/libsql` ^0.16.4 - LibSQL storage adapter for persistence
- `zod` ^4.2.1 - Schema validation for tool inputs/outputs

### Additional Structure Required

For CLI interface (not provided by starter):

```
src/
├── mastra/           # Shared core (from starter)
│   ├── index.ts
│   ├── agents/
│   │   └── weatherAgent.ts
│   └── tools/
│       ├── getCurrentWeather.ts
│       ├── setDefaultCity.ts
│       ├── setPreferredUnits.ts
│       └── convertTemperature.ts
└── cli/              # CLI interface (to add)
    └── index.ts      # Readline loop entry point
```

**Note:** CLI entry point and npm script will be added during implementation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- External API integration pattern
- Memory configuration pattern
- Error handling strategy

**Important Decisions (Shape Architecture):**
- CLI streaming pattern
- Session/thread management

**Deferred Decisions (Post-MVP/Phase 2):**
- React state management
- React component architecture
- Deployment strategy

### Data Architecture

**Storage: LibSQL (File-based)**
- Decision: Use `file:mastra.db` for persistent storage
- Rationale: Survives CLI restarts per NFR13
- Version: @mastra/libsql ^0.16.4

**Working Memory Schema:**
- Decision: Zod-typed schema structure
- Schema:
  ```typescript
  z.object({
    default_city: z.string().optional(),
    preferred_units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    user_name: z.string().optional()
  })
  ```
- Rationale: Type safety, validation, structured access

**Conversation History:**
- Decision: Thread-scoped, last 20 messages
- Rationale: Enables contextual follow-ups ("What's that in Fahrenheit?")

### API & Communication Patterns

**External API Integration:**
- Decision: Shared API client module (`src/mastra/lib/weatherApi.ts`)
- Rationale: DRY, consistent error handling, centralized configuration
- Pattern:
  ```
  src/mastra/lib/
  └── weatherApi.ts    # OpenWeatherMap client with error handling
  ```

**Error Handling Strategy:**
- Decision: Error codes with agent-side mapping
- Error Codes:
  | Code | Meaning | User Message |
  |------|---------|--------------|
  | `CITY_NOT_FOUND` | 404 from API | "I couldn't find that city..." |
  | `API_KEY_INVALID` | 401 from API | "Configuration error..." |
  | `API_UNAVAILABLE` | 5xx/network | "Weather service unavailable..." |
  | `RATE_LIMITED` | 429 from API | "Too many requests..." |
- Rationale: Maximum control over user-facing messages, persona-consistent responses

### CLI Architecture

**Streaming Pattern:**
- Decision: Direct `process.stdout.write()` for each chunk
- Rationale: Shows token-by-token streaming clearly, demonstrates Mastra capability
- Pattern:
  ```typescript
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }
  ```

**Session/Thread Management:**
- Decision: Fixed thread ID per CLI session, regenerate on "new session"
- Thread ID: UUID generated on CLI start
- Resource ID: Fixed string (e.g., "cli-user") for working memory persistence
- New Session: Regenerate thread ID, working memory persists
- Rationale: Simple implementation, clear session boundaries

**CLI Entry Point:**
- Decision: Node.js readline in `src/cli/index.ts`
- Exit Commands: "exit", "quit", Ctrl+C
- New Session: "new session" or ask agent
- Rationale: Native Node.js, no additional dependencies

### Agent Configuration

**Model:**
- Decision: Google Gemini 2.5 Flash
- Configuration: `google/gemini-2.5-flash` via Mastra model router
- Environment: `GOOGLE_GENERATIVE_AI_API_KEY`

**maxSteps:**
- Decision: 3 steps
- Flow: Classify intent → Execute tool → Format response
- Rationale: Prevents infinite loops, sufficient for single-tool calls

**Tools:**
- `getCurrentWeather` - Fetch weather from OpenWeatherMap
- `setDefaultCity` - Update working memory default_city
- `setPreferredUnits` - Update working memory preferred_units
- `convertTemperature` - Pure calculation, no API call

### Project Structure (Final)

```
src/
├── mastra/
│   ├── index.ts              # Mastra instance with memory + storage
│   ├── agents/
│   │   └── weatherAgent.ts   # Agent with persona + tools
│   ├── tools/
│   │   ├── getCurrentWeather.ts
│   │   ├── setDefaultCity.ts
│   │   ├── setPreferredUnits.ts
│   │   └── convertTemperature.ts
│   └── lib/
│       └── weatherApi.ts     # Shared OpenWeatherMap client
└── cli/
    └── index.ts              # Readline loop entry point
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Mastra instance with LibSQL storage
2. Working memory schema
3. Weather API client
4. Tools (4)
5. Agent with persona
6. CLI entry point

**Cross-Component Dependencies:**
- All tools depend on Mastra instance for memory access
- `getCurrentWeather` depends on weatherApi client
- CLI depends on agent for streaming
- Agent depends on all tools

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 4 areas where AI agents could make different choices

### Naming Patterns

**File Naming Conventions:**

| Context | Convention | Example |
|---------|------------|---------|
| Mastra tools | camelCase | `getCurrentWeather.ts` |
| Mastra agents | camelCase | `weatherAgent.ts` |
| Mastra lib | camelCase | `weatherApi.ts` |
| React components (Phase 2) | PascalCase | `ChatMessage.tsx` |
| Test files | `*.test.ts` suffix | `getCurrentWeather.test.ts` |

**Variable & Function Naming:**

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `defaultCity`, `preferredUnits` |
| Functions | camelCase | `getCurrentWeather`, `formatTemperature` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `ERROR_CODES` |
| Types/Interfaces | PascalCase | `WeatherResponse`, `ToolOutput` |

### Structure Patterns

**Project Organization:**
```
src/
├── mastra/           # Shared Mastra core
│   ├── index.ts      # Mastra instance export
│   ├── agents/       # Agent definitions
│   ├── tools/        # Tool definitions
│   └── lib/          # Shared utilities (API clients, helpers)
└── cli/              # CLI interface
    └── index.ts

tests/                # Top-level tests folder
├── mastra/
│   ├── tools/        # Tool tests
│   └── lib/          # Utility tests
└── cli/              # CLI tests
```

**Test Location:**
- Tests in top-level `tests/` folder
- Mirror `src/` structure
- Suffix: `*.test.ts`

### Format Patterns

**Tool Output Schema:**

All tools MUST return a discriminated union:

```typescript
// Success case
{ success: true, data: { ...toolSpecificData } }

// Error case
{ success: false, errorCode: "CITY_NOT_FOUND" | "API_KEY_INVALID" | ... }
```

**Error Code Enum:**

```typescript
export const ErrorCodes = {
  CITY_NOT_FOUND: "CITY_NOT_FOUND",
  API_KEY_INVALID: "API_KEY_INVALID",
  API_UNAVAILABLE: "API_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
```

### Process Patterns

**Import Organization:**

```typescript
// 1. External packages
import { Agent } from "@mastra/core";
import { z } from "zod";

// 2. Internal modules (absolute from src)
import { weatherApi } from "../lib/weatherApi";

// 3. Types
import type { WeatherResponse } from "../types";
```

**Export Pattern:**

```typescript
// Named exports for tools and utilities
export const getCurrentWeather = createTool({...});

// Default export for agent
export default weatherAgent;
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow camelCase for files (except React components)
2. Use success/error union for all tool outputs
3. Place tests in `tests/` folder mirroring `src/`
4. Use defined error codes, never ad-hoc error strings
5. Follow import organization order

**Pattern Verification:**

- TypeScript strict mode catches type violations
- Consistent file naming visible in project structure
- Error codes defined as const enum prevents typos

### Pattern Examples

**Good Examples:**

```typescript
// ✅ Correct tool file: src/mastra/tools/getCurrentWeather.ts
export const getCurrentWeather = createTool({
  id: "getCurrentWeather",
  // ...
  execute: async ({ city }) => {
    const result = await weatherApi.fetchWeather(city);
    if (!result.success) {
      return { success: false, errorCode: result.errorCode };
    }
    return { success: true, data: result.data };
  }
});
```

**Anti-Patterns:**

```typescript
// ❌ Wrong: PascalCase file name for tool
// File: GetCurrentWeather.ts

// ❌ Wrong: Throwing instead of returning error
throw new Error("City not found");

// ❌ Wrong: Ad-hoc error message
return { success: false, error: "Could not find city" };

// ❌ Wrong: Test in src folder
// src/mastra/tools/getCurrentWeather.test.ts
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
mastra-weather-agent/
├── .env                          # API keys (GOOGLE_GENERATIVE_AI_API_KEY, OPENWEATHERMAP_API_KEY)
├── .env.example                  # Template for required environment variables
├── .gitignore                    # Excludes node_modules, .env, mastra.db
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration (ES2022, strict)
├── mastra.db                     # LibSQL database file (gitignored)
│
├── src/
│   ├── mastra/                   # SHARED MASTRA CORE
│   │   ├── index.ts              # Mastra instance with memory + storage config
│   │   │
│   │   ├── agents/
│   │   │   └── weatherAgent.ts   # Agent definition with persona + tools
│   │   │
│   │   ├── tools/
│   │   │   ├── index.ts          # Tool exports barrel
│   │   │   ├── getCurrentWeather.ts
│   │   │   ├── setDefaultCity.ts
│   │   │   ├── setPreferredUnits.ts
│   │   │   └── convertTemperature.ts
│   │   │
│   │   └── lib/
│   │       ├── weatherApi.ts     # OpenWeatherMap client
│   │       ├── errorCodes.ts     # Error code constants
│   │       └── types.ts          # Shared TypeScript types
│   │
│   └── cli/                      # CLI INTERFACE
│       └── index.ts              # Readline loop entry point
│
├── tests/                        # TEST SUITE
│   ├── mastra/
│   │   ├── tools/
│   │   │   ├── getCurrentWeather.test.ts
│   │   │   ├── setDefaultCity.test.ts
│   │   │   ├── setPreferredUnits.test.ts
│   │   │   └── convertTemperature.test.ts
│   │   └── lib/
│   │       └── weatherApi.test.ts
│   └── cli/
│       └── index.test.ts
│
└── docs/                         # DOCUMENTATION
    ├── context/
    │   └── product_brief.md
    └── mastra-ai/                # Framework reference docs
```

### Architectural Boundaries

**Mastra Core Boundary:**
- `src/mastra/` is the shared core used by both CLI and future React UI
- Agent and tools are interface-agnostic
- All memory access happens through Mastra instance

**CLI Interface Boundary:**
- `src/cli/` handles user I/O only
- Imports agent from `src/mastra/agents/weatherAgent.ts`
- Manages thread/resource IDs for memory scoping

**External API Boundary:**
- `src/mastra/lib/weatherApi.ts` is the only file that calls OpenWeatherMap
- All API errors translated to standardized error codes

### Requirements to Structure Mapping

**FR1-FR4 (Core Agent Capabilities):**
```
src/mastra/agents/weatherAgent.ts  → Agent with persona, streaming, intent handling
src/cli/index.ts                   → CLI readline loop for user I/O
```

**FR5-FR9 (Weather Information):**
```
src/mastra/tools/getCurrentWeather.ts  → Weather queries
src/mastra/lib/weatherApi.ts           → OpenWeatherMap integration
```

**FR10-FR12 (Temperature Conversion):**
```
src/mastra/tools/convertTemperature.ts → C↔F conversion
```

**FR13-FR17 (Preference Management):**
```
src/mastra/tools/setDefaultCity.ts      → Default city updates
src/mastra/tools/setPreferredUnits.ts   → Unit preference updates
src/mastra/index.ts                     → Working memory schema
```

**FR18-FR20 (Session Management):**
```
src/cli/index.ts → Session handling, exit commands, new session
```

**FR21-FR25 (Error Handling):**
```
src/mastra/lib/errorCodes.ts   → Error code constants
src/mastra/lib/weatherApi.ts   → API error handling
src/mastra/agents/weatherAgent.ts → Persona-consistent error messages
```

### Integration Points

**Internal Communication:**
```
CLI → imports → Agent → uses → Tools → calls → weatherApi
                  ↓
            Mastra Memory (LibSQL)
```

**External Integrations:**

| Service | Integration Point | File |
|---------|-------------------|------|
| OpenWeatherMap API | HTTP fetch | `src/mastra/lib/weatherApi.ts` |
| Google Gemini | Mastra model router | `src/mastra/agents/weatherAgent.ts` |
| LibSQL | Mastra storage adapter | `src/mastra/index.ts` |

**Data Flow:**
```
User Input (CLI)
    ↓
Agent.stream() with threadId + resourceId
    ↓
LLM classifies intent → selects tool
    ↓
Tool executes (API call or memory update)
    ↓
Tool returns { success, data } or { success, errorCode }
    ↓
Agent formats response with persona
    ↓
Stream chunks to CLI → stdout
```

### Development Workflow Integration

**npm Scripts:**
```json
{
  "dev": "mastra dev",
  "cli": "npx tsx src/cli/index.ts",
  "build": "mastra build",
  "test": "vitest"
}
```

**Development Server:**
- `mastra dev` starts the Mastra Studio at localhost:4111
- CLI runs directly with `npm run cli`

**Build Process:**
- Mastra CLI handles TypeScript compilation
- Output to `.mastra/` directory (managed by framework)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts:
- Mastra AI ^0.24.9 + Google Gemini 2.5 Flash: Native support via model router
- @mastra/libsql ^0.16.4 + file-based storage: Designed for this use case
- TypeScript 5.9.3 + ES2022 modules: Compatible with Mastra build process
- Zod ^4.2.1: Integrated with Mastra tool schemas

**Pattern Consistency:**
Implementation patterns align with architectural decisions:
- camelCase naming follows Mastra conventions
- Success/error union pattern works with tool execution flow
- Project structure mirrors Mastra starter template

**Structure Alignment:**
Project structure supports all architectural decisions:
- Shared core pattern enables CLI → React evolution
- Clear boundaries between Mastra core and interface layers
- Test structure mirrors source for maintainability

### Requirements Coverage Validation ✅

**Functional Requirements Coverage (25/25):**

| Category | FRs | Status |
|----------|-----|--------|
| Core Agent | FR1-FR4 | ✅ Covered by agent + CLI |
| Weather Information | FR5-FR9 | ✅ Covered by getCurrentWeather + weatherApi |
| Temperature Conversion | FR10-FR12 | ✅ Covered by convertTemperature |
| Preference Management | FR13-FR17 | ✅ Covered by tools + working memory |
| Session Management | FR18-FR20 | ✅ Covered by CLI thread management |
| Error Handling | FR21-FR25 | ✅ Covered by errorCodes + agent persona |

**Non-Functional Requirements Coverage (13/13):**

| Category | Status | Architectural Support |
|----------|--------|----------------------|
| Performance (NFR1-4) | ✅ | Streaming responses, async operations |
| Security (NFR5-7) | ✅ | Environment variables, gitignore |
| Integration (NFR8-10) | ✅ | Error codes for API failures, rate limits |
| Reliability (NFR11-13) | ✅ | SIGINT handling, LibSQL persistence |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with exact versions
- Error codes enumerated with HTTP status mappings
- maxSteps rationale explained

**Structure Completeness:**
- All 15+ source files defined with purposes
- Test structure specified with naming conventions
- npm scripts ready for development workflow

**Pattern Completeness:**
- Naming conventions cover all code contexts
- Import/export patterns with examples
- Good/anti-pattern examples provided

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (Addressed):**
- Testing framework: Added vitest to npm scripts
- Agent persona: Defined in PRD, implemented during development

**Deferred (Post-MVP):**
- ESLint/Prettier configuration
- Pre-commit hooks
- CI/CD pipeline
- React UI architecture

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (Mastra, Gemini, LibSQL, OpenWeatherMap)
- [x] Cross-cutting concerns mapped (5 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (shared API client)
- [x] Performance considerations addressed (streaming)

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified (tool output schema)
- [x] Process patterns documented (import organization)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION ✅

**Confidence Level:** High

**Key Strengths:**
- Clear separation between shared core and interface layers
- Comprehensive error handling strategy with defined codes
- Type-safe working memory with Zod schema
- Streaming-first design for responsive UX
- All 38 requirements (25 FR + 13 NFR) mapped to architecture

**Areas for Future Enhancement:**
- Add ESLint/Prettier for code quality (when needed)
- Define React UI patterns (Phase 2)
- Add CI/CD pipeline (production deployment)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
1. Configure Mastra instance with LibSQL storage (`src/mastra/index.ts`)
2. Define working memory schema
3. Implement weather API client (`src/mastra/lib/weatherApi.ts`)
4. Build 4 tools
5. Create agent with persona
6. Implement CLI entry point

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-25
**Document Location:** `_bmad-output/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 15+ architectural decisions made
- 5 implementation pattern categories defined
- 6 architectural components specified
- 38 requirements (25 FR + 13 NFR) fully supported

**AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

