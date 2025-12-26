# Test Design: Epic 3 - User Preferences & Memory Persistence

**Date:** 2025-12-26
**Author:** Oleksii
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 3 - User Preferences & Memory Persistence

**Risk Summary:**

- Total risks identified: 9
- High-priority risks (>=6): 3
- Critical categories: DATA, TECH, BUS

**Coverage Summary:**

- P0 scenarios: 7 (14 hours)
- P1 scenarios: 9 (9 hours)
- P2/P3 scenarios: 5 (2.5 hours)
- **Total effort**: 25.5 hours (~3-4 days)

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-3-001 | DATA | Preferences lost on CLI restart | 2 | 3 | 6 | Integration test persistence across restarts | Dev | Sprint 2 |
| R-3-002 | TECH | Working memory write fails silently | 2 | 3 | 6 | Add error handling, verify writes complete | Dev | Sprint 2 |
| R-3-003 | BUS | Intent misclassified (preference vs query) | 3 | 2 | 6 | Test clear intent classification boundaries | Dev | Sprint 2 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-3-004 | DATA | Default city not used when unspecified | 2 | 2 | 4 | Test weather query without city | Dev |
| R-3-005 | BUS | User name not used in greetings | 2 | 2 | 4 | Test returning user flow | QA |
| R-3-006 | TECH | Preferred units not applied to weather output | 2 | 2 | 4 | Test unit conversion in weather response | Dev |
| R-3-007 | BUS | Preference confirmation message unclear | 2 | 2 | 4 | Verify confirmation includes new value | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------- |
| R-3-008 | TECH | Memory read performance (NFR3 <100ms) | 1 | 2 | 2 | Monitor in performance tests |
| R-3-009 | BUS | Edge case: empty city name accepted | 1 | 1 | 1 | Unit test validation |

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
| FR13: Set default city | Integration | R-3-001 | 1 | Dev | Tool execution |
| FR16: Persist across sessions | Integration | R-3-001 | 2 | Dev | Restart survival |
| FR3: Intent classification | Integration | R-3-003 | 2 | Dev | Preference vs query |
| FR17: Confirm preference changes | Integration | R-3-007 | 1 | Dev | Confirmation message |
| NFR3: Memory <100ms | Integration | R-3-008 | 1 | Dev | Performance baseline |

**Total P0**: 7 tests, 14 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR6: Weather uses default city | Integration | R-3-004 | 2 | Dev | No city specified |
| FR14: Set preferred units | Integration | R-3-006 | 2 | Dev | Celsius/Fahrenheit |
| FR15: Persist across conversation turns | Integration | R-3-001 | 1 | Dev | Same session |
| FR20: Greet returning users by name | Integration | R-3-005 | 2 | QA | Name in memory |
| setDefaultCity tool | Unit | - | 1 | Dev | Tool logic |
| setPreferredUnits tool | Unit | - | 1 | Dev | Tool logic |

**Total P1**: 9 tests, 9 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| Empty city name rejected | Unit | R-3-009 | 1 | Dev | Validation |
| Invalid unit rejected | Unit | - | 1 | Dev | Validation |
| Memory schema validation | Unit | - | 2 | Dev | Zod schema |
| Concurrent memory access | Integration | R-3-002 | 1 | Dev | Race conditions |

**Total P2**: 5 tests, 2.5 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| Greeting variations | Manual | N/A | QA | Persona consistency |
| Memory performance under load | Manual | N/A | Dev | Stress testing |

**Total P3**: 0 automated tests

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] setDefaultCity tool accepts valid city (30s)
- [ ] setPreferredUnits tool accepts "fahrenheit" (30s)
- [ ] Default city used in weather query (1min)

**Total**: 3 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] setDefaultCity saves to working memory (Integration)
- [ ] Preferences persist across CLI restart (Integration)
- [ ] "Set my city to Paris" classified as preference update (Integration)
- [ ] "Weather in Paris" classified as query, not update (Integration)
- [ ] Preference change confirms new value (Integration)
- [ ] Memory read/write completes <100ms (Integration)
- [ ] Preferences survive new CLI session (Integration)

**Total**: 7 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] "What's the weather?" uses default city (Integration)
- [ ] Default city mentioned in response (Integration)
- [ ] setPreferredUnits saves celsius preference (Integration)
- [ ] setPreferredUnits saves fahrenheit preference (Integration)
- [ ] Preference persists across conversation turns (Integration)
- [ ] Returning user greeted by name (Integration)
- [ ] Name saved when user says "My name is X" (Integration)
- [ ] setDefaultCity tool returns success (Unit)
- [ ] setPreferredUnits tool returns success (Unit)

