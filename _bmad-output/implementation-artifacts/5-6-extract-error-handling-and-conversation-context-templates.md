# Story 5.6: Extract Error Handling and Conversation Context Templates

Status: review

## Story

As a **developer**,
I want **error handling and context rules in templates**,
So that **error messaging and context behavior are configurable**.

## Acceptance Criteria

1. **Given** the current instructions contain ERROR HANDLING section
   **When** I create `errorHandling.njk`
   **Then** it contains all error message patterns (city not found, API unavailable, rate limited, missing key)
   **And** uses `{{ agentName }}` where appropriate for persona consistency

2. **Given** the current instructions contain CONVERSATION CONTEXT section
   **When** I create `conversationContext.njk`
   **Then** it contains context awareness rules, off-topic handling, unclear input handling, empty input handling

3. **Given** errorHandling.njk uses `{{ agentName }}`
   **When** rendered with different agent names
   **Then** error messages maintain persona consistency

4. **Given** conversationContext.njk is rendered
   **When** I check the output
   **Then** it matches the structure of the original section

5. **Given** both templates are independent
   **When** I modify one
   **Then** the other is unaffected

## Tasks / Subtasks

- [x] Task 1: Read current sections from weatherAgent.ts (AC: #1, #2)
  - [x] Identify ERROR HANDLING section content
  - [x] Identify CONVERSATION CONTEXT section content
  - [x] Note where agentName should be substituted

- [x] Task 2: Create errorHandling.njk (AC: #1, #3)
  - [x] Create file at `src/mastra/agents/templates/errorHandling.njk`
  - [x] Add error code response patterns
  - [x] Substitute `{{ agentName }}` in persona-consistent messages

- [x] Task 3: Create conversationContext.njk (AC: #2, #4)
  - [x] Create file at `src/mastra/agents/templates/conversationContext.njk`
  - [x] Add context awareness rules
  - [x] Add off-topic, unclear, and empty input handling

- [x] Task 4: Test templates (AC: #3, #4, #5)
  - [x] Render with default agentName
  - [x] Render with custom agentName - verify substitution in error messages

## Dev Notes

### errorHandling.njk Template

```nunjucks
{# src/mastra/agents/templates/errorHandling.njk #}
{# Error handling and user-friendly error messages #}

## ERROR HANDLING

When tools return error codes, respond with user-friendly messages:

### CITY_NOT_FOUND

User asked about a city that doesn't exist or was misspelled.

Response pattern:
- "I couldn't find weather data for '[city]'. Could you check the spelling or try a different city?"
- "Hmm, '[city]' doesn't seem to be in my database. Did you mean [suggestion]?"

### API_KEY_INVALID

The OpenWeatherMap API key is misconfigured.

Response pattern:
- "I'm having trouble connecting to the weather service. Please check that the API key is configured correctly."
- Never expose the actual API key or technical details to the user.

### API_UNAVAILABLE

The weather service is down or unreachable.

Response pattern:
- "The weather service seems to be temporarily unavailable. Please try again in a moment."
- "I'm having trouble reaching the weather data right now. Give me a minute and try again!"

### RATE_LIMITED

Too many requests to the weather API.

Response pattern:
- "I've been checking weather a lot! Let me take a breather - please try again in a minute."
- "Weather service is a bit overwhelmed. Try again shortly!"

### General Error Handling Principles

1. **Never expose technical details** - No stack traces, API errors, or internal messages
2. **Stay in persona** - {{ agentName }} remains friendly even when errors occur
3. **Offer alternatives** - Suggest what the user can do next
4. **Be honest** - Acknowledge when something isn't working
5. **Remain helpful** - Don't just report the error, guide toward a solution
```

### conversationContext.njk Template

```nunjucks
{# src/mastra/agents/templates/conversationContext.njk #}
{# Conversation context awareness and handling rules #}

## CONVERSATION CONTEXT

### Context Awareness

You have access to the recent conversation history. Use it to:

1. **Reference previous answers** - "The temperature I mentioned earlier..."
2. **Understand follow-up questions** - "What about tomorrow?" refers to the city just discussed
3. **Track conversation flow** - Don't repeat information unnecessarily

### Off-Topic Handling

When users ask about non-weather topics:

**Polite Redirection Pattern:**
- Acknowledge their question briefly
- Redirect to your specialty
- Offer weather-related assistance

**Examples:**
- User: "Tell me about Bitcoin"
- Response: "I'm focused on weather information, so I can't help with Bitcoin. But I can tell you about the weather anywhere in the world! What city interests you?"

- User: "What's the capital of France?"
- Response: "Geography is outside my expertise, but I can tell you it's {{ '{{temperature}}' }}°C in Paris right now! Want the full weather report?"

**Never:**
- Pretend to know about non-weather topics
- Give incorrect information on other subjects
- Be rude about the redirection

### Unclear Input Handling

When user input is unclear or gibberish:

**Response Pattern:**
- Acknowledge confusion politely
- Ask for clarification
- Stay in persona

**Examples:**
- User: "asdfghjkl"
- Response: "I didn't quite catch that! Could you rephrase your weather question?"

- User: "the the weather is?"
- Response: "I want to help! Are you asking about the current weather somewhere? Just tell me the city!"

### Empty Input Handling

When user sends empty or whitespace-only input:

**Response Pattern:**
- Gently prompt for input
- Offer suggestions

**Example:**
- Response: "I'm ready to help with weather! What city would you like to know about?"

### Handling Multiple Questions

When user asks several things at once:

**Strategy:**
1. Identify all questions
2. Answer the primary weather question first
3. Address secondary questions in order
4. If too many, focus on weather-related ones

**Example:**
- User: "What's the weather in Tokyo and should I bring an umbrella and what's my default city?"
- Response: Address Tokyo weather, umbrella advice, and default city in a natural flow
```

### Variables Used

| Variable | Template | Purpose |
|----------|----------|---------|
| agentName | errorHandling.njk | Persona-consistent error messages |

### Error Codes Reference

From project-context.md:
- `CITY_NOT_FOUND` - City doesn't exist or misspelled
- `API_KEY_INVALID` - Configuration error
- `API_UNAVAILABLE` - Service down (5xx)
- `RATE_LIMITED` - Too many requests (429)

### Testing Approach

```typescript
describe('errorHandling.njk', () => {
  it('should include all error code sections', () => {
    const result = env.render('errorHandling.njk', defaultConfig)
    expect(result).toContain('CITY_NOT_FOUND')
    expect(result).toContain('API_KEY_INVALID')
    expect(result).toContain('API_UNAVAILABLE')
    expect(result).toContain('RATE_LIMITED')
  })

  it('should substitute agentName', () => {
    const result = env.render('errorHandling.njk', {
      ...defaultConfig,
      agentName: 'Stormy'
    })
    expect(result).toContain('Stormy')
  })
})

describe('conversationContext.njk', () => {
  it('should include handling sections', () => {
    const result = env.render('conversationContext.njk', defaultConfig)
    expect(result).toContain('Off-Topic Handling')
    expect(result).toContain('Unclear Input Handling')
    expect(result).toContain('Empty Input Handling')
  })
})
```

### File Location

```
src/mastra/agents/templates/
├── index.ts
├── types.ts
├── identity.njk
├── capabilities.njk
├── responseFormatting.njk
├── errorHandling.njk         ← THIS STORY
├── conversationContext.njk   ← THIS STORY
└── main.njk
```

### Escaping Template Syntax in Instructions

Note the use of `{{ '{{temperature}}' }}` in conversationContext.njk. This is how to include literal `{{` characters in Nunjucks output without them being interpreted as variable substitution.

## Dev Agent Record

### Implementation Plan
- Read weatherAgent.ts for ERROR HANDLING (lines 45-53) and CONVERSATION CONTEXT (lines 55-60, plus OFF-TOPIC, UNCLEAR, EMPTY sections)
- Create errorHandling.njk with {{ agentName }} for persona consistency
- Create conversationContext.njk with all handling sections (no variables needed)
- Add unit tests for both templates

### Debug Log
- ERROR HANDLING section identified at lines 45-53 ✓
- CONVERSATION CONTEXT + OFF-TOPIC + UNCLEAR + EMPTY identified ✓
- errorHandling.njk created with {{ agentName }} substitution ✓
- conversationContext.njk created with all 4 sections ✓
- 9 tests pass for errorHandling.njk ✓
- 13 tests pass for conversationContext.njk ✓
- Build passes ✓

### Completion Notes
All tasks completed. errorHandling.njk uses {{ agentName }} for persona-consistent error messages. conversationContext.njk is static (no variables) and includes CONVERSATION CONTEXT, OFF-TOPIC HANDLING, UNCLEAR INPUT HANDLING, and EMPTY INPUT sections. Both templates are independent and can be modified separately.

## File List

- src/mastra/agents/templates/errorHandling.njk (new)
- src/mastra/agents/templates/conversationContext.njk (new)
- tests/mastra/agents/templates/errorHandling.test.ts (new - 9 tests)
- tests/mastra/agents/templates/conversationContext.test.ts (new - 13 tests)

## Change Log

- 2025-12-30: Created errorHandling.njk with persona-aware error messages
- 2025-12-30: Created conversationContext.njk with all handling sections
- 2025-12-30: Added unit tests (22 tests total, all pass)

## References

- [Source: _bmad-output/epics.md#Story 5.6]
- [Source: _bmad-output/project-context.md#Error Handling]
- [Source: src/mastra/agents/weatherAgent.ts - ERROR HANDLING and CONVERSATION CONTEXT sections]
