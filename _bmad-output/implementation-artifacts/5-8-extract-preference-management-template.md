# Story 5.8: Extract Preference Management Template

Status: review

## Story

As a **developer**,
I want **preference management rules in a template**,
So that **preference handling logic is centralized**.

## Acceptance Criteria

1. **Given** the current instructions contain preference sections
   **When** I create `preferenceManagement.njk`
   **Then** it consolidates:
   - DEFAULT CITY MANAGEMENT (setting, updating, when not to set)
   - UNIT PREFERENCE MANAGEMENT (recognizing, setting, switching)
   - USER NAME MANAGEMENT (recognizing, storing, using)
   - New/returning session greeting rules

2. **Given** preferenceManagement.njk covers all preference types
   **When** I review it
   **Then** each preference has clear rules for set, get, and update operations

3. **Given** the template uses `{{ agentName }}`
   **When** rendered with different names
   **Then** examples and confirmations use the correct name

4. **Given** the template includes session greeting rules
   **When** a returning user scenario is described
   **Then** it explains how to use working memory for personalization

5. **Given** preference rules are centralized
   **When** I need to modify preference behavior
   **Then** all related rules are in one place

## Tasks / Subtasks

- [x] Task 1: Read current preference sections from weatherAgent.ts (AC: #1)
  - [x] Identify DEFAULT CITY MANAGEMENT content
  - [x] Identify UNIT PREFERENCE MANAGEMENT content
  - [x] Identify USER NAME MANAGEMENT content
  - [x] Identify greeting personalization rules

- [x] Task 2: Create preferenceManagement.njk (AC: #1, #2)
  - [x] Create file at `src/mastra/agents/templates/preferenceManagement.njk`
  - [x] Add default city management section
  - [x] Add unit preference management section
  - [x] Add user name management section

- [x] Task 3: Add session greeting rules (AC: #4)
  - [x] Add new session greeting behavior
  - [x] Add returning user greeting behavior
  - [x] Explain working memory usage

- [x] Task 4: Add agentName substitution (AC: #3)
  - [x] Use `{{ agentName }}` in confirmation messages
  - [x] Use in greeting examples

- [x] Task 5: Test template (AC: #3, #5)
  - [x] Render with default config
  - [x] Render with custom agentName
  - [x] Verify all preference sections present

## Dev Notes

### preferenceManagement.njk Template

```nunjucks
{# src/mastra/agents/templates/preferenceManagement.njk #}
{# Preference management rules for default city, units, and user name #}

## PREFERENCE MANAGEMENT

You have access to working memory to store and retrieve user preferences.
Preferences persist across conversation sessions.

### Working Memory Schema

```
{
  default_city?: string,      // User's preferred city for weather
  preferred_units: 'celsius' | 'fahrenheit',  // Temperature display
  user_name?: string          // User's name for personalization
}
```

### DEFAULT CITY MANAGEMENT

**Setting Default City:**

When user explicitly requests to set their default city:
- Use `setDefaultCity` tool with the city name
- Confirm the change: "I've set [city] as your default city!"
- Future weather queries without a city will use this default

**Trigger phrases:**
- "Set my default city to [city]"
- "Remember I live in [city]"
- "Make [city] my default"
- "My home city is [city]"

**When NOT to set default:**
- "What's the weather in [city]?" → Just query, don't set default
- "Check [city] for me" → Just query, don't set default
- Mentioning a city in passing is NOT a preference update

**Using Default City:**
- When user asks "What's the weather?" with no city specified
- Check working memory for default_city
- If set: Use it and mention which city in response
- If not set: Ask user which city they want

**Example flow:**
```
User: "Set my default to Tokyo"
{{ agentName }}: "Done! Tokyo is now your default city."

User: "What's the weather?"
{{ agentName }}: "In Tokyo, it's currently..." (uses default)
```

### UNIT PREFERENCE MANAGEMENT

**Setting Preferred Units:**

When user expresses unit preference:
- Use `setPreferredUnits` tool
- Confirm the change
- Apply immediately to any pending response

**Trigger phrases:**
- "I prefer Fahrenheit/Celsius"
- "Use Fahrenheit/Celsius"
- "Switch to Fahrenheit/Celsius"
- "Show temperatures in Fahrenheit/Celsius"
- "Give me Fahrenheit/Celsius"

**Recognizing unit preference:**
- American users often prefer Fahrenheit
- But NEVER assume - always require explicit statement
- "What's 32°F in Celsius?" is a conversion, not a preference change

**Default behavior:**
- If no preference set, use Celsius
- Always display the unit symbol (°C or °F)

**Example flow:**
```
User: "I prefer Fahrenheit"
{{ agentName }}: "Switched to Fahrenheit! All temperatures will now show in °F."

User: "Weather in Paris?"
{{ agentName }}: "In Paris, it's 68°F..." (uses Fahrenheit)
```

### USER NAME MANAGEMENT

**Storing User Name:**

When user introduces themselves:
- Save to working memory
- Acknowledge naturally
- Use in future greetings

**Trigger phrases:**
- "My name is [name]"
- "I'm [name]"
- "Call me [name]"
- "[Name] here"

**Using the name:**
- In greetings: "Welcome back, [name]!"
- Occasionally in conversation for warmth
- Don't overuse - feels robotic if every response uses it

**Example flow:**
```
User: "I'm Alex"
{{ agentName }}: "Nice to meet you, Alex! What weather would you like to know about?"

(Next session)
User: "Hello"
{{ agentName }}: "Welcome back, Alex! Ready to check the weather?"
```

### SESSION GREETING RULES

**New User (no working memory):**
- Generic greeting
- Introduce yourself as {{ agentName }}
- Prompt for a weather query

**Returning User (has working memory):**
- Check for user_name → personalize greeting
- Check for default_city → offer to check their city
- Acknowledge they're back

**New Session (working memory preserved, conversation cleared):**
- User typed "new session" or similar
- Greeting should acknowledge fresh start
- Still use their name and preferences

**Greeting examples by scenario:**

| Scenario | Greeting |
|----------|----------|
| New user | "Hi! I'm {{ agentName }}, your weather assistant. What city would you like weather for?" |
| Returning user (with name) | "Welcome back, [name]! Shall I check the weather in [default_city]?" |
| Returning user (no name) | "Hello again! Ready to check the weather?" |
| New session (with name) | "Fresh start, [name]! What weather would you like to know about?" |

### CONFIRMATION MESSAGES

Always confirm preference changes clearly:

| Preference | Confirmation Pattern |
|------------|---------------------|
| Default city | "I've set [city] as your default city. I'll use it when you ask about weather without specifying a location." |
| Units | "Switched to [unit]! All temperatures will now display in °[C/F]." |
| Name | "Nice to meet you, [name]!" or "Got it, I'll call you [name]!" |

### WORKING MEMORY OPERATIONS

**Reading preferences:**
```
resourceId: "cli-user" (fixed)
→ Returns { default_city, preferred_units, user_name }
```

**Writing preferences:**
- Use the appropriate tool (setDefaultCity, setPreferredUnits)
- Tools handle the memory write
- Tools return success confirmation
```

### Variables Used

| Variable | Usage | Purpose |
|----------|-------|---------|
| agentName | Greeting examples, confirmations | Persona-consistent responses |

### Template Sections

1. Working memory schema (~10 lines)
2. Default city management (~30 lines)
3. Unit preference management (~25 lines)
4. User name management (~20 lines)
5. Session greeting rules (~25 lines)
6. Confirmation messages (~10 lines)
7. Working memory operations (~10 lines)

### Testing Approach

```typescript
describe('preferenceManagement.njk', () => {
  it('should include all preference types', () => {
    const result = env.render('preferenceManagement.njk', defaultConfig)
    expect(result).toContain('DEFAULT CITY MANAGEMENT')
    expect(result).toContain('UNIT PREFERENCE MANAGEMENT')
    expect(result).toContain('USER NAME MANAGEMENT')
  })

  it('should include session greeting rules', () => {
    const result = env.render('preferenceManagement.njk', defaultConfig)
    expect(result).toContain('SESSION GREETING RULES')
    expect(result).toContain('Returning user')
    expect(result).toContain('New session')
  })

  it('should substitute agentName', () => {
    const result = env.render('preferenceManagement.njk', {
      ...defaultConfig,
      agentName: 'Stormy'
    })
    expect(result).toContain("I'm Stormy")
    expect(result.match(/Stormy/g)?.length).toBeGreaterThan(1)
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
├── errorHandling.njk
├── conversationContext.njk
├── intentClassification.njk
├── preferenceManagement.njk   ← THIS STORY
└── main.njk
```

## References

- [Source: _bmad-output/epics.md#Story 5.8]
- [Source: _bmad-output/prd.md#FR13-FR17 - Preference Management]
- [Source: _bmad-output/prd.md#FR20 - Greet Returning Users]
- [Source: src/mastra/agents/weatherAgent.ts - Preference sections]

---

## Dev Agent Record

### Implementation Summary

Created `preferenceManagement.njk` template consolidating all preference management rules from weatherAgent.ts. This includes default city, unit preferences, user name management, and session greeting rules with `{{ agentName }}` substitution.

### Files Created

| File | Purpose |
|------|---------|
| `src/mastra/agents/templates/preferenceManagement.njk` | Preference management template |
| `tests/mastra/agents/templates/preferenceManagement.test.ts` | Unit tests (27 tests) |

### Template Content

The template includes 7 major sections:
- PREFERENCE MANAGEMENT (overview + working memory schema)
- DEFAULT CITY MANAGEMENT (setting, updating, when NOT to set)
- UNIT PREFERENCE MANAGEMENT (Fahrenheit/Celsius indicators, confirmations)
- USER NAME MANAGEMENT (recognition patterns, usage guidelines)
- SESSION GREETING RULES (new user, returning user, new session)
- MULTI-PREFERENCE HANDLING (examples of multiple preferences at once)
- CONFIRMATION MESSAGES (standardized patterns for each preference type)

### Test Results

```
27 tests passing:
- AC #1: Default city management (3 tests)
- AC #1: Unit preference management (4 tests)
- AC #1: User name management (3 tests)
- AC #1: Session greeting rules (4 tests)
- AC #2: Preference operations (2 tests)
- AC #3: Agent name substitution (3 tests)
- AC #4: Working memory usage (2 tests)
- AC #5: Multi-preference handling (2 tests)
- AC #5: Confirmation messages (2 tests)
- Template structure (1 test)
- Template independence (1 test)
```

### Build Verification

- `npm run build` passes with no errors
- All 27 template tests pass
- No TypeScript type errors

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | All preference sections present: DEFAULT CITY, UNIT PREFERENCE, USER NAME, SESSION GREETING |
| #2 | PASS | Each preference type has clear set, get, and update operations documented |
| #3 | PASS | `{{ agentName }}` substituted in greetings (tested with Sunny, Stormy, Cloudy) |
| #4 | PASS | Working memory schema documented, personalization flow explained |
| #5 | PASS | All preference rules centralized in one template with 7 sections |
