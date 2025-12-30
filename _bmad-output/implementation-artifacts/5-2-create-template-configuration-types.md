# Story 5.2: Create Template Configuration Types

Status: review

## Story

As a **developer**,
I want **TypeScript interfaces for template configuration**,
So that **template variables are type-safe and documented**.

## Acceptance Criteria

1. **Given** the templates system needs configuration
   **When** I create `src/mastra/agents/templates/types.ts`
   **Then** it exports `WeatherAgentConfig` interface with:
   - `agentName: string` (default: "Sunny")
   - `agentRole: string` (default: "weather information specialist")
   - `personality: string` (default: "Cheerful, conversational, weather-obsessed")
   - `defaultUnit: 'celsius' | 'fahrenheit'` (default: "celsius")
   - `greetings?: string[]` (optional custom greetings)
   - `ambiguousCities?: string[]` (optional city list)

2. **Given** the types.ts file exists
   **When** I import `defaultConfig`
   **Then** it provides all default values matching the interface

3. **Given** a partial config is provided
   **When** I merge it with defaultConfig
   **Then** missing fields use defaults and provided fields override

4. **Given** TypeScript strict mode is enabled
   **When** I use WeatherAgentConfig
   **Then** no type errors occur and all properties are properly typed

5. **Given** the config allows extension
   **When** I add optional properties like greetings[]
   **Then** templates can conditionally render based on their presence

## Tasks / Subtasks

- [x] Task 1: Create WeatherAgentConfig interface (AC: #1, #4)
  - [x] Define required properties with their types
  - [x] Define optional properties with `?` modifier
  - [x] Add JSDoc comments for each property

- [x] Task 2: Create defaultConfig object (AC: #2, #3)
  - [x] Export const defaultConfig with all default values
  - [x] Ensure it satisfies WeatherAgentConfig type
  - [x] Values match current hardcoded agent values

- [x] Task 3: Add helper type utilities (AC: #3)
  - [x] Export type for partial config: `Partial<WeatherAgentConfig>`
  - [x] Added mergeConfig helper function for convenience

- [x] Task 4: Verify type safety (AC: #4, #5)
  - [x] Run `npm run build` to check for type errors
  - [x] Test that partial configs merge correctly with spread operator

## Dev Notes

### Interface Definition

```typescript
// src/mastra/agents/templates/types.ts

/**
 * Configuration for the Weather Agent's instruction templates.
 * All properties have sensible defaults - override only what you need.
 */
export interface WeatherAgentConfig {
  /** Display name for the agent (default: "Sunny") */
  agentName: string

  /** Role description used in persona (default: "weather information specialist") */
  agentRole: string

  /** Personality traits for conversation style (default: "Cheerful, conversational, weather-obsessed") */
  personality: string

  /** Default temperature unit for ranges in advice (default: "celsius") */
  defaultUnit: 'celsius' | 'fahrenheit'

  /** Optional custom greeting messages. If provided, replaces default greetings */
  greetings?: string[]

  /** Optional list of cities that need disambiguation (e.g., "Springfield") */
  ambiguousCities?: string[]
}

/**
 * Default configuration values for the Weather Agent.
 * Matches the current hardcoded values in weatherAgent.ts instructions.
 */
export const defaultConfig: WeatherAgentConfig = {
  agentName: 'Sunny',
  agentRole: 'weather information specialist',
  personality: 'Cheerful, conversational, weather-obsessed',
  defaultUnit: 'celsius',
  // greetings and ambiguousCities intentionally omitted - use defaults in templates
}
```

### Usage Pattern

```typescript
import { WeatherAgentConfig, defaultConfig } from './types.js'

// Use all defaults
const config1 = { ...defaultConfig }

// Override specific values
const config2: WeatherAgentConfig = {
  ...defaultConfig,
  agentName: 'Stormy',
  defaultUnit: 'fahrenheit',
}

// Partial config merged in buildInstructions
function buildInstructions(partial?: Partial<WeatherAgentConfig>): string {
  const config = { ...defaultConfig, ...partial }
  // render templates with config
}
```

### Why These Specific Fields?

| Field | Why Configurable |
|-------|------------------|
| agentName | Persona customization for Phase 2 multi-persona |
| agentRole | Different specializations possible |
| personality | Tone adjustment (formal/casual) |
| defaultUnit | Regional preference (US vs rest of world) |
| greetings | Custom greeting messages |
| ambiguousCities | Expand disambiguation list |

### File Location

```
src/mastra/agents/templates/
├── types.ts    ← THIS STORY
├── index.ts    ← Story 5.3
└── *.njk       ← Stories 5.4-5.11
```

### Type Safety Considerations

**Strict mode enabled** (from project-context.md):
- No implicit any
- Null checks required
- Use `'celsius' | 'fahrenheit'` union instead of `string`

**Optional fields pattern:**
```typescript
// In templates, check for optional fields:
{% if greetings %}
  {% for greeting in greetings %}
    - "{{ greeting }}"
  {% endfor %}
{% else %}
  - Default greeting here
{% endif %}
```

### Testing Types

```typescript
// Type tests (compile-time only)
import { WeatherAgentConfig, defaultConfig } from './types.js'

// Should compile:
const valid: WeatherAgentConfig = defaultConfig
const partial: Partial<WeatherAgentConfig> = { agentName: 'Test' }
const merged: WeatherAgentConfig = { ...defaultConfig, ...partial }

// Should NOT compile:
// const invalid: WeatherAgentConfig = { agentName: 'Test' } // Missing required fields
// const wrongUnit: WeatherAgentConfig = { ...defaultConfig, defaultUnit: 'kelvin' } // Invalid unit
```

## Dev Agent Record

### Implementation Plan
- Create WeatherAgentConfig interface with all required and optional properties
- Add JSDoc comments for IDE autocomplete and documentation
- Export defaultConfig constant with sensible defaults
- Add PartialWeatherAgentConfig type alias and mergeConfig helper
- Create unit tests for all acceptance criteria

### Debug Log
- Created WeatherAgentConfig interface with 4 required + 2 optional properties ✓
- JSDoc comments added for all properties ✓
- defaultConfig matches story spec exactly ✓
- PartialWeatherAgentConfig type exported ✓
- mergeConfig helper function added for convenience ✓
- Build passes with no type errors ✓
- 11 unit tests pass covering all ACs ✓

### Completion Notes
All tasks completed. WeatherAgentConfig interface is fully typed with union type for defaultUnit ('celsius' | 'fahrenheit'). Added mergeConfig helper function beyond the required Partial type export for better DX. Unit tests verify all acceptance criteria.

## File List

- src/mastra/agents/templates/types.ts (modified - full implementation)
- tests/mastra/agents/templates/types.test.ts (new - 11 unit tests)

## Change Log

- 2025-12-30: Created WeatherAgentConfig interface with JSDoc
- 2025-12-30: Created defaultConfig with all default values
- 2025-12-30: Added PartialWeatherAgentConfig type and mergeConfig helper
- 2025-12-30: Added unit tests for types (11 tests, all pass)

## References

- [Source: _bmad-output/epics.md#Story 5.2]
- [Source: _bmad-output/project-context.md#Type Safety Rules]
- [Source: TypeScript Handbook - Interfaces]
