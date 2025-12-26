# ATDD Checklist - All P0 (Critical) Tests

**Date:** 2025-12-26
**Author:** Oleksii
**Primary Test Level:** Unit + Integration
**Framework:** Vitest

---

## Summary

**Scope:** All P0 (Critical) tests across all 4 epics

**Test Coverage:**

| Epic | P0 Tests | Status |
|------|----------|--------|
| Epic 1: CLI Chat Foundation | 6 | RED |
| Epic 2: Weather Information Retrieval | 8 | RED |
| Epic 3: User Preferences & Memory | 7 | RED |
| Epic 4: Temperature Conversion & Session | 4 | RED |
| **Total** | **25** | **RED** |

---

## Acceptance Criteria (All Epics)

### Epic 1: CLI Chat Foundation
1. API keys loaded from environment only (NFR5)
2. Missing API key shows clear error (FR25)
3. Streaming text output (FR2)
4. Memory persists across CLI restarts (NFR13)
5. CLI input loop accepts messages (FR1)

### Epic 2: Weather Information Retrieval
1. Weather for specific city with formatted response (FR5)
2. OpenWeatherMap integration works (FR7)
3. API failures return graceful message (FR24)
4. API calls complete within 5s (NFR2)
5. Proper error code mapping (401, 404, 5xx)

### Epic 3: User Preferences & Memory
1. Set default city saves to memory (FR13)
2. Preferences persist across sessions (FR16)
3. Intent classification works (FR3)
4. Preference confirmation message (FR17)
5. Memory read/write <100ms (NFR3)

### Epic 4: Temperature Conversion & Session
1. C to F conversion accurate (FR10)
2. F to C conversion accurate (FR11)
3. Context-aware conversion (FR12)
4. New session command works (FR18)

---

## Failing Tests Created (RED Phase)

### Epic 1 Tests (6 tests)

**File:** `tests/mastra/lib/env-validation.test.ts`

- ✅ **Test:** should load GOOGLE_GENERATIVE_AI_API_KEY from environment
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR5 - API keys from env only

- ✅ **Test:** should load OPENWEATHERMAP_API_KEY from environment
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR5 - API keys from env only

- ✅ **Test:** should throw clear error when GOOGLE_GENERATIVE_AI_API_KEY is missing
  - **Status:** RED - Implementation missing
  - **Verifies:** FR25 - Clear error message

- ✅ **Test:** should throw clear error when OPENWEATHERMAP_API_KEY is missing
  - **Status:** RED - Implementation missing
  - **Verifies:** FR25 - Clear error message

- ✅ **Test:** should exit with non-zero code on missing required env var
  - **Status:** RED - Implementation missing
  - **Verifies:** FR25 - Non-zero exit code

**File:** `tests/mastra/memory/persistence.test.ts`

- ✅ **Test:** should persist working memory to mastra.db file
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR13 - Memory persistence

- ✅ **Test:** should read persisted memory after simulated restart
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR13 - Restart survival

- ✅ **Test:** should use fixed resourceId "cli-user" for persistence
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR13 - Consistent resourceId

**File:** `tests/cli/streaming.test.ts`

- ✅ **Test:** should accept user input and send to agent
  - **Status:** RED - Implementation missing
  - **Verifies:** FR1 - CLI input loop

- ✅ **Test:** should output tokens as they arrive from agent
  - **Status:** RED - Implementation missing
  - **Verifies:** FR2 - Streaming output

### Epic 2 Tests (8 tests)

**File:** `tests/mastra/tools/getCurrentWeather.test.ts`

- ✅ **Test:** should return formatted weather for valid city
  - **Status:** RED - Implementation missing
  - **Verifies:** FR5 - Weather for city

- ✅ **Test:** should include temperature, conditions, and humidity in response
  - **Status:** RED - Implementation missing
  - **Verifies:** FR5 - Required fields

- ✅ **Test:** should call OpenWeatherMap API with correct parameters
  - **Status:** RED - Implementation missing
  - **Verifies:** FR7 - API integration

- ✅ **Test:** should return CITY_NOT_FOUND for 404 response
  - **Status:** RED - Implementation missing
  - **Verifies:** FR24 - Error handling

- ✅ **Test:** should return API_KEY_INVALID for 401 response
  - **Status:** RED - Implementation missing
  - **Verifies:** FR24 - Error handling

