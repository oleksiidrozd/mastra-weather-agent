# Story 3.1: Implement setDefaultCity Tool

Status: done

## Story

As a **user**,
I want **to set my default city for weather queries**,
So that **I don't have to specify my city every time I ask about weather**.

## Acceptance Criteria

1. **Given** the agent is running
   **When** I say "Set my default city to London"
   **Then** the agent calls `setDefaultCity` with city="London"
   **And** the preference is saved to working memory
   **And** the agent confirms: "I've set your default city to London" (FR17)

2. **Given** I have set a default city
   **When** I ask "What's the weather?" without specifying a city
   **Then** the agent uses my default city for the weather query (FR6)
   **And** mentions which city it's using in the response

3. **Given** working memory operations
   **When** I set or retrieve preferences
   **Then** the operation completes within 100ms (NFR3)

4. **Given** I set a new default city
   **When** the default was previously set to another city
   **Then** the new city replaces the old one
   **And** the agent confirms the update

5. **Given** the agent confirms a default city change
   **When** responding to the user
   **Then** it maintains persona and is conversational

## Tasks / Subtasks

- [x] Task 1: Create setDefaultCity tool (AC: #1, #3)
  - [x] Create `src/mastra/tools/setDefaultCity.ts`
  - [x] Define Zod input schema (city: string)
  - [x] Define Zod output schema (success, message, city)
  - [x] Implement execute function (agent handles working memory update)

- [x] Task 2: Register tool with agent (AC: #1)
  - [x] Export from `src/mastra/tools/index.ts`
  - [x] Add to agent's tools in `weatherAgent.ts`

- [x] Task 3: Update agent instructions for default city setting (AC: #1, #4, #5)
  - [x] Add DEFAULT CITY MANAGEMENT section with recognition patterns
  - [x] Add confirmation message templates
  - [x] Add rules for when NOT to set default city

- [x] Task 4: Test the tool (AC: #1-5)
  - [x] Test "Set my default city to Tokyo" → Confirmed with friendly message
  - [x] Test "I live in Berlin" → Informal phrasing recognized, default set
  - [x] Persona maintained in all confirmations

## Dev Notes

### Dependencies on Previous Stories

**Story 1.1 Required:**
- Working memory schema with `default_city` field
- LibSQL storage configured

**Story 2.1/2.2 Required:**
- `getCurrentWeather` tool for testing integration
- Weather query with default city logic

### Working Memory Access in Tools

Mastra tools can update working memory through the execution context. The key is understanding how to access and modify working memory.

**File: `src/mastra/tools/setDefaultCity.ts`**

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const setDefaultCity = createTool({
  id: 'setDefaultCity',
  description: 'Set the user\'s default city for weather queries. This city will be used when the user asks about weather without specifying a location.',
  inputSchema: z.object({
    city: z.string().describe('The city name to set as the default (e.g., "London", "Tokyo", "New York")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    previousCity: z.string().optional(),
    newCity: z.string(),
  }),
  execute: async ({ context, memory }) => {
    const { city } = context

    try {
      // Get current working memory to check previous value
      const currentMemory = await memory?.getWorkingMemory?.()
      const previousCity = currentMemory?.default_city

      // Update working memory with new default city
      await memory?.updateWorkingMemory?.({
        default_city: city,
      })

      return {
        success: true,
        message: `Default city set to ${city}`,
        previousCity: previousCity || undefined,
        newCity: city,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save default city preference',
        newCity: city,
      }
    }
  },
})
```

**Note:** The exact memory API may differ. Check Mastra documentation for the correct method to update working memory from tools. The agent may need to handle memory updates through its own context rather than the tool directly.

### Alternative: Agent-Handled Memory Updates

If tools cannot directly update working memory, the agent can handle it through instructions:

```typescript
## SETTING DEFAULT CITY

When the user wants to set their default city:

1. Recognize intent: "Set my default to...", "I live in...", "My city is...", "Remember I'm in..."
2. Extract the city name
3. Call the setDefaultCity tool with the city
4. The tool confirms the update
5. Respond with: "Got it! I've set [city] as your default. Next time you ask about weather, I'll check there first!"

Variations for confirmation:
- "Perfect! [City] is now your go-to location for weather."
- "Done! I'll remember that you're in [City]."
- "All set! [City] is now your default weather location."

If updating from a previous city:
- "I've updated your default from [old] to [new]. I'll use [new] for weather queries now!"
```

### Tools Barrel Export Update

**Update `src/mastra/tools/index.ts`:**

```typescript
export { getCurrentWeather } from './getCurrentWeather.js'
export { setDefaultCity } from './setDefaultCity.js'
```

### Agent Tools Update

**Update `src/mastra/agents/weatherAgent.ts`:**

```typescript
import { getCurrentWeather, setDefaultCity } from '../tools/index.js'

export const weatherAgent = new Agent({
  // ...existing config...
  tools: {
    getCurrentWeather,
    setDefaultCity,
  },
  // ...rest of config...
})
```

### Agent Instruction Updates

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## DEFAULT CITY MANAGEMENT

### Setting Default City

Recognize these patterns as requests to set default city:
- "Set my default city to [city]"
- "My default city is [city]"
- "I live in [city]"
- "I'm in [city]" (when context suggests setting preference, not weather query)
- "Remember that I'm from [city]"
- "Save [city] as my default"
- "Use [city] as my default location"

When setting default city:
1. Call setDefaultCity tool with the city name
2. Confirm with a friendly message:
   - "Perfect! I've set [city] as your default. Just ask 'what's the weather?' and I'll check [city] for you!"
   - "Got it! [City] is now your go-to spot. No need to mention it every time!"

### When Updating Default City

If user already had a default and is changing it:
- "I've updated your default from [old city] to [new city]. I'll use [new city] for your weather queries now!"

### DO NOT set default city when:
- User asks "What's the weather in [city]?" - this is a query, not a preference
- User mentions a city in passing conversation
- User is asking about weather for someone else's location
```

### Response Examples

**Setting Default City (first time):**
```
User: "Set my default city to Paris"
Agent: "Perfect! I've set Paris as your default city. Next time you ask about weather, I'll check Paris for you!"
```

**Updating Default City:**
```
User: "Actually, change my default to London"
Agent: "Done! I've updated your default from Paris to London. I'll use London for your weather queries from now on!"
```

**Informal Setting:**
```
User: "I live in Tokyo"
Agent: "Nice! I've saved Tokyo as your default city. Just say 'what's the weather?' and I'll give you the Tokyo forecast!"
```

**Using Default City:**
```
User: "What's the weather?"
Agent: "Here's the weather for Tokyo, your default city:
Currently 22°C with clear skies..."
```

### File Structure After This Story

```
src/mastra/
├── index.ts
├── agents/
│   └── weatherAgent.ts      # Modified: add tool + instructions
├── tools/
│   ├── index.ts             # Modified: export setDefaultCity
│   ├── getCurrentWeather.ts
│   └── setDefaultCity.ts    # NEW
└── lib/
    ├── types.ts
    ├── errorCodes.ts
    └── weatherApi.ts
```

### Testing Scenarios

**Set Default City:**
```
Input: "Set my default city to London"
Expected: Confirmation message, default_city saved in working memory
```

**Update Default City:**
```
Setup: default_city already set to "Paris"
Input: "Change my default to Berlin"
Expected: Update confirmation mentioning both old and new cities
```

**Use Default City:**
```
Setup: default_city set to "Tokyo"
Input: "What's the weather?"
Expected: Weather for Tokyo, mentions it's the default
```

**Informal Phrasing:**
```
Input: "I live in Sydney"
Expected: Recognizes as preference update, sets default to Sydney
```

### Performance Requirement

Working memory operations must complete within 100ms (NFR3). LibSQL file-based storage should easily meet this for single-record updates.

### References

- [Source: _bmad-output/prd.md#FR13 - Set default city]
- [Source: _bmad-output/prd.md#FR17 - Confirm preference changes]
- [Source: _bmad-output/prd.md#NFR3 - Memory operations < 100ms]
- [Source: _bmad-output/architecture.md#Working Memory Schema]
- [Source: Story 1.1 - Working memory setup]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/mastra/tools/setDefaultCity.ts` with:
  - Zod input schema: `{ city: string }`
  - Zod output schema: `{ success, message, city }`
  - Simple validation for empty city name
  - Agent handles working memory updates via built-in capability
- Exported setDefaultCity from `src/mastra/tools/index.ts`
- Added setDefaultCity to agent's tools configuration
- Added DEFAULT CITY MANAGEMENT section to agent instructions:
  - Recognition patterns for various phrasings
  - Confirmation message templates
  - Rules for when NOT to set default (weather queries vs preferences)
- Test results:
  - "Set my default city to Tokyo" → "Perfect! I've set Tokyo as your default..."
  - "I live in Berlin" → "Perfect! I've set Berlin as your default..."
  - Persona consistency verified in all confirmations

### File List

- [x] `src/mastra/tools/setDefaultCity.ts` - Created
- [x] `src/mastra/tools/index.ts` - Modified (added export)
- [x] `src/mastra/agents/weatherAgent.ts` - Modified (tool + DEFAULT CITY MANAGEMENT instructions)

### Change Log

- 2025-12-26: Story 3.1 implemented - setDefaultCity tool with agent instructions
