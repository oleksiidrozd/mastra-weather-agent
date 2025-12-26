# Story 1.4: Implement Intent Classification and Edge Case Handling

Status: ready-for-dev

## Story

As a **user**,
I want **the agent to correctly understand my intent and handle edge cases gracefully**,
So that **I always receive helpful responses, even when my input is unclear or off-topic**.

## Acceptance Criteria

1. **Given** the agent is running
   **When** I ask an off-topic question like "Tell me about Bitcoin"
   **Then** the agent politely redirects to weather topics (FR21)
   **And** responds in persona without being dismissive

2. **Given** the agent is running
   **When** I type gibberish like "asdfghjkl"
   **Then** the agent responds gracefully asking for clarification (FR22)
   **And** the CLI does not crash (NFR11)

3. **Given** the agent is running
   **When** I ask about an ambiguous location like "Springfield"
   **Then** the agent asks for clarification with helpful suggestions (FR23)
   **And** provides options like "Which Springfield? There are several..."

4. **Given** the agent is running
   **When** I provide empty input or just whitespace
   **Then** the agent prompts for input politely
   **And** does not crash or throw errors

5. **Given** the agent is running
   **When** I use informal language or slang
   **Then** the agent understands the intent correctly
   **And** responds naturally in conversation

## Tasks / Subtasks

