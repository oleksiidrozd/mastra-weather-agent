# Story 4.1: Implement convertTemperature Tool

Status: done

## Story

As a **user**,
I want **to convert temperatures between Celsius and Fahrenheit**,
So that **I can understand temperatures in my preferred unit**.

## Acceptance Criteria

1. **Given** the agent is running
   **When** I ask "Convert 32°F to Celsius"
   **Then** the agent calls `convertTemperature` and responds with "32°F is 0°C" (FR11)

2. **Given** the agent is running
   **When** I ask "What is 25°C in Fahrenheit?"
   **Then** the agent responds with "25°C is 77°F" (FR10)

3. **Given** I just received weather information showing 20°C
   **When** I ask "What's that in Fahrenheit?"
   **Then** the agent uses conversation context to convert 20°C to 68°F (FR12)
   **And** does not ask me to specify which temperature

4. **Given** the agent performs a conversion
   **When** it responds to the user
   **Then** it maintains persona and provides the conversion naturally

5. **Given** the user provides an invalid temperature format
   **When** the agent processes the request
   **Then** it asks for clarification politely

## Tasks / Subtasks

- [x] Task 1: Create convertTemperature tool (AC: #1, #2)
  - [x] Create `src/mastra/tools/convertTemperature.ts`
  - [x] Define Zod input schema (temperature, fromUnit, toUnit)
  - [x] Define Zod output schema (originalValue, originalUnit, convertedValue, convertedUnit, formatted)
  - [x] Implement conversion logic (pure math: C→F and F→C)

- [x] Task 2: Register tool with agent (AC: #1, #2)
  - [x] Export from `src/mastra/tools/index.ts`
  - [x] Add to agent's tools in `weatherAgent.ts`

- [x] Task 3: Update agent instructions for conversions (AC: #3, #4, #5)
  - [x] Add TEMPERATURE CONVERSION section with recognition patterns
  - [x] Add contextual conversion handling (use last temperature from conversation)
  - [x] Add response formatting guidelines and fun facts
  - [x] Add invalid input handling instructions

- [x] Task 4: Test the tool (AC: #1-5)
  - [x] Weather in Kyiv → -2°C
  - [x] "What's that in Fahrenheit?" → "That -2°C in Kyiv would be 28°F!" ✓
  - [x] Contextual conversion works with conversation history ✓
  - [x] Persona maintained in all responses ✓

## Dev Notes

### Dependencies on Previous Stories

**Story 2.1 Required:**
- Weather responses showing temperatures (for contextual conversion)

**Story 1.2 Required:**
- Agent and CLI working

### Tool Implementation

**File: `src/mastra/tools/convertTemperature.ts`**

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const convertTemperature = createTool({
  id: 'convertTemperature',
  description: 'Convert a temperature between Celsius and Fahrenheit. Use this when the user wants to know a temperature in a different unit.',
  inputSchema: z.object({
    temperature: z.number().describe('The temperature value to convert'),
    fromUnit: z.enum(['celsius', 'fahrenheit']).describe('The unit to convert from'),
    toUnit: z.enum(['celsius', 'fahrenheit']).describe('The unit to convert to'),
  }),
  outputSchema: z.object({
    originalValue: z.number(),
    originalUnit: z.enum(['celsius', 'fahrenheit']),
    convertedValue: z.number(),
    convertedUnit: z.enum(['celsius', 'fahrenheit']),
    formatted: z.string(),
  }),
  execute: async ({ context }) => {
    const { temperature, fromUnit, toUnit } = context

    let convertedValue: number

    if (fromUnit === toUnit) {
      convertedValue = temperature
    } else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      // C to F: (C × 9/5) + 32
      convertedValue = Math.round((temperature * 9/5) + 32)
    } else {
      // F to C: (F - 32) × 5/9
      convertedValue = Math.round((temperature - 32) * 5/9)
    }

    const fromSymbol = fromUnit === 'celsius' ? '°C' : '°F'
    const toSymbol = toUnit === 'celsius' ? '°C' : '°F'

    return {
      originalValue: temperature,
      originalUnit: fromUnit,
      convertedValue,
      convertedUnit: toUnit,
      formatted: `${temperature}${fromSymbol} is ${convertedValue}${toSymbol}`,
    }
  },
})
```

### Conversion Formulas

| Direction | Formula | Example |
|-----------|---------|---------|
| C → F | (C × 9/5) + 32 | 25°C → 77°F |
| F → C | (F - 32) × 5/9 | 32°F → 0°C |

### Tools Barrel Export Update

**Update `src/mastra/tools/index.ts`:**

```typescript
export { getCurrentWeather } from './getCurrentWeather.js'
export { setDefaultCity } from './setDefaultCity.js'
export { setPreferredUnits } from './setPreferredUnits.js'
export { convertTemperature } from './convertTemperature.js'
```

### Agent Tools Update

**Update `src/mastra/agents/weatherAgent.ts`:**

```typescript
import {
  getCurrentWeather,
  setDefaultCity,
  setPreferredUnits,
  convertTemperature,
} from '../tools/index.js'

export const weatherAgent = new Agent({
  // ...existing config...
  tools: {
    getCurrentWeather,
    setDefaultCity,
    setPreferredUnits,
    convertTemperature,
  },
  // ...rest of config...
})
```

### Agent Instruction Updates

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## TEMPERATURE CONVERSION

### Recognizing Conversion Requests

**Explicit conversions:**
- "Convert 32°F to Celsius"
- "What is 25°C in Fahrenheit?"
- "How much is 100F in C?"
- "32 Fahrenheit to Celsius"
- "Convert -40 degrees Celsius"

**Contextual conversions (use conversation history):**
- "What's that in Fahrenheit?" → Convert the last mentioned temperature
- "And in Celsius?" → Convert the last mentioned temperature
- "Convert that" → Convert the last mentioned temperature

### Parsing Temperature Input

Extract these from user input:
1. **Temperature value:** The number (can be negative)
2. **Source unit:** Look for C, Celsius, F, Fahrenheit, or context
3. **Target unit:** The opposite, or what they ask for

**Unit detection:**
- "F", "°F", "Fahrenheit", "degrees F" → fahrenheit
- "C", "°C", "Celsius", "degrees C" → celsius
- No unit specified → Ask for clarification OR infer from context

### Handling Contextual Conversions

When user says "What's that in [unit]?" or similar:
1. Look at the last temperature mentioned in conversation
2. Determine its unit
3. Convert to the requested unit
4. Respond naturally: "That 20°C would be 68°F"

**Example flow:**
```
User: "What's the weather in London?"
Agent: "It's currently 15°C in London with cloudy skies..."
User: "What's that in Fahrenheit?"
Agent: [Converts 15°C] "That's 59°F - still a bit chilly!"
```

### Response Formatting

Keep conversions conversational:
- "32°F is 0°C - right at freezing!"
- "25°C converts to 77°F - nice and warm!"
- "That's 68°F, which is about 20°C."

For contextual conversions, reference what you're converting:
- "The 15°C in London would be 59°F."
- "That temperature of 30°C is 86°F - quite hot!"

### Handling Invalid Input

If you can't determine the temperature or unit:
- "I'd be happy to convert that! Could you tell me the temperature and whether it's in Celsius or Fahrenheit?"
- "What temperature would you like me to convert? For example, '25C to F' or '77F to Celsius'."

### Edge Cases

**Freezing/Boiling points (known values):**
- 0°C = 32°F (freezing point of water)
- 100°C = 212°F (boiling point of water)
- -40°C = -40°F (they're equal!)

You can mention these fun facts when relevant:
- "32°F is 0°C - exactly at the freezing point!"
- "-40 is actually the same in both Celsius and Fahrenheit!"
```

### Response Examples

**Explicit Conversion:**
```
User: "Convert 100F to Celsius"
Agent: [Calls convertTemperature(100, 'fahrenheit', 'celsius')]
"100°F is about 38°C - that's quite warm!"
```

**Contextual Conversion:**
```
User: "What's the weather in Dubai?"
Agent: "It's a scorching 40°C in Dubai with clear skies..."
User: "What's that in Fahrenheit?"
Agent: [Calls convertTemperature(40, 'celsius', 'fahrenheit')]
"That 40°C is 104°F - definitely stay in the air conditioning!"
```

**Freezing Point:**
```
User: "What's 32 Fahrenheit in Celsius?"
Agent: "32°F is 0°C - right at the freezing point of water!"
```

**Ambiguous Input:**
```
User: "Convert 25 degrees"
Agent: "I'd be happy to convert 25 degrees! Is that Celsius or Fahrenheit?"
```

### File Structure After This Story

```
src/mastra/
├── index.ts
├── agents/
│   └── weatherAgent.ts      # Modified: add tool + instructions
└── tools/
    ├── index.ts             # Modified: export convertTemperature
    ├── getCurrentWeather.ts
    ├── setDefaultCity.ts
    ├── setPreferredUnits.ts
    └── convertTemperature.ts # NEW
```

### Testing Scenarios

**C to F:**
```
Input: "What is 25°C in Fahrenheit?"
Expected: "25°C is 77°F"
```

**F to C:**
```
Input: "Convert 32°F to Celsius"
Expected: "32°F is 0°C"
```

**Contextual:**
```
Setup: Just showed weather of 20°C
Input: "What's that in Fahrenheit?"
Expected: Uses 20°C from context, responds "68°F"
```

**Special Values:**
```
Input: "What is -40C in Fahrenheit?"
Expected: "-40°C is -40°F" (they're equal!)
```

**Ambiguous:**
```
Input: "Convert 50 degrees"
Expected: Asks for clarification about which unit
```

### References

- [Source: _bmad-output/prd.md#FR10 - C to F conversion]
- [Source: _bmad-output/prd.md#FR11 - F to C conversion]
- [Source: _bmad-output/prd.md#FR12 - Use conversation context for conversion]
- [Source: _bmad-output/architecture.md#Tools]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Created convertTemperature tool** with:
   - Input schema: temperature (number), fromUnit, toUnit (celsius/fahrenheit)
   - Output schema: originalValue, originalUnit, convertedValue, convertedUnit, formatted string
   - Conversion formulas: C→F: (C × 9/5) + 32, F→C: (F - 32) × 5/9
   - Handles same-unit conversion (returns original value)
2. **Registered tool** with agent via tools config
3. **Added TEMPERATURE CONVERSION section** to agent instructions (~60 lines):
   - Recognition patterns for explicit and contextual conversions
   - Parsing rules for temperature values and units
   - Contextual conversion handling using conversation history
   - Response formatting guidelines
   - Fun facts for special values (freezing, boiling, -40°)
   - Invalid input handling
4. **Tested successfully**:
   - Weather query → -2°C in Kyiv
   - "What's that in Fahrenheit?" → "That -2°C in Kyiv would be 28°F!" (contextual conversion works)
   - Persona maintained throughout

### File List

- [x] `src/mastra/tools/convertTemperature.ts` - Created
- [x] `src/mastra/tools/index.ts` - Modified (added export)
- [x] `src/mastra/agents/weatherAgent.ts` - Modified (import, tool config, TEMPERATURE CONVERSION instructions)
