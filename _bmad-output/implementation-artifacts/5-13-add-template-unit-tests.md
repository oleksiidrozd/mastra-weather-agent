# Story 5.13: Add Template Unit Tests

Status: review

## Story

As a **developer**,
I want **unit tests for the template system**,
So that **template rendering is verified and regressions are caught**.

## Acceptance Criteria

1. **Given** the template system is implemented
   **When** I create `tests/mastra/agents/templates/index.test.ts`
   **Then** it tests:
   - `buildInstructions()` with default config produces valid output
   - `buildInstructions()` with custom agentName substitutes correctly
   - `buildInstructions()` with custom greetings array uses them
   - `buildInstructions()` with defaultUnit='fahrenheit' shows Fahrenheit ranges
   - Output contains all expected section headers
   - No undefined or empty variable substitutions

2. **Given** tests pass
   **When** I run `npm test`
   **Then** all template tests pass
   **And** no regressions in existing tests

3. **Given** tests exist for each variable
   **When** I review test coverage
   **Then** agentName, agentRole, personality, defaultUnit, greetings, ambiguousCities are all tested

4. **Given** tests check for errors
   **When** template variables are missing
   **Then** tests verify appropriate behavior (defaults used or errors thrown)

5. **Given** the test file follows project conventions
   **When** I review it
   **Then** it uses vitest, mirrors src structure, and follows naming conventions

## Tasks / Subtasks

