# Test Design: Epic 4 - Temperature Conversion & Session Management

**Date:** 2025-12-26
**Author:** Oleksii
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 4 - Temperature Conversion & Session Management

**Risk Summary:**

- Total risks identified: 7
- High-priority risks (>=6): 1
- Critical categories: TECH, BUS, DATA

**Coverage Summary:**

- P0 scenarios: 4 (8 hours)
- P1 scenarios: 6 (6 hours)
- P2/P3 scenarios: 4 (2 hours)
- **Total effort**: 16 hours (~2 days)

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-4-001 | TECH | Conversation context not accessible for temperature conversion | 2 | 3 | 6 | Test context retrieval from conversation history | Dev | Sprint 2 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-4-002 | BUS | New session clears preferences (should only clear history) | 2 | 2 | 4 | Test preferences survive new session | Dev |
| R-4-003 | TECH | Temperature conversion formula incorrect | 1 | 3 | 3 | Unit test conversion accuracy | Dev |
| R-4-004 | DATA | Thread ID not regenerated on new session | 2 | 2 | 4 | Test thread ID changes after new session | Dev |
| R-4-005 | BUS | Agent doesn't understand "what's that in F?" context | 2 | 2 | 4 | Test contextual conversion requests | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------- |
| R-4-006 | TECH | Rounding errors in temperature conversion | 1 | 1 | 1 | Use appropriate decimal precision |
| R-4-007 | BUS | New session greeting inconsistent | 1 | 1 | 1 | Monitor in manual testing |

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
| FR10: C to F conversion | Unit | R-4-003 | 1 | Dev | Formula accuracy |
| FR11: F to C conversion | Unit | R-4-003 | 1 | Dev | Formula accuracy |
| FR12: Context-aware conversion | Integration | R-4-001 | 1 | Dev | "What's that in F?" |
| FR18: New session command | Integration | R-4-002 | 1 | Dev | Thread regeneration |

**Total P0**: 4 tests, 8 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| New session preserves preferences | Integration | R-4-002 | 1 | Dev | Default city survives |
| New session clears history | Integration | R-4-004 | 1 | Dev | Thread ID changes |
| Context from previous message | Integration | R-4-005 | 2 | QA | Natural phrasing |
| convertTemperature tool | Unit | - | 2 | Dev | Tool input/output |

**Total P1**: 6 tests, 6 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| Rounding precision | Unit | R-4-006 | 1 | Dev | Decimal places |
| New session greeting | Integration | R-4-007 | 1 | QA | Persona greeting |
| Edge temperatures (0, 100, negative) | Unit | - | 2 | Dev | Boundary cases |

**Total P2**: 4 tests, 2 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| Conversion phrasing variations | Manual | N/A | QA | Natural language |
| Session management edge cases | Manual | N/A | QA | Rapid new sessions |

**Total P3**: 0 automated tests

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] convertTemperature tool converts 32F to 0C (30s)
- [ ] "new session" command works (30s)
- [ ] Context conversion "what's that in F?" (1min)

**Total**: 3 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] 32F converts to 0C correctly (Unit)
- [ ] 0C converts to 32F correctly (Unit)
- [ ] "What's that in Fahrenheit?" uses last temp (Integration)
- [ ] "new session" regenerates thread ID (Integration)

**Total**: 4 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] New session preserves default city preference (Integration)
- [ ] New session clears conversation history (Integration)
- [ ] "Convert that to Celsius" uses context (Integration)
- [ ] Context works after weather query (Integration)
- [ ] convertTemperature handles C->F (Unit)
- [ ] convertTemperature handles F->C (Unit)

**Total**: 6 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Temperature rounded to 1 decimal place (Unit)
- [ ] Agent greets fresh after new session (Integration)
- [ ] -40C converts to -40F (edge case) (Unit)
- [ ] 100C converts to 212F (boiling point) (Unit)

