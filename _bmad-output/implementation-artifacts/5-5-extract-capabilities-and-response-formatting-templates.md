# Story 5.5: Extract Capabilities and Response Formatting Templates

Status: review

## Story

As a **developer**,
I want **capabilities and formatting sections in separate templates**,
So that **each section can be maintained independently**.

## Acceptance Criteria

1. **Given** the current instructions contain CAPABILITIES section
   **When** I create `capabilities.njk`
   **Then** it lists all agent capabilities (weather info, preferences, conversion, advice)

2. **Given** the current instructions contain RESPONSE FORMATTING section
   **When** I create `responseFormatting.njk`
   **Then** it contains:
   - Temperature display rules with unit awareness
   - Weather conditions descriptive language
   - Contextual advice formatting guidelines

3. **Given** capabilities.njk is rendered
   **When** I check the output
   **Then** it matches the structure of the original CAPABILITIES section

4. **Given** responseFormatting.njk uses `{{ defaultUnit }}`
   **When** rendered with 'celsius' vs 'fahrenheit'
   **Then** the unit-specific examples adjust accordingly

5. **Given** the templates are independent
   **When** I modify one template
   **Then** the other template is unaffected

## Tasks / Subtasks

- [x] Task 1: Read current sections from weatherAgent.ts (AC: #1, #2)
  - [x] Identify CAPABILITIES section content
  - [x] Identify RESPONSE FORMATTING section content
  - [x] Document any variables needed

- [x] Task 2: Create capabilities.njk (AC: #1, #3)
  - [x] Create file at `src/mastra/agents/templates/capabilities.njk`
  - [x] List all agent capabilities in bullet points
  - [x] Keep it static (no variables needed currently)

- [x] Task 3: Create responseFormatting.njk (AC: #2, #4)
  - [x] Create file at `src/mastra/agents/templates/responseFormatting.njk`
  - [x] Add temperature display rules
  - [x] Add weather conditions language guidelines
  - [x] Use `{{ defaultUnit }}` for unit-aware examples

- [x] Task 4: Test templates (AC: #3, #4, #5)
  - [x] Render capabilities.njk - verify content
  - [x] Render responseFormatting.njk with celsius - verify
  - [x] Render responseFormatting.njk with fahrenheit - verify

## Dev Notes

### capabilities.njk Template

```nunjucks
{# src/mastra/agents/templates/capabilities.njk #}
{# Agent capabilities listing #}

## CAPABILITIES

You can help users with:

1. **Current Weather Information**
   - Get real-time weather for any city worldwide
   - Display temperature, conditions, humidity, wind
   - Provide contextual weather advice

2. **User Preferences**
   - Set and remember default city
   - Set preferred temperature units (Celsius/Fahrenheit)
   - Remember user's name for personalized interactions

3. **Temperature Conversion**
   - Convert between Celsius and Fahrenheit
   - Use conversation context for implicit conversions
   - Handle explicit conversion requests

4. **Session Management**
   - Start fresh conversation sessions
   - Maintain preferences across sessions

You do NOT have capabilities for:
- Weather forecasts (future predictions)
- Historical weather data
- Severe weather alerts
- Non-weather information
```

### responseFormatting.njk Template

```nunjucks
{# src/mastra/agents/templates/responseFormatting.njk #}
{# Response formatting guidelines #}

## RESPONSE FORMATTING

### Temperature Display

Always display temperature with both value and unit:
{% if defaultUnit == 'fahrenheit' %}
- Primary: Fahrenheit (e.g., "72°F")
- Conversion available on request
{% else %}
- Primary: Celsius (e.g., "22°C")
- Conversion available on request
{% endif %}

Format:
- Use degree symbol: ° (not "degrees")
- Round to nearest whole number
- Include feels-like when significantly different

Example: "It's currently 22°C (feels like 25°C)"

### Weather Conditions

Use descriptive, natural language:

| Condition | Good Phrasing | Avoid |
|-----------|---------------|-------|
| Clear | "clear skies", "sunny" | "clear weather" |
| Clouds | "partly cloudy", "overcast" | "clouds" |
| Rain | "light rain", "heavy rain", "drizzle" | "rain weather" |
| Snow | "light snow", "heavy snowfall" | "snow weather" |
| Storm | "thunderstorms expected" | "stormy" |

### Response Structure

Keep responses:
- Concise but informative
- Conversational tone
- Include relevant advice
- End with follow-up offer when appropriate

Example structure:
1. Direct answer to query
2. Key weather details
3. Contextual advice (if applicable)
4. Optional follow-up prompt
```

### Variables Used

| Variable | Template | Purpose |
|----------|----------|---------|
| defaultUnit | responseFormatting.njk | Unit-specific formatting examples |

### Why Two Separate Templates?

**Separation of concerns:**
- `capabilities.njk` - WHAT the agent can do (rarely changes)
- `responseFormatting.njk` - HOW the agent presents info (may vary by persona)

This allows different personas to share capabilities but have different formatting styles.

### Unit-Aware Formatting Example

**With celsius (default):**
```
- Primary: Celsius (e.g., "22°C")
```

**With fahrenheit:**
```
- Primary: Fahrenheit (e.g., "72°F")
```

### Testing Approach

```typescript
describe('capabilities.njk', () => {
  it('should list all four capability categories', () => {
    const result = env.render('capabilities.njk', defaultConfig)
    expect(result).toContain('Current Weather Information')
    expect(result).toContain('User Preferences')
    expect(result).toContain('Temperature Conversion')
    expect(result).toContain('Session Management')
  })
})

describe('responseFormatting.njk', () => {
  it('should show Celsius as primary when defaultUnit is celsius', () => {
    const result = env.render('responseFormatting.njk', {
      ...defaultConfig,
      defaultUnit: 'celsius'
    })
    expect(result).toContain('Primary: Celsius')
  })

  it('should show Fahrenheit as primary when defaultUnit is fahrenheit', () => {
    const result = env.render('responseFormatting.njk', {
      ...defaultConfig,
      defaultUnit: 'fahrenheit'
    })
    expect(result).toContain('Primary: Fahrenheit')
  })
})
```

### File Location

```
src/mastra/agents/templates/
├── index.ts
├── types.ts
├── identity.njk
├── capabilities.njk         ← THIS STORY
├── responseFormatting.njk   ← THIS STORY
└── main.njk
```

### Integration with main.njk

```nunjucks
{# main.njk #}
{% include "identity.njk" %}
{% include "capabilities.njk" %}
{% include "responseFormatting.njk" %}
{# ... etc #}
```

## Dev Agent Record

### Implementation Plan
- Read weatherAgent.ts for CAPABILITIES (lines 20-24) and RESPONSE FORMATTING (lines 26-43)
- Create capabilities.njk with static capability listing
- Create responseFormatting.njk with defaultUnit variable for unit-aware examples
- Add unit tests for both templates

### Debug Log
- CAPABILITIES section identified at lines 20-24 ✓
- RESPONSE FORMATTING section identified at lines 26-43 ✓
- capabilities.njk created with 4 bullet point capabilities ✓
- responseFormatting.njk created with {{ defaultUnit | capitalize }} filter ✓
- 7 tests pass for capabilities.njk ✓
- 8 tests pass for responseFormatting.njk ✓
- Build passes ✓

### Completion Notes
All tasks completed. Both templates extract their respective sections from the original instructions. capabilities.njk is static (no variables). responseFormatting.njk uses {{ defaultUnit | capitalize }} to show unit-aware text. Templates are independent and can be modified separately.

## File List

- src/mastra/agents/templates/capabilities.njk (new)
- src/mastra/agents/templates/responseFormatting.njk (new)
- tests/mastra/agents/templates/capabilities.test.ts (new - 7 tests)
- tests/mastra/agents/templates/responseFormatting.test.ts (new - 8 tests)

## Change Log

- 2025-12-30: Created capabilities.njk with agent capability listing
- 2025-12-30: Created responseFormatting.njk with unit-aware formatting
- 2025-12-30: Added unit tests (15 tests total, all pass)

## References

- [Source: _bmad-output/epics.md#Story 5.5]
- [Source: src/mastra/agents/weatherAgent.ts - CAPABILITIES and RESPONSE FORMATTING sections]
- [Source: Nunjucks conditionals documentation]