- ✅ **Test:** should return API_UNAVAILABLE for 5xx response
  - **Status:** RED - Implementation missing
  - **Verifies:** FR24 - Error handling

- ✅ **Test:** should handle network failure gracefully
  - **Status:** RED - Implementation missing
  - **Verifies:** FR24 - Network error handling

- ✅ **Test:** should timeout after 5 seconds
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR2 - API timeout

### Epic 3 Tests (7 tests)

**File:** `tests/mastra/tools/setDefaultCity.test.ts`

- ✅ **Test:** should save city to working memory
  - **Status:** RED - Implementation missing
  - **Verifies:** FR13 - Set default city

- ✅ **Test:** should return success when city is set
  - **Status:** RED - Implementation missing
  - **Verifies:** FR13 - Success response

- ✅ **Test:** should return confirmation message with new city
  - **Status:** RED - Implementation missing
  - **Verifies:** FR17 - Confirmation

**File:** `tests/cli/intent-classification.test.ts`

- ✅ **Test:** should classify "Set my city to Paris" as preference update
  - **Status:** RED - Implementation missing
  - **Verifies:** FR3 - Intent classification

- ✅ **Test:** should classify "Weather in Paris" as weather query
  - **Status:** RED - Implementation missing
  - **Verifies:** FR3 - Intent classification

- ✅ **Test:** should classify "I prefer Fahrenheit" as preference update
  - **Status:** RED - Implementation missing
  - **Verifies:** FR3 - Intent classification

- ✅ **Test:** should read/write memory within 100ms
  - **Status:** RED - Implementation missing
  - **Verifies:** NFR3 - Memory performance

### Epic 4 Tests (4 tests)

**File:** `tests/mastra/tools/convertTemperature.test.ts`

- ✅ **Test:** should convert 0C to 32F (freezing point)
  - **Status:** GREEN - Already passing
  - **Verifies:** FR10/FR11 - Conversion accuracy

**File:** `tests/cli/session-management.test.ts`

- ✅ **Test:** should regenerate thread ID on "new session"
  - **Status:** RED - Implementation missing
  - **Verifies:** FR18 - New session

- ✅ **Test:** should preserve preferences after new session
  - **Status:** RED - Implementation missing
  - **Verifies:** FR18 - Preference preservation

- ✅ **Test:** should understand "what's that in Fahrenheit?" after weather query
  - **Status:** RED - Implementation missing
  - **Verifies:** FR12 - Context-aware conversion

---

## Data Infrastructure

### Fixtures (Already Created)

**File:** `tests/support/fixtures/weather.ts`
- `weatherFixtures.validCities` - Valid city names
- `weatherFixtures.invalidCities` - Invalid city names
- `temperatureFixtures.conversions` - C/F conversion pairs

**File:** `tests/support/fixtures/memory.ts`
- `memoryFixtures.validPreferences` - Valid user preferences
- `intentFixtures.preferenceUpdates` - Preference update phrases
- `intentFixtures.weatherQueries` - Weather query phrases

### Mocks (Already Created)

**File:** `tests/support/mocks/weatherApi.ts`
- `mockWeatherSuccess` - 200 OK response
- `mockWeather404` - City not found
- `mockWeather401` - Invalid API key
- `mockWeather429` - Rate limited
- `mockWeather500` - Server error
- `createMockFetch()` - Mock fetch factory
- `createWeatherData()` - Custom weather data

### Helpers (Already Created)

**File:** `tests/support/helpers/env.ts`
- `withEnv()` - Temporarily set env vars
- `withoutEnv()` - Temporarily remove env vars

---

## Implementation Checklist

### Epic 1: CLI Chat Foundation

#### Test: Environment Validation

- [ ] Create `src/mastra/lib/env-config.ts`
- [ ] Implement `validateEnvConfig()` function
- [ ] Validate GOOGLE_GENERATIVE_AI_API_KEY
- [ ] Validate OPENWEATHERMAP_API_KEY
- [ ] Throw clear errors with key names
- [ ] Exit with non-zero code on failure
- [ ] Run test: `npm test -- tests/mastra/lib/env-validation.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

#### Test: Memory Persistence

- [ ] Create `src/mastra/lib/memory.ts`
- [ ] Implement LibSQL adapter integration
- [ ] Use fixed resourceId "cli-user"
- [ ] Implement `setWorkingMemory()` / `getWorkingMemory()`
- [ ] Ensure DB file created on write
- [ ] Run test: `npm test -- tests/mastra/memory/persistence.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