**Total**: 4 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 4 | 2.0 | 8 | Context handling complex |
| P1 | 6 | 1.0 | 6 | Standard coverage |
| P2 | 4 | 0.5 | 2 | Simple scenarios |
| P3 | 0 | 0.25 | 0 | Manual only |
| **Total** | **14** | **-** | **16** | **~2 days** |

### Prerequisites

**Test Data:**

- Temperature conversion fixtures
- Conversation history mocks

**Tooling:**

- Vitest for unit and integration tests
- Conversation context helpers

**Environment:**

- Standard test environment
- Mock conversation history

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: >=95% (waivers required for failures)
- **P2/P3 pass rate**: >=90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: >=80%
- **Conversion accuracy**: 100%
- **Business logic**: >=70%
- **Edge cases**: >=50%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (>=6) items unmitigated
- [ ] Temperature conversions mathematically correct
- [ ] Preferences survive new session

---

## Mitigation Plans

### R-4-001: Conversation Context Not Accessible (Score: 6)

**Mitigation Strategy:**
1. Verify conversation history is passed to agent on each turn
2. Test that agent can reference previous message content
3. Ensure thread ID scopes conversation correctly

**Owner:** Dev
**Timeline:** Sprint 2
**Status:** Planned
**Verification:** Integration test with context-dependent query

---

## Assumptions and Dependencies

### Assumptions

1. Mastra conversation history is accessible to agent
2. Temperature conversion is pure calculation (no API needed)
3. Thread ID regeneration clears history

### Dependencies

1. Epic 1: CLI foundation complete
2. Epic 3: Memory persistence working
3. Mastra conversation history module

### Risks to Plan

- **Risk**: Agent struggles with context interpretation
  - **Impact**: "What's that in F?" fails
  - **Contingency**: Explicit temperature context in prompt

---

## Test Scenarios Detail

### 4.1-UNIT-001: Temperature Conversion Accuracy

```typescript
// tests/mastra/tools/convertTemperature.test.ts
describe('convertTemperature Tool', () => {
  test('should convert 32F to 0C', () => {
    const result = convertTemperature({ value: 32, from: 'fahrenheit', to: 'celsius' });
    expect(result.data.value).toBe(0);
  });

  test('should convert 0C to 32F', () => {
    const result = convertTemperature({ value: 0, from: 'celsius', to: 'fahrenheit' });
    expect(result.data.value).toBe(32);
  });

  test('should convert 100C to 212F', () => {
    const result = convertTemperature({ value: 100, from: 'celsius', to: 'fahrenheit' });
    expect(result.data.value).toBe(212);
  });

  test('should convert -40C to -40F (equal point)', () => {
    const result = convertTemperature({ value: -40, from: 'celsius', to: 'fahrenheit' });
    expect(result.data.value).toBe(-40);
  });
});
```

### 4.1-INT-001: Context-Aware Conversion

```typescript
// tests/cli/context-conversion.test.ts
describe('Context-Aware Conversion', () => {
  test('should understand "what\'s that in Fahrenheit?"', async () => {
    // First: Get weather showing 20C
    // Then: Ask "What's that in Fahrenheit?"
    // Verify: Response includes 68F
  });

  test('should use last temperature from conversation', async () => {
    // Weather shows 25C
    // Ask "Convert that to F"
    // Verify: 77F returned
  });
});
```

### 4.2-INT-001: New Session Management

```typescript
// tests/cli/session-management.test.ts
describe('New Session', () => {
  test('should regenerate thread ID on "new session"', async () => {
    const oldThreadId = getCurrentThreadId();
    await sendMessage('new session');
    const newThreadId = getCurrentThreadId();
    expect(newThreadId).not.toBe(oldThreadId);
  });

  test('should preserve preferences after new session', async () => {
    await setDefaultCity('Paris');
    await sendMessage('new session');
    const prefs = await getPreferences();
    expect(prefs.default_city).toBe('Paris');
  });

  test('should clear conversation history after new session', async () => {
    await sendMessage('Remember this: test message');
    await sendMessage('new session');
    // Agent should not know about "test message"
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
