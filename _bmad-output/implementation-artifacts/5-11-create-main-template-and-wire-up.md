# Story 5.11: Create Main Template and Wire Up

Status: review

## Story

As a **developer**,
I want **a main template that includes all section templates**,
So that **the complete instructions are composed from modular parts**.

## Acceptance Criteria

1. **Given** all section templates exist
   **When** I create `main.njk`
   **Then** it:
   - Opens with the agent introduction using `{{ agentName }}`
   - Includes all section templates in logical order via `{% include %}`
   - Order: identity → capabilities → responseFormatting → errorHandling → conversationContext → intentClassification → preferenceManagement → weatherHandling → weatherAdvice

2. **Given** main.njk includes all templates
   **When** `buildInstructions()` renders main.njk
   **Then** the output matches the structure and content of the original instructions string

3. **Given** each template is included separately
   **When** I modify one template
   **Then** only that section changes in the final output

4. **Given** the main template handles the overall structure
   **When** rendered
   **Then** there's proper spacing and separation between sections

5. **Given** variables are passed to main.njk
   **When** included templates use those variables
   **Then** they receive and can use the same config values

## Tasks / Subtasks

- [x] Task 1: Create main.njk structure (AC: #1, #4)
  - [x] Create file at `src/mastra/agents/templates/main.njk`
  - [x] Add opening introduction with `{{ agentName }}`
  - [x] Add include statements in correct order

- [x] Task 2: Verify include order (AC: #1)
  - [x] identity.njk
  - [x] capabilities.njk
  - [x] responseFormatting.njk
  - [x] errorHandling.njk
  - [x] conversationContext.njk
  - [x] intentClassification.njk
  - [x] preferenceManagement.njk
  - [x] weatherHandling.njk
  - [x] weatherAdvice.njk

- [x] Task 3: Test full render (AC: #2, #5)
  - [x] Call buildInstructions() with default config
  - [x] Verify all sections appear in output
  - [x] Verify variable substitution works throughout

- [x] Task 4: Verify modularity (AC: #3)
  - [x] Modify one template, rebuild, verify only that section changed
  - [x] Ensure no coupling between templates

## Dev Notes

### main.njk Template

```nunjucks
{# src/mastra/agents/templates/main.njk #}
{# Master template that composes all instruction sections #}

# {{ agentName }} - Weather Agent Instructions

You are {{ agentName }}, a friendly and knowledgeable weather assistant. These instructions define your behavior, capabilities, and response patterns.

---

{% include "identity.njk" %}

---

{% include "capabilities.njk" %}

---

{% include "responseFormatting.njk" %}

---

{% include "errorHandling.njk" %}

---

{% include "conversationContext.njk" %}

---

{% include "intentClassification.njk" %}

---

{% include "preferenceManagement.njk" %}

---

{% include "weatherHandling.njk" %}

---

{% include "weatherAdvice.njk" %}

---

# End of Instructions

Remember: You are {{ agentName }}. Stay in character, be helpful, and focus on weather information!
```

### Template Include Order

The order is intentional and follows a logical progression:

| Order | Template | Why This Order |
|-------|----------|----------------|
| 1 | identity.njk | Establishes who the agent is |
| 2 | capabilities.njk | What the agent can do |
| 3 | responseFormatting.njk | How to format responses |
| 4 | errorHandling.njk | How to handle errors |
| 5 | conversationContext.njk | Context awareness rules |
| 6 | intentClassification.njk | How to classify user intent |
| 7 | preferenceManagement.njk | How to handle preferences |
| 8 | weatherHandling.njk | Core weather functionality |
| 9 | weatherAdvice.njk | Advice to provide |

This mirrors a logical reading flow: Who am I? → What can I do? → How do I respond? → How do I handle errors? → etc.

### Variable Inheritance

When main.njk is rendered with config:
```typescript
env.render('main.njk', {
  agentName: 'Sunny',
  defaultUnit: 'celsius',
  // ... etc
})
```

All included templates receive the same variables. No need to pass them explicitly.

### Section Separators

The `---` markdown horizontal rules between sections:
- Improve readability in the raw instructions
- Help LLMs recognize distinct sections
- Can be removed if not needed

### Testing the Full Build

```typescript
import { buildInstructions, defaultConfig } from './templates/index.js'

describe('main.njk integration', () => {
  it('should render complete instructions', () => {
    const result = buildInstructions()

    // Check it's not empty
    expect(result.length).toBeGreaterThan(1000)

    // Check opening
    expect(result).toContain('# Sunny - Weather Agent Instructions')

    // Check all sections are included
    expect(result).toContain('## IDENTITY')
    expect(result).toContain('## CAPABILITIES')
    expect(result).toContain('## RESPONSE FORMATTING')
    expect(result).toContain('## ERROR HANDLING')
    expect(result).toContain('## CONVERSATION CONTEXT')
    expect(result).toContain('## INTENT CLASSIFICATION')
    expect(result).toContain('## PREFERENCE MANAGEMENT')
    expect(result).toContain('## TOOL USAGE')
    expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')

    // Check closing
    expect(result).toContain('# End of Instructions')
  })

  it('should substitute agentName throughout', () => {
    const result = buildInstructions({ agentName: 'CloudBot' })

    // Should appear in title
    expect(result).toContain('# CloudBot - Weather Agent Instructions')

    // Should appear in closing
    expect(result).toContain('You are CloudBot')

    // Should not contain default
    expect(result).not.toContain('Sunny')
  })

  it('should use configured defaultUnit', () => {
    const celsiusResult = buildInstructions({ defaultUnit: 'celsius' })
    const fahrenheitResult = buildInstructions({ defaultUnit: 'fahrenheit' })

    expect(celsiusResult).toContain('Below 0°C')
    expect(fahrenheitResult).toContain('Below 32°F')
  })
})
```

### Debugging Includes

If a template fails to include:

```typescript
// Nunjucks will throw TemplateNotFound
// Error: template not found: identity.njk

// Check:
// 1. File exists in templates directory
// 2. FileSystemLoader path is correct
// 3. File extension matches exactly
```

### File Location

```
src/mastra/agents/templates/
├── index.ts              ← buildInstructions() defined here
├── types.ts
├── main.njk              ← THIS STORY
├── identity.njk
├── capabilities.njk
├── responseFormatting.njk
├── errorHandling.njk
├── conversationContext.njk
├── intentClassification.njk
├── preferenceManagement.njk
├── weatherHandling.njk
└── weatherAdvice.njk
```

### Expected Output Size

The original instructions string is ~600 lines. The composed output should be similar:
- ~10 templates × ~60 lines average = ~600 lines
- Plus main.njk wrapper ~20 lines
- Total: ~600-650 lines

### Comparison with Original

After this story, you should be able to:

```typescript
// New approach
const newInstructions = buildInstructions()

// Old approach (for comparison during testing)
const oldInstructions = originalInstructionsString

// Compare structure (not exact match due to formatting)
// Both should have same sections in same order
```

## References

- [Source: _bmad-output/epics.md#Story 5.11]
- [Source: Nunjucks include documentation]
- [Source: Stories 5.4-5.10 - Individual template definitions]

---

## Dev Agent Record

### Implementation Summary

Updated `main.njk` from placeholder to full composition template that includes all 9 section templates via `{% include %}` statements. The template opens with a persona introduction using `{{ agentName }}` and includes all sections in the specified logical order.

### Files Modified

| File | Purpose |
|------|---------|
| `src/mastra/agents/templates/main.njk` | Updated from placeholder to full composition template |
| `tests/mastra/agents/templates/main.test.ts` | Created 15 integration tests |

### Template Structure

```nunjucks
{# Main template - composes all instruction sections #}

You are {{ agentName }}, a friendly and enthusiastic weather assistant!

{% include "identity.njk" %}
{% include "capabilities.njk" %}
{% include "responseFormatting.njk" %}
{% include "errorHandling.njk" %}
{% include "conversationContext.njk" %}
{% include "intentClassification.njk" %}
{% include "preferenceManagement.njk" %}
{% include "weatherHandling.njk" %}
{% include "weatherAdvice.njk" %}
```

### Test Results

```
15 tests passing:
- AC #1: Template structure and includes (3 tests)
- AC #2: Content completeness (2 tests)
- AC #3: Template modularity (2 tests)
- AC #4: Section separation (1 test)
- AC #5: Variable inheritance (3 tests)
- Custom config options (2 tests)
- Default config rendering (2 tests)
```

### Build Verification

- `npm run build` passes with no errors
- All 15 integration tests pass
- No TypeScript type errors

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | main.njk includes all 9 templates in correct order with opening intro |
| #2 | PASS | buildInstructions() output contains all sections (>5000 chars) |
| #3 | PASS | Templates are included separately, each can be modified independently |
| #4 | PASS | Proper spacing between sections, 9+ major section headers present |
| #5 | PASS | Variables (agentName, defaultUnit) are substituted throughout all included templates |
