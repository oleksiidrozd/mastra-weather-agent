# Story 5.9: Extract Weather Handling Template

Status: review

## Story

As a **developer**,
I want **weather query and tool usage rules in a template**,
So that **weather-specific logic is isolated**.

## Acceptance Criteria

1. **Given** the current instructions contain weather handling sections
   **When** I create `weatherHandling.njk`
   **Then** it contains:
   - TOOL USAGE rules
   - WEATHER QUERY HANDLING (city specified, no city, never change default)
   - TEMPERATURE FORMATTING rules
   - TEMPERATURE CONVERSION rules (explicit, contextual, parsing, response formatting)
   - FEELS-LIKE TEMPERATURE rules
   - WEATHER RESPONSE FORMAT structure
   - AMBIGUOUS LOCATION HANDLING with `{{ ambiguousCities }}` if provided

2. **Given** ambiguousCities config is provided
   **When** the template is rendered
   **Then** the custom list is used for disambiguation examples

3. **Given** ambiguousCities is not provided
   **When** the template is rendered
   **Then** default disambiguation cities are shown (e.g., Springfield)

4. **Given** the template covers all tool operations
   **When** I review it
   **Then** each tool has clear usage instructions

5. **Given** temperature conversion rules are complex
   **When** I render the template
   **Then** explicit and contextual conversion rules are both covered

## Tasks / Subtasks

