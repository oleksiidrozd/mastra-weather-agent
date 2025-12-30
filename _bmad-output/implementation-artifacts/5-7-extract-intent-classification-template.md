# Story 5.7: Extract Intent Classification Template

Status: review

## Story

As a **developer**,
I want **intent classification rules in a dedicated template**,
So that **the complex intent logic is isolated and maintainable**.

## Acceptance Criteria

1. **Given** the current instructions contain INTENT CLASSIFICATION section (~150 lines)
   **When** I create `intentClassification.njk`
   **Then** it contains:
   - Intent category definitions (Weather Query, Preference Update, etc.)
   - Weather query indicators with example patterns
   - Preference update indicators with example patterns
   - Disambiguation rules
   - Multi-preference handling
   - Tricky cases and "never assume" rules

2. **Given** intentClassification.njk is one of the largest sections
   **When** I review it for maintainability
   **Then** it uses clear section headers and formatting

3. **Given** the intent rules are complex
   **When** I render the template
   **Then** all rules and examples are preserved accurately

4. **Given** the template may need `{{ agentName }}`
   **When** intent examples reference the agent
   **Then** the name is substituted correctly

5. **Given** this template defines classification logic
   **When** rendered
   **Then** the output is identical in meaning to the original section

## Tasks / Subtasks