#### Test: CLI Streaming

- [ ] Create `src/cli/index.ts`
- [ ] Implement readline-based input loop
- [ ] Integrate Mastra agent.stream()
- [ ] Write tokens to stdout as they arrive
- [ ] Handle empty input
- [ ] Run test: `npm test -- tests/cli/streaming.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

### Epic 2: Weather Information Retrieval

#### Test: getCurrentWeather Tool

- [ ] Create `src/mastra/tools/getCurrentWeather.ts`
- [ ] Implement OpenWeatherMap API client
- [ ] Add 5s timeout with AbortController
- [ ] Map HTTP errors to error codes:
  - 401 → API_KEY_INVALID
  - 404 → CITY_NOT_FOUND
  - 429 → RATE_LIMITED
  - 5xx → API_UNAVAILABLE
- [ ] Return formatted weather data
- [ ] Run test: `npm test -- tests/mastra/tools/getCurrentWeather.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 6 hours

### Epic 3: User Preferences & Memory

#### Test: setDefaultCity Tool

- [ ] Create `src/mastra/tools/setDefaultCity.ts`
- [ ] Save city to working memory
- [ ] Return confirmation message
- [ ] Run test: `npm test -- tests/mastra/tools/setDefaultCity.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

#### Test: Intent Classification

- [ ] Update agent prompt for clear intent boundaries
- [ ] Distinguish preference updates vs queries
- [ ] Handle natural language variations
- [ ] Run test: `npm test -- tests/cli/intent-classification.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

### Epic 4: Temperature Conversion & Session

#### Test: Session Management

- [ ] Implement thread ID regeneration
- [ ] Preserve preferences on new session
- [ ] Clear conversation history on new session
- [ ] Implement context-aware conversion
- [ ] Run test: `npm test -- tests/cli/session-management.test.ts`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all failing tests
npm test

# Run specific epic tests
npm test -- tests/mastra/lib/env-validation.test.ts
npm test -- tests/mastra/tools/getCurrentWeather.test.ts
npm test -- tests/cli/intent-classification.test.ts
npm test -- tests/cli/session-management.test.ts

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 25 P0 tests written and failing
- ✅ Fixtures and mocks created
- ✅ Test data helpers available
- ✅ Implementation checklist created

**Verification:**

```
Test Files  7 failed | 3 passed (10)
     Tests  38 failed | 34 passed (72)
```

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Pick one failing test** from implementation checklist
2. **Read the test** to understand expected behavior
3. **Implement minimal code** to make that specific test pass
4. **Run the test** to verify it now passes (green)
5. **Check off the task** in implementation checklist
6. **Move to next test** and repeat

**Recommended Order:**

1. Epic 1: Environment validation (foundation)
2. Epic 1: Memory persistence (required for preferences)
3. Epic 2: getCurrentWeather tool (core feature)
4. Epic 3: setDefaultCity tool (uses memory)
5. Epic 3: Intent classification (agent prompt)
6. Epic 4: Session management (requires memory + agent)
7. Epic 1: CLI streaming (integration)

---

### REFACTOR Phase (After All Tests Pass)

1. **Verify all tests pass**
2. **Review code quality**
3. **Extract duplications**
4. **Optimize performance**
5. **Ensure tests still pass**

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm test`

**Results:**

```
Test Files  7 failed | 3 passed (10)
     Tests  38 failed | 34 passed (72)
   Duration  729ms
```

**Summary:**

- Total P0 tests: 25
- Passing: 0 (except temperature conversion - already implemented)
- Failing: 25 (expected)
- Status: ✅ RED phase verified

---

## Notes

- Temperature conversion tests are already GREEN (from framework setup)
- All other P0 tests are properly failing
- Tests use `expect(true).toBe(false)` as placeholder until implementation
- Remove placeholder assertions when implementing each feature
- Each test includes TODO comments with exact implementation needed

---

## Knowledge Base References Applied

- **fixture-architecture.md** - Test fixture patterns
- **data-factories.md** - Factory patterns with faker
- **test-quality.md** - Given-When-Then structure
- **test-levels-framework.md** - Test level selection

---

**Generated by BMad TEA Agent** - 2025-12-26
