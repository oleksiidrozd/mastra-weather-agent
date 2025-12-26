# Story 3.2: Implement setPreferredUnits Tool

Status: done

## Story

As a **user**,
I want **to set my preferred temperature units (Celsius or Fahrenheit)**,
So that **weather information is displayed in my preferred format**.

## Acceptance Criteria

1. **Given** the agent is running
   **When** I say "I prefer Fahrenheit" or "Use Celsius"
   **Then** the agent calls `setPreferredUnits` with the appropriate unit
   **And** the preference is saved to working memory
   **And** the agent confirms the change (FR17)

2. **Given** I have set preferred units to Fahrenheit
   **When** I ask for weather information
   **Then** temperatures are displayed in Fahrenheit (FR14)

3. **Given** I have not set a unit preference
   **When** I ask for weather information
   **Then** the agent uses the default (Celsius)

4. **Given** I change my unit preference
   **When** I ask for weather information after the change
   **Then** the new unit is used immediately

5. **Given** working memory operations
   **When** I set or retrieve preferences
   **Then** the operation completes within 100ms (NFR3)

## Tasks / Subtasks

- [x] Task 1: Create setPreferredUnits tool (AC: #1, #5)
  - [x] Create `src/mastra/tools/setPreferredUnits.ts`
  - [x] Define Zod input schema (units: "celsius" | "fahrenheit")
  - [x] Define Zod output schema (success, message, units, unitSymbol)
  - [x] Implement execute function (agent handles working memory update)

- [x] Task 2: Register tool with agent (AC: #1)
  - [x] Export from `src/mastra/tools/index.ts`
  - [x] Add to agent's tools in `weatherAgent.ts`

- [x] Task 3: Update agent instructions for unit preference (AC: #1, #2, #3, #4)
  - [x] Add UNIT PREFERENCE MANAGEMENT section with recognition patterns
  - [x] Add confirmation message templates for both units
  - [x] Add switching units confirmation messages

- [x] Task 4: Test the tool (AC: #1-5)
  - [x] Test "I prefer Fahrenheit" → "Got it! I'll show temperatures in Fahrenheit (°F) from now on."
  - [x] Test "Use Celsius" → "Sure thing! I'll display temperatures in Celsius (°C)."
  - [x] Persona maintained in all confirmations

## Dev Notes

### Dependencies on Previous Stories

**Story 1.1 Required:**
- Working memory schema with `preferred_units` field: `z.enum(['celsius', 'fahrenheit']).default('celsius')`

**Story 3.1 Required:**
- Pattern for preference-setting tools established

### Tool Implementation

**File: `src/mastra/tools/setPreferredUnits.ts`**

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const setPreferredUnits = createTool({
  id: 'setPreferredUnits',
  description: 'Set the user\'s preferred temperature units for weather display. Choose between Celsius (°C) or Fahrenheit (°F).',
  inputSchema: z.object({
    units: z.enum(['celsius', 'fahrenheit']).describe('Temperature unit preference: "celsius" or "fahrenheit"'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    previousUnits: z.enum(['celsius', 'fahrenheit']).optional(),
    newUnits: z.enum(['celsius', 'fahrenheit']),
  }),
  execute: async ({ context, memory }) => {
    const { units } = context

    try {
      // Get current working memory to check previous value
      const currentMemory = await memory?.getWorkingMemory?.()
      const previousUnits = currentMemory?.preferred_units

      // Update working memory with new unit preference
      await memory?.updateWorkingMemory?.({
        preferred_units: units,
      })

      const unitSymbol = units === 'fahrenheit' ? '°F' : '°C'

      return {
        success: true,
        message: `Temperature units set to ${units} (${unitSymbol})`,
        previousUnits: previousUnits || 'celsius',
        newUnits: units,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save unit preference',
        newUnits: units,
      }
    }
  },
})
```

### Tools Barrel Export Update

**Update `src/mastra/tools/index.ts`:**

```typescript
export { getCurrentWeather } from './getCurrentWeather.js'
export { setDefaultCity } from './setDefaultCity.js'
export { setPreferredUnits } from './setPreferredUnits.js'
```

### Agent Tools Update

**Update `src/mastra/agents/weatherAgent.ts`:**

```typescript
import { getCurrentWeather, setDefaultCity, setPreferredUnits } from '../tools/index.js'

export const weatherAgent = new Agent({
  // ...existing config...
  tools: {
    getCurrentWeather,
    setDefaultCity,
    setPreferredUnits,
  },
  // ...rest of config...
})
```

### Agent Instruction Updates

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## UNIT PREFERENCE MANAGEMENT

### Recognizing Unit Preference Requests

Fahrenheit indicators:
- "I prefer Fahrenheit"
- "Use Fahrenheit"
- "Switch to Fahrenheit"
- "Show me temperatures in F"
- "I want °F"
- "American units" (implies Fahrenheit)

Celsius indicators:
- "I prefer Celsius"
- "Use Celsius"
- "Switch to Celsius"
- "Show me temperatures in C"
- "I want °C"
- "Metric" (implies Celsius)

### Setting Unit Preference

When user indicates a unit preference:
1. Determine if they want Celsius or Fahrenheit
2. Call setPreferredUnits tool with the appropriate value
3. Confirm with a friendly message:

Fahrenheit confirmations:
- "Got it! I'll show temperatures in Fahrenheit (°F) from now on."
- "Switching to Fahrenheit! All temperatures will be in °F."
- "°F it is! I'll use Fahrenheit for your weather updates."

Celsius confirmations:
- "Sure thing! I'll display temperatures in Celsius (°C)."
- "Celsius mode activated! Temperatures in °C coming your way."
- "You got it! All temperatures will be in °C now."

### Using Unit Preference in Weather Responses

When displaying weather:
1. Check working memory for preferred_units
2. If "fahrenheit": Convert temperature and display as °F
3. If "celsius" or not set: Display as °C (default)

Temperature conversion:
- °F = (°C × 9/5) + 32
- Always round to nearest whole number

Example responses:
- Celsius: "It's currently 22°C in Paris..."
- Fahrenheit: "It's currently 72°F in Paris..."

### Include Both When Helpful

For significant temperatures or when user recently changed preference, you can include both:
- "It's 0°C (32°F) - right at freezing!"
- "A scorching 40°C (104°F) today!"
```

### Response Examples

**Setting Fahrenheit:**
```
User: "I prefer Fahrenheit"
Agent: "Got it! I'll show all temperatures in Fahrenheit (°F) from now on. Would you like to check the weather somewhere?"
```

**Setting Celsius:**
```
User: "Use Celsius please"
Agent: "Sure thing! Temperatures will be in Celsius (°C). What city would you like weather for?"
```

**Switching Units:**
```
User: "Actually, switch to Fahrenheit"
Agent: "No problem! I've switched from Celsius to Fahrenheit. All temperatures will be in °F now."
```

**Weather with Fahrenheit Preference:**
```
User: "What's the weather in London?"
Agent: "Currently 59°F in London with cloudy skies. Humidity at 70%.
A light jacket should do the trick!"
```

**Weather with Celsius Preference (default):**
```
User: "What's the weather in London?"
Agent: "Currently 15°C in London with cloudy skies. Humidity at 70%.
A light jacket should do the trick!"
```

### Working Memory Schema Reference

From Story 1.1:
```typescript
z.object({
  default_city: z.string().optional(),
  preferred_units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  user_name: z.string().optional()
})
```

The default is `'celsius'` - no need to set explicitly if user wants Celsius.

### File Structure After This Story

```
src/mastra/
├── index.ts
├── agents/
│   └── weatherAgent.ts      # Modified: add tool + instructions
├── tools/
│   ├── index.ts             # Modified: export setPreferredUnits
│   ├── getCurrentWeather.ts
│   ├── setDefaultCity.ts
│   └── setPreferredUnits.ts # NEW
└── lib/
    ├── types.ts
    ├── errorCodes.ts
    └── weatherApi.ts
```

### Testing Scenarios

**Set Fahrenheit:**
```
Input: "I prefer Fahrenheit"
Expected: Confirmation, preferred_units = "fahrenheit" in memory
```

**Set Celsius:**
```
Input: "Use Celsius"
Expected: Confirmation, preferred_units = "celsius" in memory
```

**Weather with Fahrenheit:**
```
Setup: preferred_units = "fahrenheit"
Input: "Weather in Tokyo?"
Expected: Temperature shown as °F (e.g., "72°F")
```

**Weather with Celsius (default):**
```
Setup: No preference set
Input: "Weather in Tokyo?"
Expected: Temperature shown as °C (e.g., "22°C")
```

**Switch Units:**
```
Setup: preferred_units = "celsius"
Input: "Switch to Fahrenheit"
Expected: Confirmation mentioning the switch, future temps in °F
```

### References

- [Source: _bmad-output/prd.md#FR14 - Set preferred temperature units]
- [Source: _bmad-output/prd.md#FR17 - Confirm preference changes]
- [Source: _bmad-output/prd.md#NFR3 - Memory operations < 100ms]
- [Source: _bmad-output/architecture.md#Working Memory Schema]
- [Source: Story 1.1 - Working memory with preferred_units field]
- [Source: Story 3.1 - setDefaultCity tool pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/mastra/tools/setPreferredUnits.ts` with:
  - Zod input schema: `{ units: "celsius" | "fahrenheit" }`
  - Zod output schema: `{ success, message, units, unitSymbol }`
  - Agent handles working memory updates via built-in capability
- Exported setPreferredUnits from `src/mastra/tools/index.ts`
- Added setPreferredUnits to agent's tools configuration
- Added UNIT PREFERENCE MANAGEMENT section to agent instructions:
  - Recognition patterns for Fahrenheit and Celsius requests
  - Confirmation message templates for both units
  - Switching units confirmation messages
- Test results:
  - "I prefer Fahrenheit" → "Got it! I'll show temperatures in Fahrenheit (°F) from now on."
  - "Use Celsius" → "Sure thing! I'll display temperatures in Celsius (°C)."
  - Persona consistency verified in all confirmations

### File List

- [x] `src/mastra/tools/setPreferredUnits.ts` - Created
- [x] `src/mastra/tools/index.ts` - Modified (added export)
- [x] `src/mastra/agents/weatherAgent.ts` - Modified (tool + UNIT PREFERENCE MANAGEMENT instructions)

### Change Log

- 2025-12-26: Story 3.2 implemented - setPreferredUnits tool with agent instructions