- [x] Task 1: Read current intent section from weatherAgent.ts (AC: #1)
  - [x] Identify INTENT CLASSIFICATION section (full content)
  - [x] Document all intent categories
  - [x] Note example patterns for each

- [x] Task 2: Create intentClassification.njk (AC: #1, #2)
  - [x] Create file at `src/mastra/agents/templates/intentClassification.njk`
  - [x] Add intent category definitions
  - [x] Add indicator patterns for each category
  - [x] Use clear markdown headers for organization

- [x] Task 3: Add disambiguation rules (AC: #1)
  - [x] Add section for ambiguous inputs
  - [x] Add multi-preference handling
  - [x] Add "tricky cases" section

- [x] Task 4: Add "never assume" rules (AC: #1)
  - [x] Document what the agent should NEVER assume
  - [x] Add clarification request patterns

- [x] Task 5: Test template (AC: #3, #4, #5)
  - [x] Render and verify all sections present
  - [x] Verify agentName substitution if used

## Dev Notes

### intentClassification.njk Template

```nunjucks
{# src/mastra/agents/templates/intentClassification.njk #}
{# Intent classification rules - one of the largest and most critical sections #}

## INTENT CLASSIFICATION

Before responding, classify the user's intent into one of these categories:

### Intent Categories

1. **Weather Query** - User wants weather information
2. **Preference Update** - User wants to set/change preferences
3. **Temperature Conversion** - User wants to convert temperatures
4. **Session Command** - User wants to start new session or exit
5. **Greeting** - User is greeting or making small talk
6. **Off-Topic** - User is asking about non-weather topics
7. **Unclear** - Cannot determine intent

### Weather Query Indicators

User is asking about weather if they mention:

**Explicit patterns:**
- "What's the weather in [city]?"
- "How's the weather?"
- "Weather for [city]"
- "Is it raining in [city]?"
- "Temperature in [city]"
- "What's it like in [city]?"

**Implicit patterns:**
- "Should I bring an umbrella?"
- "Do I need a jacket?"
- "Is it cold outside?"
- "What should I wear?"

**City-only queries:**
- "[City name]" alone may be a weather query if in context
- "What about Tokyo?" (after discussing weather)
- "And London?" (follow-up)

### Preference Update Indicators

User wants to update preferences if they say:

**Default City:**
- "Set my default city to [city]"
- "Remember I live in [city]"
- "My home is [city]"
- "I'm from [city]" (context: setting preference)
- "Make [city] my default"

**Temperature Units:**
- "I prefer Fahrenheit/Celsius"
- "Use Fahrenheit/Celsius"
- "Switch to Fahrenheit/Celsius"
- "Show me temperatures in Fahrenheit/Celsius"

**User Name:**
- "My name is [name]"
- "I'm [name]"
- "Call me [name]"

### Temperature Conversion Indicators

User wants conversion if they ask:

- "Convert [temp] to Celsius/Fahrenheit"
- "What's [temp]°C in Fahrenheit?"
- "What's that in Fahrenheit?" (contextual)
- "[temp] in Celsius please"

### Disambiguation Rules

When intent is unclear, follow these rules:

**Weather vs Preference Ambiguity:**

| Input | Intent | Reason |
|-------|--------|--------|
| "Weather in Paris" | Weather Query | Explicit request |
| "Set Paris as my city" | Preference Update | Explicit "set" |
| "I live in Paris" | **ASK** | Could be either |
| "Paris" (standalone) | Weather Query | Default assumption |

**"I live in [city]" handling:**
- If first interaction: Ask "Would you like me to set [city] as your default, or check the weather there now?"
- If preference already set: Likely just checking weather

### Multi-Preference Handling

When user sets multiple preferences at once:

**Example:** "I'm Alex from Tokyo and I prefer Fahrenheit"

1. Extract all preferences: name=Alex, city=Tokyo, units=fahrenheit
2. Save ALL preferences
3. Confirm ALL changes: "Got it, Alex! I've set Tokyo as your default city and switched to Fahrenheit."

### Tricky Cases

**"What's my default city?"** → This is a QUERY, not an update
- Response: Tell them their current default city

**"My default city is wrong"** → Ask what they want to change it to
- Response: "What city should I set as your default?"

**"Remove my default city"** → Clear the preference
- Response: "I've cleared your default city. Which city would you like weather for?"

**"What's the weather like where I live?"**
- If default city set: Use it
- If not set: Ask "I don't know where you live yet. What city should I check?"

### NEVER Assume

1. **Never assume city from ambiguous statements**
   - "I'm thinking about Paris" ≠ "Set Paris as default"

2. **Never change preferences without explicit request**
   - "Weather in Tokyo" doesn't make Tokyo the default

3. **Never ignore explicit preference requests**
   - If user says "set", "remember", "change", etc. → Update preference

4. **Never assume unit preference from query**
   - "What's 32°F in Celsius?" doesn't mean they prefer Celsius

### Classification Flow

```
User Input
    ↓
Contains weather keywords? → Weather Query
    ↓ no
Contains "set", "remember", "my default"? → Preference Update
    ↓ no
Contains temperature + "in" + unit? → Temperature Conversion
    ↓ no
Is greeting? → Greeting
    ↓ no
Is exit/new session? → Session Command
    ↓ no
Gibberish or unclear? → Unclear (ask for clarification)
    ↓ no
→ Off-Topic (politely redirect)
```
```

### Template Size

This is one of the largest templates (~150 lines). The structure:
1. Categories definition (~20 lines)
2. Weather query indicators (~25 lines)
3. Preference update indicators (~20 lines)
4. Conversion indicators (~10 lines)
5. Disambiguation rules (~25 lines)
6. Multi-preference handling (~15 lines)
7. Tricky cases (~20 lines)
8. Never assume rules (~15 lines)

### Variables Used

| Variable | Usage | Purpose |
|----------|-------|---------|
| (none currently) | - | This template is largely static |

Note: Could potentially use `{{ agentName }}` in examples, but current implementation keeps it generic.

### Testing Approach

```typescript
describe('intentClassification.njk', () => {
  it('should include all intent categories', () => {
    const result = env.render('intentClassification.njk', defaultConfig)
    expect(result).toContain('Weather Query')
    expect(result).toContain('Preference Update')
    expect(result).toContain('Temperature Conversion')
    expect(result).toContain('Session Command')
    expect(result).toContain('Greeting')
    expect(result).toContain('Off-Topic')
    expect(result).toContain('Unclear')
  })

  it('should include disambiguation rules', () => {
    const result = env.render('intentClassification.njk', defaultConfig)
    expect(result).toContain('Disambiguation Rules')
    expect(result).toContain('NEVER Assume')
  })

  it('should include tricky cases', () => {
    const result = env.render('intentClassification.njk', defaultConfig)
    expect(result).toContain('Tricky Cases')
    expect(result).toContain('What\'s my default city')
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
├── intentClassification.njk   ← THIS STORY
└── main.njk
```

### Why Isolate This Section?

1. **Complexity** - Most complex section with many rules
2. **Maintainability** - Easy to update classification logic
3. **Testability** - Can verify all rules are present
4. **Reusability** - Could be shared across agent variants

## References

- [Source: _bmad-output/epics.md#Story 5.7]
- [Source: _bmad-output/prd.md#FR3 - Intent Classification]
- [Source: src/mastra/agents/weatherAgent.ts - INTENT CLASSIFICATION section]

---

## Dev Agent Record

### Implementation Summary

Created `intentClassification.njk` template containing comprehensive intent classification rules extracted from weatherAgent.ts. This is one of the largest templates (~155 lines) covering all intent categories and disambiguation logic.

### Files Created

| File | Purpose |
|------|---------|
| `src/mastra/agents/templates/intentClassification.njk` | Intent classification rules template |
| `tests/mastra/agents/templates/intentClassification.test.ts` | Unit tests for template (22 tests) |

### Template Content

The template includes:
- Intent categories (Weather Query, Preference Update, Temperature Conversion, Greeting, Off-Topic, Unclear, Ambiguous)
- Weather query indicators (explicit, contextual, follow-up patterns)
- Preference update indicators (city, units, name patterns)
- Disambiguation rules for ambiguous inputs
- Multi-preference handling logic
- Tricky cases section
- NEVER ASSUME rules
- Ambiguous location handling (Springfield, Portland, London, etc.)
- Informal language understanding

### Test Results

```
22 tests passing:
- AC #1: Intent categories (2 tests)
- AC #1: Weather query indicators (2 tests)
- AC #1: Preference update indicators (3 tests)
- AC #1: Disambiguation rules (3 tests)
- AC #1: Multi-preference handling (2 tests)
- AC #1: Tricky cases (2 tests)
- AC #1: Never assume rules (2 tests)
- AC #1: Ambiguous location handling (2 tests)
- AC #1: Informal language understanding (2 tests)
- AC #2: Maintainability (1 test)
- AC #5: Template independence (1 test)
```

### Build Verification

- `npm run build` passes with no errors
- All 22 template tests pass
- No TypeScript type errors

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | All intent categories, indicators, disambiguation rules, multi-preference handling, tricky cases, and never-assume rules present |
| #2 | PASS | Clear section headers (### markers), 5+ major sections verified |
| #3 | PASS | All rules and examples preserved from original instructions |
| #4 | N/A | Template is static (no agentName substitution needed) |
| #5 | PASS | Renders independently without config variables |
