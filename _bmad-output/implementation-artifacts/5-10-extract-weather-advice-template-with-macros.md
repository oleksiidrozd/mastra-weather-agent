# Story 5.10: Extract Weather Advice Template with Macros

Status: review

## Story

As a **developer**,
I want **weather advice rules in a template with reusable macros**,
So that **temperature-based advice is DRY and unit-aware**.

## Acceptance Criteria

1. **Given** the current instructions contain CONTEXTUAL WEATHER ADVICE section
   **When** I create `weatherAdvice.njk`
   **Then** it defines a `tempAdvice` macro that accepts:
   - label (e.g., "Freezing")
   - rangeC (Celsius range string)
   - rangeF (Fahrenheit range string)
   - advice (array of advice strings)

2. **Given** the macro accepts unit configuration
   **When** rendered with `{{ defaultUnit }}`
   **Then** the macro displays the appropriate range based on the configured unit

3. **Given** all temperature ranges use the macro
   **When** I review the template
   **Then** ranges include: Freezing, Cold, Cool, Pleasant, Warm, Hot

4. **Given** weather advice includes precipitation
   **When** I review the template
   **Then** rain, thunderstorm, and snow advice are included

5. **Given** special conditions exist
   **When** I review the template
   **Then** sunny, windy, humid, and fog conditions are covered

6. **Given** conditions can combine
   **When** I review the template
   **Then** rules for combining conditions are included

## Tasks / Subtasks