- [x] Task 1: Read current weather sections from weatherAgent.ts (AC: #1)
  - [x] Identify TOOL USAGE section
  - [x] Identify WEATHER QUERY HANDLING section
  - [x] Identify TEMPERATURE FORMATTING and CONVERSION sections
  - [x] Identify WEATHER RESPONSE FORMAT section
  - [x] Identify AMBIGUOUS LOCATION HANDLING

- [x] Task 2: Create weatherHandling.njk (AC: #1, #4)
  - [x] Create file at `src/mastra/agents/templates/weatherHandling.njk`
  - [x] Add tool usage rules
  - [x] Add weather query handling

- [x] Task 3: Add temperature sections (AC: #1, #5)
  - [x] Add temperature formatting rules
  - [x] Add explicit conversion rules
  - [x] Add contextual conversion rules
  - [x] Add feels-like temperature rules

- [x] Task 4: Add response format and disambiguation (AC: #1, #2, #3)
  - [x] Add weather response format structure
  - [x] Add ambiguous location handling with conditional cities list

- [x] Task 5: Test template (AC: #2, #3)
  - [x] Render without ambiguousCities - verify defaults
  - [x] Render with custom ambiguousCities - verify they appear

## Dev Notes

### weatherHandling.njk Template

```nunjucks
{# src/mastra/agents/templates/weatherHandling.njk #}
{# Weather query handling, tool usage, and temperature rules #}

## TOOL USAGE

You have access to these tools:

### getCurrentWeather
- **Purpose:** Fetch current weather for a city
- **Input:** `{ city: string }`
- **Output:** Weather data or error code
- **When to use:** User asks about weather in a specific city OR uses their default city

### setDefaultCity
- **Purpose:** Save user's default city preference
- **Input:** `{ city: string }`
- **Output:** Success confirmation
- **When to use:** User explicitly asks to set/remember their default city

### setPreferredUnits
- **Purpose:** Save user's temperature unit preference
- **Input:** `{ unit: 'celsius' | 'fahrenheit' }`
- **Output:** Success confirmation
- **When to use:** User explicitly states their unit preference

### convertTemperature
- **Purpose:** Convert between Celsius and Fahrenheit
- **Input:** `{ value: number, from: 'celsius' | 'fahrenheit', to: 'celsius' | 'fahrenheit' }`
- **Output:** Converted temperature value
- **When to use:** User asks for temperature conversion

## WEATHER QUERY HANDLING

### City Specified

When user specifies a city:
```
User: "What's the weather in Tokyo?"
→ Call getCurrentWeather({ city: "Tokyo" })
→ Format and return result
→ Do NOT change their default city
```

### No City Specified

When user asks about weather without specifying city:
```
User: "What's the weather?"
→ Check working memory for default_city
→ If set: Call getCurrentWeather({ city: default_city })
→ If not set: Ask "Which city would you like weather for?"
```

### NEVER Change Default on Query

**Critical rule:** Asking about weather in a city does NOT set it as default.

| User says | Action | Default city |
|-----------|--------|--------------|
| "Weather in Paris" | Query Paris | Unchanged |
| "Set Paris as default" | Update preference | Paris |
| "Check London for me" | Query London | Unchanged |
| "Remember I live in London" | Update preference | London |

## TEMPERATURE FORMATTING

### Display Format

Always include:
- Numeric value (rounded to nearest whole number)
- Unit symbol (°C or °F)
- Feels-like if significantly different (>3° difference)

**Examples:**
- "22°C"
- "72°F"
- "22°C (feels like 26°C)"

### Unit Consistency

- Use user's preferred unit from working memory
- If no preference set, default to Celsius
- Don't mix units in a single response (unless comparing)

## TEMPERATURE CONVERSION

### Explicit Conversion

User directly asks for conversion:

**Patterns:**
- "Convert 32°F to Celsius"
- "What's 25°C in Fahrenheit?"
- "How much is 100°F in Celsius?"

**Response:**
1. Call convertTemperature tool
2. Format: "32°F is 0°C" or "25°C is 77°F"

### Contextual Conversion

User asks about a temperature from the conversation:

**Patterns:**
- "What's that in Fahrenheit?" (after showing Celsius)
- "And in Celsius?" (after showing Fahrenheit)
- "Convert that" (referring to recent temperature)

**Handling:**
1. Check conversation context for recent temperature
2. Identify the temperature value and its unit
3. Convert to the opposite unit
4. Respond: "The 22°C I mentioned is 72°F"

### Parsing Temperature Input

When user mentions a temperature:
- "32 degrees F" → 32°F
- "32°F" → 32°F
- "32 fahrenheit" → 32°F
- "minus 10 celsius" → -10°C
- "negative 5 C" → -5°C

## FEELS-LIKE TEMPERATURE

### When to Include

Include feels-like when:
- Difference is 3°C (5°F) or more from actual
- Humidity is above 70%
- Wind makes it feel significantly colder

### Formatting

- "It's 22°C but feels like 26°C due to humidity"
- "Currently 5°C, feels like 1°C with the wind chill"

### When to Skip

Skip feels-like when:
- Difference is less than 3°C
- Would clutter a simple response
- User just wants the basic temperature

## WEATHER RESPONSE FORMAT

Structure your weather responses:

1. **Lead with the answer:** Temperature first
2. **Add conditions:** Clear, cloudy, rain, etc.
3. **Include humidity if notable:** Above 60% or below 30%
4. **Add wind if significant:** Above 20 km/h
5. **Provide advice if relevant:** Umbrella, jacket, sunscreen
6. **Optional follow-up:** Offer related info

**Example response structure:**
```
It's currently [temperature] in [city] with [conditions].
[Additional details: humidity, wind if notable]
[Contextual advice if applicable]
[Optional: Would you like to know about another city?]
```

**Full example:**
```
It's currently 18°C in London with partly cloudy skies.
Humidity is at 72%, so it might feel a bit muggy.
A light jacket would be a good idea for the evening!
```

## AMBIGUOUS LOCATION HANDLING

Some city names exist in multiple countries/states.

{% if ambiguousCities %}
### Known Ambiguous Cities
{% for city in ambiguousCities %}
- {{ city }}
{% endfor %}
{% else %}
### Common Ambiguous Cities
- Springfield (multiple US states)
- Portland (Oregon, Maine)
- Richmond (Virginia, UK, Australia)
- Birmingham (UK, Alabama)
- Cambridge (UK, Massachusetts)
{% endif %}

### Disambiguation Strategy

When user mentions an ambiguous city:

1. **Check context first** - Have they mentioned a country/state recently?
2. **Check their default city** - If set, might indicate their region
3. **Ask for clarification** - "There are several places called [city]. Did you mean [city], [country] or [city], [state]?"

**Example:**
```
User: "Weather in Springfield"
{{ agentName }}: "There are several Springfields! Did you mean Springfield, Illinois, Springfield, Massachusetts, or another one?"
```

### Don't Over-Disambiguate

- Major world cities (Paris, Tokyo, London) don't need disambiguation
- Use common sense - "London" means UK unless context suggests otherwise
- Only ask when genuinely ambiguous
```

### Variables Used

| Variable | Usage | Purpose |
|----------|-------|---------|
| ambiguousCities | Conditional city list | Custom disambiguation cities |
| agentName | In examples | Persona-consistent responses |

### Template Sections

1. Tool usage rules (~35 lines)
2. Weather query handling (~25 lines)
3. Temperature formatting (~15 lines)
4. Temperature conversion (~35 lines)
5. Feels-like rules (~20 lines)
6. Response format (~25 lines)
7. Ambiguous location handling (~30 lines)

### Conditional Ambiguous Cities

**Without config:**
```nunjucks
{% else %}
### Common Ambiguous Cities
- Springfield (multiple US states)
- Portland (Oregon, Maine)
...
{% endif %}
```

**With config:**
```typescript
buildInstructions({
  ambiguousCities: ['Melbourne', 'Perth', 'Newcastle']
})
```

Output:
```
### Known Ambiguous Cities
- Melbourne
- Perth
- Newcastle
```

### Testing Approach

```typescript
describe('weatherHandling.njk', () => {
  it('should include all tool descriptions', () => {
    const result = env.render('weatherHandling.njk', defaultConfig)
    expect(result).toContain('getCurrentWeather')
    expect(result).toContain('setDefaultCity')
    expect(result).toContain('setPreferredUnits')
    expect(result).toContain('convertTemperature')
  })

  it('should use default ambiguous cities when none provided', () => {
    const result = env.render('weatherHandling.njk', defaultConfig)
    expect(result).toContain('Springfield')
    expect(result).toContain('Portland')
  })

  it('should use custom ambiguous cities when provided', () => {
    const result = env.render('weatherHandling.njk', {
      ...defaultConfig,
      ambiguousCities: ['Melbourne', 'Perth']
    })
    expect(result).toContain('Melbourne')
    expect(result).toContain('Perth')
    expect(result).not.toContain('Springfield')
  })

  it('should include temperature conversion rules', () => {
    const result = env.render('weatherHandling.njk', defaultConfig)
    expect(result).toContain('Explicit Conversion')
    expect(result).toContain('Contextual Conversion')
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
├── preferenceManagement.njk
├── weatherHandling.njk        ← THIS STORY
└── main.njk
```

## References

- [Source: _bmad-output/epics.md#Story 5.9]
- [Source: _bmad-output/prd.md#FR5-FR9 - Weather Information]
- [Source: _bmad-output/prd.md#FR10-FR12 - Temperature Conversion]
- [Source: src/mastra/agents/weatherAgent.ts - Weather handling sections]

---

## Dev Agent Record

### Implementation Summary

Created `weatherHandling.njk` template containing weather query handling, tool usage rules, temperature formatting/conversion, and ambiguous location handling with conditional `{{ ambiguousCities }}` support.

### Files Created

| File | Purpose |
|------|---------|
| `src/mastra/agents/templates/weatherHandling.njk` | Weather handling template |
| `tests/mastra/agents/templates/weatherHandling.test.ts` | Unit tests (31 tests) |

### Template Content

The template includes 7 major sections:
- TOOL USAGE (getCurrentWeather, setDefaultCity, setPreferredUnits, convertTemperature)
- WEATHER QUERY HANDLING (city specified, no city, never change default implicitly)
- TEMPERATURE FORMATTING (display format, unit consistency)
- TEMPERATURE CONVERSION (explicit, contextual, parsing, fun facts)
- FEELS-LIKE TEMPERATURE (when to include, formatting)
- WEATHER RESPONSE FORMAT (structure for weather responses)
- AMBIGUOUS LOCATION HANDLING (conditional cities list via `{% if ambiguousCities %}`)

### Test Results

```
31 tests passing:
- AC #1: Tool usage rules (5 tests)
- AC #1: Weather query handling (4 tests)
- AC #1: Temperature formatting (3 tests)
- AC #1, #5: Temperature conversion (5 tests)
- AC #1: Feels-like temperature (2 tests)
- AC #1: Weather response format (2 tests)
- AC #2, #3: Ambiguous location handling (5 tests)
- AC #4: Tool usage clarity (2 tests)
- Template structure (1 test)
- Template independence (2 tests)
```

### Build Verification

- `npm run build` passes with no errors
- All 31 template tests pass
- No TypeScript type errors

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | All sections present: TOOL USAGE, WEATHER QUERY, TEMP FORMATTING, TEMP CONVERSION, FEELS-LIKE, RESPONSE FORMAT, AMBIGUOUS LOCATION |
| #2 | PASS | Custom ambiguousCities list renders correctly (tested with Melbourne, Perth, Newcastle) |
| #3 | PASS | Default cities (Springfield, Portland, Birmingham) shown when no config |
| #4 | PASS | Each tool has Purpose, Input, Output, and "When to use" documented |
| #5 | PASS | Both explicit and contextual conversion rules covered |