- [x] Task 1: Create test file structure (AC: #1, #5)
  - [x] Create `tests/mastra/agents/templates/` directory
  - [x] Create `index.test.ts` file
  - [x] Set up vitest imports and describe blocks

- [x] Task 2: Test default config rendering (AC: #1)
  - [x] Test that default config produces non-empty output
  - [x] Test that output contains expected sections
  - [x] Test that default agentName appears

- [x] Task 3: Test variable substitution (AC: #1, #3)
  - [x] Test custom agentName substitution
  - [x] Test custom agentRole substitution
  - [x] Test custom personality substitution
  - [x] Test defaultUnit affects temperature ranges

- [x] Task 4: Test optional arrays (AC: #1, #3)
  - [x] Test custom greetings array
  - [x] Test custom ambiguousCities array
  - [x] Test behavior when arrays not provided

- [x] Task 5: Test section presence (AC: #1)
  - [x] Verify all major section headers present
  - [x] Verify no undefined or {{ }} artifacts

- [x] Task 6: Run full test suite (AC: #2)
  - [x] Run `npm test`
  - [x] Verify no regressions
  - [x] Check test coverage

## Dev Notes

### Test File Structure

```
tests/
├── mastra/
│   ├── agents/
│   │   └── templates/
│   │       └── index.test.ts    ← THIS STORY
│   ├── tools/
│   │   └── *.test.ts
│   └── lib/
│       └── *.test.ts
```

### Test Implementation

```typescript
// tests/mastra/agents/templates/index.test.ts
import { describe, it, expect } from 'vitest'
import { buildInstructions, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('buildInstructions', () => {
  describe('default configuration', () => {
    it('should produce non-empty output with defaults', () => {
      const result = buildInstructions()
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(1000)
    })

    it('should use default agentName "Sunny"', () => {
      const result = buildInstructions()
      expect(result).toContain('Sunny')
      expect(result).toContain('You are Sunny')
    })

    it('should use Celsius ranges by default', () => {
      const result = buildInstructions()
      expect(result).toContain('Below 0°C')
      expect(result).toContain('15°C to 25°C')
    })
  })

  describe('agentName substitution', () => {
    it('should substitute custom agentName throughout', () => {
      const result = buildInstructions({ agentName: 'CloudBot' })

      expect(result).toContain('CloudBot')
      expect(result).toContain('You are CloudBot')
      expect(result).not.toContain('Sunny')
    })

    it('should use agentName in greetings', () => {
      const result = buildInstructions({ agentName: 'WeatherWiz' })
      expect(result).toContain("I'm WeatherWiz")
    })
  })

  describe('agentRole substitution', () => {
    it('should substitute custom agentRole', () => {
      const result = buildInstructions({ agentRole: 'storm tracking expert' })
      expect(result).toContain('storm tracking expert')
    })
  })

  describe('personality substitution', () => {
    it('should substitute custom personality', () => {
      const result = buildInstructions({
        personality: 'Serious, analytical, data-driven'
      })
      expect(result).toContain('Serious, analytical, data-driven')
    })
  })

  describe('defaultUnit configuration', () => {
    it('should show Celsius ranges when defaultUnit is celsius', () => {
      const result = buildInstructions({ defaultUnit: 'celsius' })

      expect(result).toContain('Below 0°C')
      expect(result).toContain('0°C to 10°C')
      expect(result).not.toContain('Below 32°F')
    })

    it('should show Fahrenheit ranges when defaultUnit is fahrenheit', () => {
      const result = buildInstructions({ defaultUnit: 'fahrenheit' })

      expect(result).toContain('Below 32°F')
      expect(result).toContain('32°F to 50°F')
      expect(result).not.toContain('Below 0°C')
    })
  })

  describe('custom greetings', () => {
    it('should use custom greetings when provided', () => {
      const customGreetings = [
        'Ahoy weather seekers!',
        'Greetings from the forecast desk!'
      ]
      const result = buildInstructions({ greetings: customGreetings })

      expect(result).toContain('Ahoy weather seekers!')
      expect(result).toContain('Greetings from the forecast desk!')
    })

    it('should use default greetings when not provided', () => {
      const result = buildInstructions()

      // Should have default greeting patterns
      expect(result).toContain("I'm Sunny")
      expect(result).toContain('weather')
    })
  })

  describe('custom ambiguousCities', () => {
    it('should use custom ambiguous cities when provided', () => {
      const result = buildInstructions({
        ambiguousCities: ['Melbourne', 'Perth', 'Newcastle']
      })

      expect(result).toContain('Melbourne')
      expect(result).toContain('Perth')
      expect(result).toContain('Newcastle')
    })

    it('should use default cities when not provided', () => {
      const result = buildInstructions()

      expect(result).toContain('Springfield')
      expect(result).toContain('Portland')
    })
  })

  describe('section presence', () => {
    const result = buildInstructions()

    it('should include IDENTITY section', () => {
      expect(result).toContain('## IDENTITY')
    })

    it('should include CAPABILITIES section', () => {
      expect(result).toContain('## CAPABILITIES')
    })

    it('should include RESPONSE FORMATTING section', () => {
      expect(result).toContain('## RESPONSE FORMATTING')
    })

    it('should include ERROR HANDLING section', () => {
      expect(result).toContain('## ERROR HANDLING')
    })

    it('should include CONVERSATION CONTEXT section', () => {
      expect(result).toContain('## CONVERSATION CONTEXT')
    })

    it('should include INTENT CLASSIFICATION section', () => {
      expect(result).toContain('## INTENT CLASSIFICATION')
    })

    it('should include PREFERENCE MANAGEMENT section', () => {
      expect(result).toContain('## PREFERENCE MANAGEMENT')
    })

    it('should include TOOL USAGE section', () => {
      expect(result).toContain('## TOOL USAGE')
    })

    it('should include CONTEXTUAL WEATHER ADVICE section', () => {
      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
    })
  })

  describe('no rendering artifacts', () => {
    it('should not contain unsubstituted variables', () => {
      const result = buildInstructions()

      // Check for common Nunjucks artifacts
      expect(result).not.toMatch(/\{\{\s*\w+\s*\}\}/)
      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })

    it('should not contain template syntax', () => {
      const result = buildInstructions()

      // Should not have Nunjucks control structures in output
      expect(result).not.toContain('{%')
      expect(result).not.toContain('%}')
      expect(result).not.toContain('{#')
      expect(result).not.toContain('#}')
    })
  })

  describe('combined configuration', () => {
    it('should handle multiple config options together', () => {
      const result = buildInstructions({
        agentName: 'StormWatch',
        agentRole: 'severe weather analyst',
        personality: 'Alert, precise, safety-focused',
        defaultUnit: 'fahrenheit',
        greetings: ['Storm alert! How can I help?'],
        ambiguousCities: ['Auckland', 'Wellington']
      })

      expect(result).toContain('StormWatch')
      expect(result).toContain('severe weather analyst')
      expect(result).toContain('Alert, precise, safety-focused')
      expect(result).toContain('Below 32°F')
      expect(result).toContain('Storm alert! How can I help?')
      expect(result).toContain('Auckland')
    })
  })
})

describe('defaultConfig', () => {
  it('should have expected default values', () => {
    expect(defaultConfig.agentName).toBe('Sunny')
    expect(defaultConfig.agentRole).toBe('weather information specialist')
    expect(defaultConfig.defaultUnit).toBe('celsius')
  })

  it('should not have optional properties set', () => {
    expect(defaultConfig.greetings).toBeUndefined()
    expect(defaultConfig.ambiguousCities).toBeUndefined()
  })
})
```

### Test Categories

| Category | What It Tests |
|----------|---------------|
| Default configuration | buildInstructions() with no args |
| Variable substitution | Each config variable |
| Optional arrays | greetings, ambiguousCities |
| Section presence | All major sections exist |
| No artifacts | No {{ }}, {%, undefined |
| Combined config | Multiple options together |

### Running Tests

```bash
# Run all tests
npm test

# Run only template tests
npm test -- templates

# Run with coverage
npm test -- --coverage
```

### Expected Coverage

| Area | Coverage Target |
|------|-----------------|
| buildInstructions() | 100% |
| Variable substitution | 100% |
| Conditionals (greetings, cities) | 100% |
| defaultConfig export | 100% |

### Vitest Configuration

The project should already have vitest configured. If not:

```typescript
// vitest.config.ts (if needed)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

### Common Test Patterns

**Testing for presence:**
```typescript
expect(result).toContain('expected text')
```

**Testing for absence:**
```typescript
expect(result).not.toContain('unexpected text')
```

**Testing with regex:**
```typescript
expect(result).not.toMatch(/\{\{\s*\w+\s*\}\}/)
```

### Debugging Failing Tests

If tests fail:
1. Check template files exist
2. Verify import paths are correct
3. Log the rendered output: `console.log(result)`
4. Check for typos in expected strings

## References

- [Source: _bmad-output/epics.md#Story 5.13]
- [Source: _bmad-output/project-context.md#Testing Rules]
- [Source: vitest documentation]
- [Source: Story 5.3 - buildInstructions implementation]

---

## Dev Agent Record

### Implementation Summary

Extended `tests/mastra/agents/templates/index.test.ts` with additional tests to fully satisfy Story 5.13 acceptance criteria. The test file was originally created in Story 5.3 with 13 tests; this story added 9 more tests covering temperature unit ranges, section presence, rendering artifacts, combined configuration, and defaultConfig values.

### Files Modified

| File | Purpose |
|------|---------|
| `tests/mastra/agents/templates/index.test.ts` | Added 9 new tests (now 22 total) |

### Tests Added

```
New test categories:
- Temperature unit ranges (2 tests)
  - Celsius ranges when defaultUnit is celsius
  - Fahrenheit ranges when defaultUnit is fahrenheit

- Section presence (1 test)
  - All 9 major section headers present

- No rendering artifacts (3 tests)
  - No unsubstituted {{ }} variables
  - No undefined or null values
  - No Nunjucks template syntax ({%, #})

- Combined configuration (1 test)
  - Multiple config options together

- defaultConfig values (2 tests)
  - Expected default values
  - Optional properties undefined
```

### Test Results

```
Template tests: 198 passed (12 test files)
  - index.test.ts: 22 tests (was 13)
  - Other template tests: 176 tests
Build: Successful
```

### Build Verification

- `npm run build` passes with no errors
- All 198 template tests pass
- No regressions in existing tests

### Acceptance Criteria Verification

| AC | Status | Evidence |
|----|--------|----------|
| #1 | PASS | Tests cover: default config, custom agentName, custom greetings, Fahrenheit ranges, section headers, no undefined |
| #2 | PASS | All 198 template tests pass, no regressions |
| #3 | PASS | agentName, agentRole, personality, defaultUnit, greetings, ambiguousCities all tested |
| #4 | PASS | Tests verify defaults used when variables not provided |
| #5 | PASS | Uses vitest, file at tests/mastra/agents/templates/index.test.ts, follows naming conventions |
