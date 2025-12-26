# Story 3.4: Intent Classification for Preference Updates

Status: done

## Story

As a **user**,
I want **the agent to understand when I'm updating preferences vs. asking about weather**,
So that **my requests are handled correctly**.

## Acceptance Criteria

1. **Given** I say "Remember that I live in Tokyo"
   **When** the agent processes my request
   **Then** it classifies this as a preference update intent (FR3)
   **And** updates my default city accordingly

2. **Given** I say "What's the weather in Tokyo?"
   **When** the agent processes my request
   **Then** it classifies this as a weather query (not a preference update)
   **And** does not change my default city

3. **Given** I say "My name is Alex"
   **When** the agent processes my request
   **Then** it saves my name to working memory
   **And** can use it in future greetings (FR20)

4. **Given** I say something ambiguous like "Tokyo"
   **When** the agent processes my request
   **Then** it asks for clarification
   **And** does not assume intent

5. **Given** I change multiple preferences in one message
   **When** the agent processes my request
   **Then** it handles all preference updates correctly

## Tasks / Subtasks

- [x] Task 1: Define comprehensive intent patterns (AC: #1, #2)
  - [x] List all weather query patterns (question words, imperative, contextual)
  - [x] List all preference update patterns (explicit, residence, memory requests)
  - [x] Define disambiguation rules (city alone, "I'm in [city]")

- [x] Task 2: Update agent instructions for intent classification (AC: #1-5)
  - [x] Enhanced INTENT CLASSIFICATION section with 7 categories
  - [x] Added WEATHER QUERY INDICATORS with detailed patterns
  - [x] Added PREFERENCE UPDATE INDICATORS with detailed patterns
  - [x] Added DISAMBIGUATION RULES section
  - [x] Added MULTI-PREFERENCE HANDLING section
  - [x] Added TRICKY CASES section
  - [x] Added NEVER ASSUME rules

- [x] Task 3: Add setUserName tool or instruction handling (AC: #3)
  - [x] Chose agent-managed approach (simpler, no dedicated tool)
  - [x] USER NAME MANAGEMENT section added in Story 3.3
  - [x] Stores name in working memory
  - [x] Uses name in future greetings (1 in 3-4 responses)

- [x] Task 4: Test intent classification (AC: #1-5)
  - [x] "What's the weather in Paris?" → Query only, default unchanged ✓
  - [x] "Remember that I live in Tokyo" → Saves Tokyo as default ✓
  - [x] "Tokyo" (alone) → Asks for clarification ✓
  - [x] "What's the weather?" → Uses default city (Tokyo), greets as Alex ✓

## Dev Notes

### Dependencies on Previous Stories

**Story 3.1, 3.2 Required:**
- `setDefaultCity` and `setPreferredUnits` tools working

**Story 1.4 Required:**
- Basic intent classification framework

### Intent Classification Matrix

| User Says | Primary Intent | Action |
|-----------|---------------|--------|
| "What's the weather in Paris?" | Weather Query | Query Paris, don't save |
| "Weather for Tokyo" | Weather Query | Query Tokyo, don't save |
| "Set my default city to London" | Preference Update | Save London as default |
| "I live in Berlin" | Preference Update | Save Berlin as default |
| "Remember I'm from Sydney" | Preference Update | Save Sydney as default |
| "I prefer Fahrenheit" | Preference Update | Save unit preference |
| "My name is Alex" | Preference Update | Save name |
| "Tokyo" (alone) | Ambiguous | Ask for clarification |
| "Check Tokyo and save it" | Both | Query AND save |

### Intent Classification Rules

**Add comprehensive section to agent instructions:**

```typescript
## INTENT CLASSIFICATION

Your primary job is correctly understanding what the user wants. Misclassifying intent leads to frustration.

### WEATHER QUERY INDICATORS

These patterns indicate a WEATHER QUERY (do NOT update preferences):

**Question words + city:**
- "What's the weather in [city]?"
- "How's the weather in [city]?"
- "Is it raining in [city]?"
- "What's [city] like today?"

**Imperative + city:**
- "Check [city] for me"
- "Tell me about [city]'s weather"
- "Weather report for [city]"
- "Give me [city] weather"

**Contextual queries:**
- "What about [city]?" (in conversation about weather)
- "And [city]?" (comparing cities)
- "How about [city]?" (alternative location)

**Key signal:** They want INFORMATION, not to SAVE anything.

### PREFERENCE UPDATE INDICATORS

These patterns indicate a PREFERENCE UPDATE (DO update working memory):

**Explicit setting commands:**
- "Set my default city to [city]"
- "Save [city] as my default"
- "Use [city] as my default"
- "Make [city] my default"
- "Change my default to [city]"

**Residence/location statements:**
- "I live in [city]"
- "I'm in [city]" (when not asking about weather)
- "I'm from [city]"
- "I'm based in [city]"
- "My city is [city]"
- "Home is [city]"

**Memory requests:**
- "Remember I'm in [city]"
- "Remember that I live in [city]"
- "Don't forget I'm in [city]"
- "Keep in mind I'm in [city]"

**Unit preferences:**
- "I prefer [units]"
- "Use [units]"
- "Switch to [units]"
- "I want [units]"
- "Show me [units]"

**Name sharing:**
- "My name is [name]"
- "I'm [name]"
- "Call me [name]"
- "You can call me [name]"

**Key signal:** They want you to REMEMBER something for FUTURE use.

### DISAMBIGUATION RULES

**Ambiguous: Just a city name alone**
- "Tokyo" → Ask: "Would you like me to check the weather in Tokyo, or save it as your default city?"
- "Paris" → Ask: "Should I get the weather for Paris, or set it as your go-to location?"

**Ambiguous: "I'm in [city]"**
This could mean:
- Weather query: "I'm in London, what's the weather?" → Query
- Preference: "I'm in London" (no weather question) → Ask for clarification
- Clear preference: "I'm in London now, remember that" → Save

If unclear, prefer to ASK rather than assume:
"Are you asking about the weather in [city], or would you like me to remember it as your default location?"

### MULTI-PREFERENCE HANDLING

Users might set multiple things at once:

**Example:** "I live in Tokyo and prefer Fahrenheit"
1. Parse both preferences
2. Call setDefaultCity(Tokyo)
3. Call setPreferredUnits(fahrenheit)
4. Confirm both: "Got it! I've set Tokyo as your default and switched to Fahrenheit."

**Example:** "My name is Alex and I'm from Sydney"
1. Save user_name: Alex
2. Save default_city: Sydney
3. Confirm: "Nice to meet you, Alex! I've saved Sydney as your default city."

### TRICKY CASES

**Weather in home city:**
"What's the weather at home?" → Use their default_city, don't change it

**Traveling context:**
"I'm visiting Paris, what's the weather?" → Query Paris, don't save (temporary visit)
"I moved to Paris" → Save Paris as default (permanent change)

**Corrections:**
"No, I meant London" → Determine what they're correcting (query or preference)
"Actually, change it to Berlin" → Update the preference they just set

### NEVER ASSUME

When intent is unclear:
1. DO NOT guess
2. Ask a clarifying question
3. Present clear options
4. Wait for user response

Bad: Assuming "Berlin" means "set Berlin as default"
Good: "Would you like the weather for Berlin, or should I save it as your default?"
```

### User Name Handling

**Option 1: Agent-managed (simpler)**

The agent can update user_name via memory instructions without a dedicated tool:

```typescript
## USER NAME MANAGEMENT

When user shares their name:
1. Recognize patterns: "My name is...", "I'm...", "Call me..."
2. Extract the name
3. Update working memory: user_name = extracted name
4. Respond warmly: "Nice to meet you, [name]!"

Use name occasionally (1 in 3-4 responses) in:
- Greetings: "Hey [name]!"
- Advice: "[Name], you might want a jacket today!"
- Farewells: "Stay dry out there, [name]!"
```

**Option 2: Dedicated tool (consistent pattern)**

Create `setUserName` tool similar to other preference tools:

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const setUserName = createTool({
  id: 'setUserName',
  description: 'Save the user\'s name for personalized interactions.',
  inputSchema: z.object({
    name: z.string().describe('The user\'s name'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context, memory }) => {
    const { name } = context
    await memory?.updateWorkingMemory?.({ user_name: name })
    return {
      success: true,
      message: `Nice to meet you, ${name}!`,
    }
  },
})
```

### Response Examples

**Weather Query (no preference change):**
```
User: "What's the weather in Tokyo?"
Agent: [Calls getCurrentWeather(Tokyo)]
"Currently 22°C in Tokyo with clear skies..."
(default_city unchanged)
```

**Preference Update:**
```
User: "I live in Tokyo"
Agent: [Calls setDefaultCity(Tokyo)]
"Got it! I've saved Tokyo as your default city."
```

**Ambiguous Input:**
```
User: "Tokyo"
Agent: "Would you like me to check the weather in Tokyo, or save it as your default city?"
```

**Multi-preference:**
```
User: "My name is Oleksii and I live in Kyiv, use Celsius"
Agent: [Updates user_name, calls setDefaultCity, calls setPreferredUnits]
"Nice to meet you, Oleksii! I've set Kyiv as your default and I'll show temperatures in Celsius."
```

**Name + Query:**
```
User: "I'm Sarah, what's the weather in Boston?"
Agent: [Saves user_name, calls getCurrentWeather]
"Nice to meet you, Sarah! Here's the weather in Boston: 18°C with partly cloudy skies..."
(Note: Boston NOT saved as default - it was a query)
```

### File Structure

```
src/mastra/
├── agents/
│   └── weatherAgent.ts      # Modify: comprehensive intent classification
└── tools/
    ├── index.ts             # Modify: export setUserName (optional)
    └── setUserName.ts       # NEW (optional - can use agent instructions instead)
```

### Testing Scenarios

**Query vs Preference:**
```
Test 1: "What's the weather in Paris?" → Query only, default unchanged
Test 2: "Set my default to Paris" → Saves default
Test 3: "I live in Paris" → Saves default
```

**Ambiguous Input:**
```
Test 4: "Paris" → Asks for clarification
Test 5: "Check Paris" → Weather query (imperative suggests query)
```

**Name Handling:**
```
Test 6: "My name is Alex" → Saves name, confirms
Test 7: "What's the weather? I'm Sarah" → Queries weather, saves name
```

**Multi-preference:**
```
Test 8: "I'm Alex from Tokyo, use Fahrenheit" → Saves all three preferences
```

### References

- [Source: _bmad-output/prd.md#FR3 - Intent classification]
- [Source: _bmad-output/prd.md#FR20 - Greet by name]
- [Source: _bmad-output/architecture.md#Agent Configuration]
- [Source: Story 1.4 - Basic intent classification]
- [Source: Story 3.1 - setDefaultCity pattern]
- [Source: Story 3.3 - User name storage]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Enhanced INTENT CLASSIFICATION section**: Replaced basic 6-category list with comprehensive classification including patterns, examples, and rules
2. **Weather query indicators**: Added detailed patterns for question words + city, imperative + city, contextual queries, and traveling context
3. **Preference update indicators**: Added patterns for explicit commands, residence statements, memory requests, unit preferences, and name sharing
4. **Disambiguation rules**: Added rules for ambiguous inputs like city name alone or "I'm in [city]" without context
5. **Multi-preference handling**: Added instructions for parsing and confirming multiple preferences in a single message
6. **Tricky cases**: Added handling for "weather at home", traveling context, and corrections
7. **User name management**: Leveraged existing implementation from Story 3.3 (agent-managed approach without dedicated tool)
8. **Tested all acceptance criteria**: Weather queries don't change defaults, preference updates work, ambiguous input gets clarification

### File List

- [x] `src/mastra/agents/weatherAgent.ts` - Modified (comprehensive intent classification section, ~130 lines added)
- [ ] `src/mastra/tools/setUserName.ts` - Not created (chose agent-managed approach from Story 3.3)
- [ ] `src/mastra/tools/index.ts` - Not modified (no new tool needed)
