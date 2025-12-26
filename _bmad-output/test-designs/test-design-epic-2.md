# Test Design: Epic 2 - Weather Information Retrieval

**Date:** 2025-12-26
**Author:** Oleksii
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 2 - Weather Information Retrieval

**Risk Summary:**

- Total risks identified: 10
- High-priority risks (>=6): 4
- Critical categories: TECH, SEC, PERF, BUS

**Coverage Summary:**

- P0 scenarios: 8 (16 hours)
- P1 scenarios: 10 (10 hours)
- P2/P3 scenarios: 6 (3 hours)
- **Total effort**: 29 hours (~4 days)

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-2-001 | TECH | OpenWeatherMap API returns unexpected response format | 2 | 3 | 6 | Schema validation, defensive parsing | Dev | Sprint 1 |
| R-2-002 | PERF | API calls exceed 5s timeout (NFR2) | 2 | 3 | 6 | Add timeout handling, retry logic | Dev | Sprint 1 |
| R-2-003 | SEC | API key exposed in error messages | 2 | 3 | 6 | Sanitize all error outputs | Dev | Sprint 1 |
| R-2-004 | BUS | Agent crashes on API failure instead of graceful message | 3 | 2 | 6 | Wrap all API calls in try-catch, map to error codes | Dev | Sprint 1 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-2-005 | TECH | City name normalization fails (case, special chars) | 2 | 2 | 4 | Normalize input before API call | Dev |
| R-2-006 | BUS | Ambiguous city (Springfield) not detected | 2 | 2 | 4 | Check for multiple results, prompt clarification | Dev |
| R-2-007 | PERF | Rate limit (60/min) exceeded under normal use | 1 | 3 | 3 | Add request throttling, cache recent queries | Dev |
| R-2-008 | BUS | Off-topic requests not redirected gracefully | 2 | 2 | 4 | Test intent classification edge cases | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------- |
| R-2-009 | BUS | Contextual advice missing or inappropriate | 1 | 2 | 2 | Monitor in manual testing |
| R-2-010 | TECH | Weather formatting inconsistent | 1 | 1 | 1 | Unit test formatters |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (>=6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR5: Weather for specific city | Integration | R-2-001 | 2 | Dev | Valid city, formatted response |
| FR7: OpenWeatherMap integration | Integration | R-2-002 | 2 | Dev | API call success, timeout handling |
| FR24: API failures graceful message | Integration | R-2-004 | 2 | Dev | 5xx, network error |
| NFR2: API <5s timeout | Integration | R-2-002 | 1 | Dev | Timeout enforcement |
| Error code: API_KEY_INVALID | Unit | R-2-003 | 1 | Dev | 401 handling |

**Total P0**: 8 tests, 16 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR8: Format temp, conditions, humidity | Unit | - | 2 | Dev | Formatting functions |
| FR9: Contextual advice (umbrella, coat) | Unit | R-2-009 | 2 | Dev | Weather-based advice |
| FR21: Off-topic polite redirect | Integration | R-2-008 | 2 | QA | Bitcoin, politics |
| FR22: Gibberish handled gracefully | Integration | R-2-008 | 1 | QA | Random input |
| FR23: Ambiguous location clarification | Integration | R-2-006 | 2 | Dev | Springfield scenario |
| Error code: CITY_NOT_FOUND | Unit | - | 1 | Dev | 404 handling |

**Total P1**: 10 tests, 10 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| NFR8: Rate limit handling | Integration | R-2-007 | 1 | Dev | 429 response |
| NFR10: Free tier compatibility | Integration | R-2-007 | 1 | Dev | 60 calls/min |
| City name normalization | Unit | R-2-005 | 2 | Dev | Case, accents |
| Error code: RATE_LIMITED | Unit | R-2-007 | 1 | Dev | 429 handling |
| API_UNAVAILABLE error code | Unit | - | 1 | Dev | 5xx handling |

**Total P2**: 6 tests, 3 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| Weather advice variations | Manual | N/A | QA | Edge weather conditions |
| Response formatting edge cases | Manual | N/A | QA | Extreme temps, rare conditions |

**Total P3**: 0 automated tests

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Weather API client can fetch Paris weather (1min)
- [ ] getCurrentWeather tool returns formatted data (1min)
- [ ] Agent responds to "What's the weather in London?" (1min)

**Total**: 3 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] getCurrentWeather with valid city returns data (Integration)
- [ ] getCurrentWeather with invalid city returns CITY_NOT_FOUND (Integration)
- [ ] API timeout triggers API_UNAVAILABLE error (Integration)
- [ ] Network failure handled gracefully (Integration)
- [ ] API 401 returns API_KEY_INVALID (Unit)
- [ ] API 5xx returns API_UNAVAILABLE (Unit)
- [ ] Weather response includes temp, conditions, humidity (Integration)
- [ ] API call completes within 5s or times out (Integration)

**Total**: 8 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Temperature formatted correctly (C and F) (Unit)
- [ ] Weather conditions formatted (cloudy, rain, etc.) (Unit)
- [ ] Rainy weather includes umbrella advice (Unit)
- [ ] Cold weather includes coat advice (Unit)
- [ ] Off-topic "Bitcoin" request redirected (Integration)
- [ ] Off-topic "politics" request redirected (Integration)
- [ ] Gibberish input handled gracefully (Integration)
- [ ] "Springfield" prompts clarification (Integration)
- [ ] Ambiguous city handled (multiple results) (Integration)
- [ ] 404 response returns CITY_NOT_FOUND code (Unit)