- [x] Task 1: Read current advice section from weatherAgent.ts (AC: #1, #3)
  - [x] Identify CONTEXTUAL WEATHER ADVICE section
  - [x] Document all temperature ranges with C and F values
  - [x] Document all precipitation advice
  - [x] Document special conditions

- [x] Task 2: Create tempAdvice macro (AC: #1, #2)
  - [x] Create file at `src/mastra/agents/templates/weatherAdvice.njk`
  - [x] Define macro with label, rangeC, rangeF, advice parameters
  - [x] Use `{% if defaultUnit == 'fahrenheit' %}` for unit switching

- [x] Task 3: Apply macro to temperature ranges (AC: #3)
  - [x] Freezing range (< 0°C / < 32°F)
  - [x] Cold range (0-10°C / 32-50°F)
  - [x] Cool range (10-18°C / 50-64°F)
  - [x] Pleasant range (18-25°C / 64-77°F)
  - [x] Warm range (25-30°C / 77-86°F)
  - [x] Hot range (> 30°C / > 86°F)

- [x] Task 4: Add precipitation advice (AC: #4)
  - [x] Rain advice
  - [x] Thunderstorm advice
  - [x] Snow advice

- [x] Task 5: Add special conditions (AC: #5)
  - [x] Sunny/UV advice
  - [x] Windy conditions
  - [x] Humid conditions
  - [x] Fog/visibility

- [x] Task 6: Add combining rules (AC: #6)
  - [x] How to combine multiple conditions
  - [x] Priority rules for advice

- [x] Task 7: Test template (AC: #2)
  - [x] Render with celsius - verify ranges
  - [x] Render with fahrenheit - verify ranges change

## Dev Notes

### Macro Definition

```nunjucks
{# Define a reusable macro for temperature-based advice #}
{% macro tempAdvice(label, rangeC, rangeF, advice) %}
### {{ label }}
{% if defaultUnit == 'fahrenheit' %}
**Range:** {{ rangeF }}
{% else %}
**Range:** {{ rangeC }}
{% endif %}

**Advice:**
{% for item in advice %}
- {{ item }}
{% endfor %}
{% endmacro %}
```

### weatherAdvice.njk Template

```nunjucks
{# src/mastra/agents/templates/weatherAdvice.njk #}
{# Contextual weather advice based on conditions #}

## CONTEXTUAL WEATHER ADVICE

Provide helpful, actionable advice based on current weather conditions.

{# Macro for temperature-based advice with unit awareness #}
{% macro tempAdvice(label, rangeC, rangeF, advice) %}
### {{ label }}
{% if defaultUnit == 'fahrenheit' %}
**Range:** {{ rangeF }}
{% else %}
**Range:** {{ rangeC }}
{% endif %}

**Advice:**
{% for item in advice %}
- {{ item }}
{% endfor %}
{% endmacro %}

## Temperature-Based Advice

{{ tempAdvice(
  'Freezing',
  'Below 0°C',
  'Below 32°F',
  [
    'Bundle up with heavy winter clothing',
    'Watch out for ice on roads and sidewalks',
    'Limit time outdoors if possible',
    'Keep extremities covered (hands, ears, nose)'
  ]
) }}

{{ tempAdvice(
  'Cold',
  '0°C to 10°C',
  '32°F to 50°F',
  [
    'Wear a warm coat or heavy jacket',
    'Layer your clothing',
    'Consider a hat and gloves',
    'Good weather for hot beverages!'
  ]
) }}

{{ tempAdvice(
  'Cool',
  '10°C to 15°C',
  '50°F to 59°F',
  [
    'A light jacket or sweater is recommended',
    'Perfect for outdoor activities',
    'Layers are your friend',
    'Comfortable for most people'
  ]
) }}

{{ tempAdvice(
  'Pleasant',
  '15°C to 25°C',
  '59°F to 77°F',
  [
    'Ideal conditions for being outdoors',
    'Light clothing is fine',
    'Great weather for walking or cycling',
    'No special preparations needed'
  ]
) }}

{{ tempAdvice(
  'Warm',
  '25°C to 30°C',
  '77°F to 86°F',
  [
    'Light, breathable clothing recommended',
    'Stay hydrated',
    'Seek shade during peak sun hours',
    'Sunscreen is a good idea'
  ]
) }}

{{ tempAdvice(
  'Hot',
  'Above 30°C',
  'Above 86°F',
  [
    'Stay hydrated - drink plenty of water',
    'Avoid prolonged outdoor activities',
    'Wear sunscreen and a hat',
    'Seek air-conditioned spaces',
    'Watch for signs of heat exhaustion'
  ]
) }}

## Precipitation Advice

### Rain
- Light rain: "A light jacket or umbrella would be handy"
- Moderate rain: "Definitely bring an umbrella!"
- Heavy rain: "Stay dry - waterproof gear recommended"
- Drizzle: "A hood or cap should suffice"

### Thunderstorms
- "Stay indoors if possible"
- "Avoid open areas and tall objects"
- "Wait 30 minutes after last thunder before going outside"
- "Unplug sensitive electronics"

### Snow
- Light snow: "Beautiful! Dress warmly and enjoy"
- Heavy snow: "Travel may be affected - plan accordingly"
- Blizzard conditions: "Stay indoors unless necessary"
- "Watch for slippery conditions"

## Special Conditions

### Sunny/Clear
- "Great day to be outside!"
- If UV is high: "Don't forget sunscreen (SPF 30+)"
- "Sunglasses recommended"
- "Perfect for outdoor activities"

### Windy
- Light breeze (< 20 km/h): No special advice
- Moderate wind (20-40 km/h): "It's breezy - secure loose items"
- Strong wind (> 40 km/h): "Hold onto your hat! Strong winds today"
- Gusts: "Watch out for sudden gusts"

### Humidity
- High humidity (> 70%): "It'll feel muggy - light, breathable fabrics recommended"
- Low humidity (< 30%): "Dry conditions - stay hydrated and moisturize"
- Combined with heat: "The humidity makes it feel hotter than it is"

### Fog/Mist
- "Visibility may be reduced"
- "Drive carefully if traveling"
- "Allow extra time for commuting"
- "Conditions usually improve as the day warms up"

## Combining Conditions

When multiple conditions apply, combine advice naturally:

**Priority order:**
1. Safety-related advice first (storms, extreme heat/cold)
2. Precipitation (what to wear/bring)
3. Temperature comfort
4. Optional tips (UV, activities)

**Example combinations:**
- Hot + Sunny: "It's a hot one at 35°C with clear skies. Stay hydrated, wear sunscreen, and seek shade when you can!"
- Cold + Rain: "A chilly 8°C with rain expected. Grab a warm, waterproof jacket!"
- Pleasant + Windy: "Lovely 20°C but quite breezy. Perfect for flying a kite!"

**Keep it natural:**
- Don't list every piece of advice
- Pick the 2-3 most relevant tips
- Make it conversational, not a checklist
```

### Variables Used

| Variable | Usage | Purpose |
|----------|-------|---------|
| defaultUnit | In tempAdvice macro | Show appropriate temperature range |

### Macro Usage Pattern

The `tempAdvice` macro is called with:
1. `label` - Category name (Freezing, Cold, etc.)
2. `rangeC` - Celsius range string
3. `rangeF` - Fahrenheit range string
4. `advice` - Array of advice strings

This DRY approach means:
- Easy to add new temperature ranges
- Unit switching happens automatically
- Consistent formatting across all ranges

### Testing the Macro

```typescript
describe('weatherAdvice.njk', () => {
  it('should show Celsius ranges when defaultUnit is celsius', () => {
    const result = env.render('weatherAdvice.njk', {
      ...defaultConfig,
      defaultUnit: 'celsius'
    })
    expect(result).toContain('Below 0°C')
    expect(result).toContain('15°C to 25°C')
    expect(result).not.toContain('Below 32°F')
  })

  it('should show Fahrenheit ranges when defaultUnit is fahrenheit', () => {
    const result = env.render('weatherAdvice.njk', {
      ...defaultConfig,
      defaultUnit: 'fahrenheit'
    })
    expect(result).toContain('Below 32°F')
    expect(result).toContain('59°F to 77°F')
    expect(result).not.toContain('Below 0°C')
  })

  it('should include all temperature categories', () => {
    const result = env.render('weatherAdvice.njk', defaultConfig)
    expect(result).toContain('Freezing')
    expect(result).toContain('Cold')
    expect(result).toContain('Cool')
    expect(result).toContain('Pleasant')
    expect(result).toContain('Warm')
    expect(result).toContain('Hot')
  })

  it('should include precipitation advice', () => {
    const result = env.render('weatherAdvice.njk', defaultConfig)
    expect(result).toContain('Rain')
    expect(result).toContain('Thunderstorms')
    expect(result).toContain('Snow')
  })

  it('should include special conditions', () => {
    const result = env.render('weatherAdvice.njk', defaultConfig)
    expect(result).toContain('Sunny')
    expect(result).toContain('Windy')
    expect(result).toContain('Humidity')
    expect(result).toContain('Fog')
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
├── weatherHandling.njk
├── weatherAdvice.njk          ← THIS STORY
└── main.njk
```

### Why Use Macros?

1. **DRY** - Don't repeat temperature range patterns
2. **Unit-aware** - Automatic Celsius/Fahrenheit switching
3. **Maintainable** - Add new ranges by calling the macro
4. **Testable** - Can verify macro output for different units

## References

- [Source: _bmad-output/epics.md#Story 5.10]
- [Source: _bmad-output/prd.md#FR9 - Contextual Advice]
- [Source: Nunjucks macros documentation]
- [Source: src/mastra/agents/weatherAgent.ts - CONTEXTUAL WEATHER ADVICE section]

---

## Dev Agent Record

### Implementation Summary

Created `weatherAdvice.njk` template with a reusable `tempAdvice` macro for unit-aware temperature advice. The macro switches between Celsius and Fahrenheit ranges based on `{{ defaultUnit }}`.

### Files Created

| File | Purpose |
|------|---------|
| `src/mastra/agents/templates/weatherAdvice.njk` | Weather advice template with macro |
| `tests/mastra/agents/templates/weatherAdvice.test.ts` | Unit tests (23 tests) |

### Template Content

The template includes 5 major sections:
- CONTEXTUAL WEATHER ADVICE (header + guidance)
- TEMPERATURE ADVICE (6 ranges via tempAdvice macro)
- PRECIPITATION ADVICE (Rain, Thunderstorm, Snow)
- SPECIAL CONDITIONS (Sunny, Windy, Humidity, Fog)
- COMBINING CONDITIONS (common combinations, priority rules, placement)

### Macro Implementation

```nunjucks
{% macro tempAdvice(label, rangeC, rangeF, advice) %}
### {{ label }}
{% if defaultUnit == 'fahrenheit' %}
**Range:** {{ rangeF }}
{% else %}
**Range:** {{ rangeC }}
{% endif %}

**Advice:**
{% for item in advice %}
- {{ item }}
{% endfor %}
{% endmacro %}
```

### Test Results

```
23 tests passing:
- AC #1, #2: tempAdvice macro with unit switching (4 tests)
- AC #3: Temperature ranges (2 tests)
- AC #4: Precipitation advice (4 tests)
- AC #5: Special conditions (5 tests)
- AC #6: Combining conditions (4 tests)
- Template structure (2 tests)
- Template independence (2 tests)
```

### Build Verification

- `npm run build` passes with no errors
- All 23 template tests pass
- No TypeScript type errors

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | tempAdvice macro defined with label, rangeC, rangeF, advice parameters |
| #2 | PASS | Unit switching works (Celsius shows for celsius, Fahrenheit for fahrenheit) |
| #3 | PASS | All 6 temperature ranges present: Freezing, Cold, Cool, Pleasant, Warm, Hot |
| #4 | PASS | Rain, Thunderstorm, Snow advice sections included |
| #5 | PASS | Sunny, Windy, Humidity, Fog conditions covered |
| #6 | PASS | Combining conditions with priority rules and placement guidance |
