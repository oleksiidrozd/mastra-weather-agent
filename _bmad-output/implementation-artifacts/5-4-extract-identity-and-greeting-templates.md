# Story 5.4: Extract Identity and Greeting Templates

Status: review

## Story

As a **developer**,
I want **identity and greeting sections extracted to templates**,
So that **agent personality is configurable**.

## Acceptance Criteria

1. **Given** the current instructions contain IDENTITY section
   **When** I create `identity.njk`
   **Then** it contains:
   - Agent name, role, personality using `{{ agentName }}`, `{{ agentRole }}`, `{{ personality }}`
   - GREETING RESPONSES with conditional custom greetings
   - Default greetings if none provided

2. **Given** identity.njk uses template variables
   **When** rendered with different agentName values
   **Then** the output reflects the configured name throughout

3. **Given** custom greetings are provided in config
   **When** identity.njk is rendered
   **Then** custom greetings are used instead of defaults

4. **Given** no custom greetings are provided
   **When** identity.njk is rendered
   **Then** default greetings are displayed

5. **Given** the template is rendered
   **When** I check the output
   **Then** it matches the structure of the original IDENTITY section

## Tasks / Subtasks

- [x] Task 1: Read current identity section from weatherAgent.ts (AC: #5)
  - [x] Identify IDENTITY section in current instructions
  - [x] Document all variables that need extraction
  - [x] Note greeting patterns

- [x] Task 2: Create identity.njk template (AC: #1, #2)
  - [x] Create file at `src/mastra/agents/templates/identity.njk`
  - [x] Replace hardcoded name with `{{ agentName }}`
  - [x] Replace role with `{{ agentRole }}`
  - [x] Replace personality with `{{ personality }}`

- [x] Task 3: Implement conditional greetings (AC: #3, #4)
  - [x] Add `{% if greetings %}` block for custom greetings
  - [x] Add `{% else %}` block with default greetings
  - [x] Use `{% for greeting in greetings %}` for iteration

- [x] Task 4: Test template rendering (AC: #2, #5)
  - [x] Render with default config - verify output
  - [x] Render with custom agentName - verify substitution
  - [x] Render with custom greetings array - verify they appear

## Dev Notes

### Template Structure

```nunjucks
{# src/mastra/agents/templates/identity.njk #}
{# Agent identity and persona definition #}

## IDENTITY

You are **{{ agentName }}**, a {{ agentRole }}.

**Personality:** {{ personality }}

Your role is to provide accurate weather information in a conversational, helpful manner. You maintain this persona in all interactions.

## GREETING RESPONSES

When users greet you (hello, hi, hey, good morning, etc.), respond warmly:

{% if greetings %}
{# Custom greetings provided #}
{% for greeting in greetings %}
- "{{ greeting }}"
{% endfor %}
{% else %}
{# Default greetings #}
- "Hey there! I'm {{ agentName }}, your {{ agentRole }}. What weather would you like to know about?"
- "Hi! {{ agentName }} here, ready to help with weather info. What city are you curious about?"
- "Hello! I'm {{ agentName }}. Ask me about weather anywhere in the world!"
- "Greetings! {{ agentName }} at your service. Shall I check the weather somewhere for you?"
{% endif %}

Choose a varied greeting each time - don't repeat the same one consecutively.
```

### Variables Used

| Variable | Type | Default | Used For |
|----------|------|---------|----------|
| agentName | string | "Sunny" | Agent's display name |
| agentRole | string | "weather information specialist" | Role description |
| personality | string | "Cheerful, conversational..." | Personality traits |
| greetings | string[] \| undefined | undefined | Custom greeting messages |

### Current Instructions Reference

The current weatherAgent.ts instructions likely contain something like:

```
## IDENTITY

You are **Sunny**, a weather information specialist.

Personality: Cheerful, conversational, weather-obsessed...
```

This needs to be extracted and parameterized.

### Rendering Examples

**Default Config:**
```
## IDENTITY

You are **Sunny**, a weather information specialist.

**Personality:** Cheerful, conversational, weather-obsessed
...
```

**Custom Config:**
```typescript
buildInstructions({
  agentName: 'Stormy',
  agentRole: 'severe weather analyst',
  personality: 'Serious, detail-oriented, safety-focused'
})
```

Output:
```
## IDENTITY

You are **Stormy**, a severe weather analyst.

**Personality:** Serious, detail-oriented, safety-focused
...
```

**With Custom Greetings:**
```typescript
buildInstructions({
  greetings: [
    "Ahoy! Weather report coming right up!",
    "Greetings, weather enthusiast!"
  ]
})
```

### Testing Approach

```typescript
// In tests/mastra/agents/templates/identity.test.ts
import nunjucks from 'nunjucks'
import { defaultConfig } from '../src/mastra/agents/templates/types.js'

describe('identity.njk', () => {
  it('should substitute agentName', () => {
    const result = env.render('identity.njk', {
      ...defaultConfig,
      agentName: 'TestBot'
    })
    expect(result).toContain('**TestBot**')
    expect(result).not.toContain('{{ agentName }}')
  })

  it('should use default greetings when none provided', () => {
    const result = env.render('identity.njk', defaultConfig)
    expect(result).toContain("I'm Sunny")
  })

  it('should use custom greetings when provided', () => {
    const result = env.render('identity.njk', {
      ...defaultConfig,
      greetings: ['Custom greeting 1', 'Custom greeting 2']
    })
    expect(result).toContain('Custom greeting 1')
    expect(result).toContain('Custom greeting 2')
  })
})
```

### File Location

```
src/mastra/agents/templates/
├── index.ts
├── types.ts
├── identity.njk     ← THIS STORY
└── main.njk         ← Will include this
```

### Integration with main.njk (Story 5.11)

```nunjucks
{# main.njk #}
{% include "identity.njk" %}
{% include "capabilities.njk" %}
{# ... etc #}
```

## Dev Agent Record

### Implementation Plan
- Read weatherAgent.ts to identify exact IDENTITY and GREETING sections
- Create identity.njk with parameterized variables
- Implement conditional greetings using Nunjucks if/else/for
- Add comprehensive unit tests

### Debug Log
- Read weatherAgent.ts - found IDENTITY section at lines 10-13, GREETING at 15-18 ✓
- Variables to extract: agentName, agentRole, personality, greetings ✓
- Created identity.njk with {{ agentName }}, {{ agentRole }}, {{ personality }} ✓
- Implemented {% if greetings %} conditional block ✓
- Default greetings match original from weatherAgent.ts ✓
- Build passes ✓
- 10 unit tests pass ✓

### Completion Notes
All tasks completed. identity.njk template extracts the IDENTITY and GREETING RESPONSES sections from the original instructions. Uses Nunjucks variables for agentName, agentRole, personality, and conditional rendering for custom vs default greetings. Template structure matches the original while being fully configurable.

## File List

- src/mastra/agents/templates/identity.njk (new - identity template)
- tests/mastra/agents/templates/identity.test.ts (new - 10 unit tests)

## Change Log

- 2025-12-30: Created identity.njk with parameterized identity section
- 2025-12-30: Implemented conditional greetings with if/else/for
- 2025-12-30: Added unit tests (10 tests, all pass)

## References

- [Source: _bmad-output/epics.md#Story 5.4]
- [Source: src/mastra/agents/weatherAgent.ts - IDENTITY section]
- [Source: Nunjucks templating - conditionals and loops]