**Total**: 9 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Empty city name rejected by setDefaultCity (Unit)
- [ ] Invalid unit ("kelvin") rejected (Unit)
- [ ] Working memory schema validates default_city (Unit)
- [ ] Working memory schema validates preferred_units enum (Unit)
- [ ] Rapid memory writes don't cause race conditions (Integration)

**Total**: 5 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 7 | 2.0 | 14 | Persistence, restart simulation |
| P1 | 9 | 1.0 | 9 | Standard coverage |
| P2 | 5 | 0.5 | 2.5 | Simple scenarios |
| P3 | 0 | 0.25 | 0 | Manual only |
| **Total** | **21** | **-** | **25.5** | **~3-4 days** |

### Prerequisites

**Test Data:**

- User preference fixtures (city, units, name)
- Test LibSQL database (isolated)

**Tooling:**

- Vitest for unit and integration tests
- Process spawn/kill for restart simulation
- Performance timing utilities

**Environment:**

- Isolated test database (test-mastra.db)
- Mock Mastra memory interface

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: >=95% (waivers required for failures)
- **P2/P3 pass rate**: >=90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: >=80%
- **Data integrity scenarios**: 100%
- **Business logic**: >=70%
- **Edge cases**: >=50%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (>=6) items unmitigated
- [ ] Preferences survive CLI restart
- [ ] Intent classification accuracy >=90%

---

## Mitigation Plans

### R-3-001: Preferences Lost on CLI Restart (Score: 6)

**Mitigation Strategy:**
1. Integration test that writes preferences, simulates restart, reads back
2. Verify LibSQL file exists and contains data
3. Use fixed resourceId ("cli-user") for consistent memory access

**Owner:** Dev
**Timeline:** Sprint 2
**Status:** Planned
**Verification:** Restart simulation integration test

### R-3-002: Working Memory Write Fails Silently (Score: 6)

**Mitigation Strategy:**
1. Add await and error handling to all memory write operations
2. Verify write success before confirming to user
3. Log write failures (without sensitive data)

**Owner:** Dev
**Timeline:** Sprint 2
**Status:** Planned
**Verification:** Mock write failure, verify error propagation

### R-3-003: Intent Misclassified (Score: 6)

**Mitigation Strategy:**
1. Clear intent classification boundaries in agent prompt
2. Test ambiguous phrases explicitly
3. Document classification rules for maintainability

**Owner:** Dev
**Timeline:** Sprint 2
**Status:** Planned
**Verification:** Integration tests for intent edge cases

---

## Assumptions and Dependencies

### Assumptions

1. Mastra working memory API is stable
2. LibSQL adapter handles concurrent access safely
3. Agent prompt effectively distinguishes intents

### Dependencies

1. Epic 1: CLI foundation must be complete
2. Mastra Memory module working correctly
3. LibSQL storage adapter functional

### Risks to Plan

- **Risk**: Agent prompt struggles with intent classification
  - **Impact**: Preferences set unintentionally
  - **Contingency**: Refine prompt, add explicit keywords

- **Risk**: LibSQL adapter concurrent write issues
  - **Impact**: Data loss or corruption
  - **Contingency**: Add locking mechanism or serialize writes

---

## Test Scenarios Detail

### 3.1-INT-001: setDefaultCity Persistence

```typescript
// tests/mastra/tools/setDefaultCity.test.ts
describe('setDefaultCity Tool', () => {
  test('should save city to working memory', async () => {
    // Call tool with city="London"
    // Verify memory contains default_city: "London"
  });

  test('should confirm city change to user', async () => {
    // Verify response includes confirmation message
  });
});
```

### 3.3-INT-001: Cross-Session Persistence

```typescript
// tests/mastra/memory/persistence.test.ts
describe('Memory Persistence', () => {
  test('should persist preferences across CLI restart', async () => {
    // Write preferences
    // Close database connection
    // Reopen connection
    // Read preferences back
    // Verify values match
  });

  test('should use fixed resourceId for persistence', async () => {
    // Verify resourceId is "cli-user" consistently
  });
});
```

### 3.4-INT-001: Intent Classification

```typescript
// tests/cli/intent-classification.test.ts
describe('Intent Classification', () => {
  test('should classify "Set my city to Paris" as preference update', async () => {
    // Send message, verify setDefaultCity called
  });

  test('should classify "Weather in Paris" as weather query', async () => {
    // Send message, verify getCurrentWeather called
    // Verify default_city NOT changed
  });

  test('should classify "I live in Tokyo now" as preference update', async () => {
    // More natural phrasing, verify intent detected
  });

  test('should classify "My name is Alex" as name update', async () => {
    // Verify user_name saved to memory
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