- [ ] Task 1: Enhance agent instructions for intent classification (AC: #1, #5)
  - [ ] Add off-topic detection and redirection patterns
  - [ ] Add informal language understanding examples
  - [ ] Define weather vs non-weather topic boundaries

- [ ] Task 2: Add gibberish/unclear input handling (AC: #2, #4)
  - [ ] Add instructions for handling unclear input
  - [ ] Add empty input handling in CLI
  - [ ] Define graceful response patterns

- [ ] Task 3: Add ambiguous location handling (AC: #3)
  - [ ] Add instructions for common ambiguous cities
  - [ ] Add clarification question patterns
  - [ ] List known ambiguous locations (Springfield, Portland, etc.)

- [ ] Task 4: Update CLI for edge case handling (AC: #2, #4)
  - [ ] Handle empty/whitespace input in CLI loop
  - [ ] Ensure no crashes on malformed input
  - [ ] Add input validation before sending to agent

- [ ] Task 5: Test edge cases (AC: #1-5)
  - [ ] Test off-topic redirection
  - [ ] Test gibberish handling
  - [ ] Test ambiguous locations
  - [ ] Test empty input
  - [ ] Test informal language

## Dev Notes

### Dependencies on Previous Stories

This story requires:
- Story 1.2: Agent and CLI created
- Story 1.3: Base persona established

**If previous stories not complete:** Implement them first.

### Enhanced Agent Instructions

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## INTENT CLASSIFICATION

Classify user input into these categories:

1. **Weather Query** - Asking about weather in a specific or default city
   - "What's the weather in Paris?"
   - "Is it raining?"
   - "How cold is it outside?"
   - "Weather report for Tokyo"

2. **Preference Update** - Setting defaults or preferences
   - "Set my default city to London"
   - "I prefer Fahrenheit"
   - "Remember I live in Berlin"
   - "My name is Alex"

3. **Temperature Conversion** - Converting between units
   - "Convert 32F to Celsius"
   - "What's that in Fahrenheit?"
   - "How many degrees is 20C?"

4. **Greeting** - Social pleasantries
   - "Hello", "Hi", "Hey"
   - "Good morning"
   - "How are you?"

5. **Session Command** - Managing the conversation
   - "New session", "Start over"
   - "Exit", "Quit", "Bye"

6. **Off-Topic** - Anything not weather-related
   - Questions about other topics
   - Requests you can't fulfill

7. **Unclear** - Gibberish or incomprehensible input
   - Random characters
   - Incomplete sentences that don't make sense

## OFF-TOPIC HANDLING

When users ask about non-weather topics, redirect politely:

Examples:
- "Tell me about Bitcoin" → "I'm not really into crypto - I'm more of a weather enthusiast! Speaking of which, would you like to know the weather somewhere?"
- "What's the capital of France?" → "Geography isn't my specialty, but I can tell you the weather in Paris if you'd like!"
- "Write me a poem" → "I'm better at weather reports than poetry! How about I describe today's weather poetically instead?"

RULES:
- Never be rude or dismissive
- Acknowledge their question briefly
- Redirect to weather naturally
- Offer a weather-related alternative

## UNCLEAR INPUT HANDLING

When you can't understand the input:

Examples:
- "asdfghjkl" → "Hmm, I didn't quite catch that. Could you rephrase? I'm here to help with weather questions!"
- "???!!!" → "I'm not sure what you mean. Are you asking about weather somewhere?"
- "the the what" → "Sorry, I didn't understand. Did you want to know the weather in a specific city?"

RULES:
- Never mock the user
- Offer to help
- Suggest what you can do
- Give them a clear path forward

## AMBIGUOUS LOCATION HANDLING

Some city names exist in multiple locations. Ask for clarification:

**Known Ambiguous Cities:**
- Springfield (USA has 30+ Springfields)
- Portland (Oregon vs Maine)
- Richmond (Virginia vs California vs UK)
- Birmingham (Alabama vs UK)
- Cambridge (Massachusetts vs UK)
- Dublin (Ireland vs Ohio vs California)
- Manchester (UK vs New Hampshire)
- Newcastle (UK vs Australia)

**Clarification Pattern:**
"There are several places called [city]. Could you specify which one? For example:
- [City], [Country/State 1]
- [City], [Country/State 2]

Or you can add the country/state to your request!"

## INFORMAL LANGUAGE UNDERSTANDING

Understand casual expressions:

- "What's it like outside?" → Weather query for default/current city
- "Do I need a jacket?" → Weather query with clothing advice focus
- "Is it gonna rain?" → Weather query focusing on precipitation
- "Hot or cold today?" → Weather query for temperature
- "Umbrella weather?" → Weather query focusing on rain
- "Beach day?" → Weather query for outdoor activity suitability

## EMPTY INPUT

If user sends empty or whitespace-only input:
"I didn't see a message there. What would you like to know about the weather?"
```

### CLI Edge Case Handling

**Update `src/cli/index.ts`:**

```typescript
while (true) {
  const userInput = await rl.question('You: ')
  const trimmed = userInput.trim()

  // Handle empty input
  if (!trimmed) {
    console.log('Agent: I didn\'t see a message there. What would you like to know about the weather?')
    continue
  }

  const lowerTrimmed = trimmed.toLowerCase()

  if (lowerTrimmed === 'exit' || lowerTrimmed === 'quit') {
    console.log('Goodbye!')
    rl.close()
    break
  }

  if (lowerTrimmed === 'new session') {
    threadId = randomUUID()
    console.log('Started new session. Previous conversation history cleared.')
    continue
  }

  try {
    process.stdout.write('Agent: ')

    const result = await weatherAgent.stream(trimmed, { // Use trimmed, not lowercased
      threadId,
      resourceId: RESOURCE_ID,
    })

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk)
    }

    console.log('')
  } catch (error) {
    // Handle errors gracefully - don't crash
    console.error('\nSorry, I encountered an issue. Please try again!')
    if (process.env.DEBUG) {
      console.error('Debug:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
```

### Known Ambiguous Locations Reference

| City | Locations |
|------|-----------|
| Springfield | IL, MA, MO, OH, OR + 25 more US states |
| Portland | OR, ME |
| Richmond | VA, CA, UK |
| Birmingham | AL, UK |
| Cambridge | MA, UK |
| Dublin | Ireland, OH, CA |
| Manchester | UK, NH |
| Newcastle | UK, Australia |
| London | UK, ON (Canada) |
| Paris | France, TX |

### Testing Scenarios

**Off-Topic Redirection:**
```
Input: "Tell me about Bitcoin"
Expected: Polite redirection to weather
NOT: Technical refusal or error
```

**Gibberish Handling:**
```
Input: "asdfghjkl"
Expected: "I didn't quite catch that. Could you rephrase?"
NOT: Error or crash
```

**Ambiguous Location:**
```
Input: "Weather in Springfield"
Expected: "There are several Springfields. Which one did you mean?"
NOT: Random Springfield or error
```

**Empty Input:**
```
Input: "   " (whitespace only)
Expected: Prompt for actual input
NOT: Sent to agent or error
```

**Informal Language:**
```
Input: "Umbrella weather today?"
Expected: Weather info with rain/no-rain focus
NOT: Confusion about what user means
```

### File Changes

```
src/mastra/agents/weatherAgent.ts  # Modify: enhanced instructions
src/cli/index.ts                   # Modify: edge case handling
```

### References

- [Source: _bmad-output/prd.md#FR21 - Handle off-topic with polite redirection]
- [Source: _bmad-output/prd.md#FR22 - Handle unclear/gibberish gracefully]
- [Source: _bmad-output/prd.md#FR23 - Request clarification for ambiguous locations]
- [Source: _bmad-output/prd.md#NFR11 - CLI must not crash on malformed input]
- [Source: _bmad-output/architecture.md#Error Handling Strategy]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

_To be filled by dev agent after implementation_

### File List

- [ ] `src/mastra/agents/weatherAgent.ts` - Modified (enhanced instructions)
- [ ] `src/cli/index.ts` - Modified (edge case handling)