**Total**: 10 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] 429 response returns RATE_LIMITED code (Unit)
- [ ] Rate limiting enforced (mock rapid calls) (Integration)
- [ ] City name "PARIS" normalized to "Paris" (Unit)
- [ ] City name "pARIS" normalized correctly (Unit)
- [ ] 500 response returns API_UNAVAILABLE (Unit)
- [ ] 503 response returns API_UNAVAILABLE (Unit)

**Total**: 6 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 8 | 2.0 | 16 | API mocking, error handling |
| P1 | 10 | 1.0 | 10 | Standard coverage |
| P2 | 6 | 0.5 | 3 | Simple scenarios |
| P3 | 0 | 0.25 | 0 | Manual only |
| **Total** | **24** | **-** | **29** | **~4 days** |

### Prerequisites

**Test Data:**

- Mock OpenWeatherMap responses (success, errors)
- City name test fixtures (valid, invalid, ambiguous)

**Tooling:**

- Vitest for unit and integration tests
- MSW (Mock Service Worker) or similar for API mocking
- Nock for HTTP mocking

**Environment:**

- Test API key (can be fake for mocked tests)
- Mock server for integration tests

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: >=95% (waivers required for failures)
- **P2/P3 pass rate**: >=90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: >=80%
- **Security scenarios**: 100%
- **Business logic**: >=70%
- **Edge cases**: >=50%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (>=6) items unmitigated
- [ ] API key never exposed in error outputs
- [ ] All error codes properly mapped from HTTP responses

---

## Mitigation Plans

### R-2-001: OpenWeatherMap API Unexpected Response Format (Score: 6)

**Mitigation Strategy:**
1. Add Zod schema validation for API responses
2. Defensive parsing with fallbacks for missing fields
3. Log unexpected formats for debugging (without sensitive data)

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Unit tests with malformed responses

### R-2-002: API Calls Exceed 5s Timeout (Score: 6)

**Mitigation Strategy:**
1. Add AbortController with 5s timeout to fetch calls
2. Return API_UNAVAILABLE error on timeout
3. Consider retry with exponential backoff (optional)

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Integration test with delayed mock response

### R-2-003: API Key Exposed in Error Messages (Score: 6)

**Mitigation Strategy:**
1. Never include API key in error messages
2. Sanitize all error outputs before displaying to user
3. Use generic "Configuration error" message for auth failures

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Unit test error message content

### R-2-004: Agent Crashes on API Failure (Score: 6)

**Mitigation Strategy:**
1. Wrap all API calls in try-catch blocks
2. Map all errors to defined error codes (CITY_NOT_FOUND, API_UNAVAILABLE, etc.)
3. Return user-friendly message from error code

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Integration tests for all error paths

---

## Assumptions and Dependencies

### Assumptions

1. OpenWeatherMap API follows documented response format
2. Free tier limits (60 calls/min) sufficient for demo use
3. Network connectivity is generally available

### Dependencies

1. OPENWEATHERMAP_API_KEY - Required for weather data
2. OpenWeatherMap Current Weather API endpoint
3. Stable network connectivity

### Risks to Plan

- **Risk**: OpenWeatherMap API changes format
  - **Impact**: Response parsing may fail
  - **Contingency**: Version-pin API, add format validation

- **Risk**: OpenWeatherMap service outage
  - **Impact**: All weather queries fail
  - **Contingency**: Graceful error messages, consider caching

---

## Test Scenarios Detail

### 2.1-UNIT-001: Weather API Client Error Codes

```typescript
// tests/mastra/lib/weatherApi.test.ts
describe('WeatherAPI Client', () => {
  test('should return CITY_NOT_FOUND for 404 response', async () => {
    // Mock 404, verify error code
  });

  test('should return API_KEY_INVALID for 401 response', async () => {
    // Mock 401, verify error code
  });

  test('should return API_UNAVAILABLE for 5xx response', async () => {
    // Mock 500/503, verify error code
  });

  test('should return RATE_LIMITED for 429 response', async () => {
    // Mock 429, verify error code
  });
});
```

### 2.2-INT-001: getCurrentWeather Tool

```typescript
// tests/mastra/tools/getCurrentWeather.test.ts
describe('getCurrentWeather Tool', () => {
  test('should return formatted weather for valid city', async () => {
    // Mock API success, verify { success: true, data: {...} }
  });

  test('should return error code for invalid city', async () => {
    // Mock 404, verify { success: false, errorCode: 'CITY_NOT_FOUND' }
  });

  test('should include temp, conditions, humidity in response', async () => {
    // Verify all required fields present
  });
});
```

### 2.3-INT-001: Edge Case Handling

```typescript
// tests/cli/edge-cases.test.ts
describe('Edge Case Handling', () => {
  test('should redirect off-topic request about Bitcoin', async () => {
    // Send "Tell me about Bitcoin", verify redirect message
  });

  test('should handle gibberish input gracefully', async () => {
    // Send "asdfghjkl", verify clarification message
  });

  test('should request clarification for Springfield', async () => {
    // Send "Weather in Springfield", verify clarification prompt
  });
});
```

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests (separate workflow; not auto-run).
- Run `*automate` for broader coverage once implementation exists.

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: ____________ Date: ____________
- [ ] Tech Lead: ____________ Date: ____________
- [ ] QA Lead: ____________ Date: ____________

**Comments:**

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

### Related Documents

- PRD: [prd.md](_bmad-output/prd.md)
- Epic: [epics.md](_bmad-output/project-planning-artifacts/epics.md)
- Architecture: [architecture.md](_bmad-output/architecture.md)

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
