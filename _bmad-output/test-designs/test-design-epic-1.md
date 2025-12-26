# Test Design: Epic 1 - CLI Chat Foundation

**Date:** 2025-12-26
**Author:** Oleksii
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 1 - CLI Chat Foundation

**Risk Summary:**

- Total risks identified: 8
- High-priority risks (>=6): 3
- Critical categories: TECH, SEC, OPS

**Coverage Summary:**

- P0 scenarios: 6 (12 hours)
- P1 scenarios: 8 (8 hours)
- P2/P3 scenarios: 4 (2 hours)
- **Total effort**: 22 hours (~3 days)

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-1-001 | SEC | API keys exposed in logs or code | 2 | 3 | 6 | Validate env-only loading, add log sanitization | Dev | Sprint 1 |
| R-1-002 | TECH | LibSQL storage fails to persist across restarts | 2 | 3 | 6 | Integration test for DB file persistence | Dev | Sprint 1 |
| R-1-003 | OPS | Missing API key causes cryptic crash | 3 | 2 | 6 | Add startup validation with clear error messages | Dev | Sprint 1 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-1-004 | TECH | Streaming blocks CLI responsiveness | 2 | 2 | 4 | Test async streaming with concurrent input | QA |
| R-1-005 | TECH | Mastra instance configuration errors | 2 | 2 | 4 | Unit test Mastra init with valid/invalid configs | Dev |
| R-1-006 | OPS | SIGINT handler fails to cleanup resources | 2 | 2 | 4 | Test graceful shutdown closes DB connections | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------- |
| R-1-007 | BUS | Agent persona inconsistent in responses | 1 | 2 | 2 | Monitor in manual testing |
| R-1-008 | TECH | Working memory schema validation fails | 1 | 2 | 2 | Unit test Zod schema |

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
| FR1: Send messages via CLI | Integration | - | 1 | Dev | Core input loop |
| FR2: Streaming text output | Integration | R-1-004 | 2 | Dev | Token-by-token + responsiveness |
| NFR5: API keys from env only | Unit | R-1-001 | 1 | Dev | No hardcoded secrets |
| NFR13: Memory persistence | Integration | R-1-002 | 1 | Dev | DB survives restart |
| FR25: Missing API key error | Unit | R-1-003 | 1 | Dev | Clear startup error |

**Total P0**: 6 tests, 12 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| FR4: Agent persona in responses | Integration | R-1-007 | 2 | QA | Persona consistency |
| FR19: Exit CLI with "exit"/"quit" | Integration | - | 2 | Dev | Clean exit paths |
| NFR12: SIGINT graceful shutdown | Integration | R-1-006 | 1 | Dev | Ctrl+C handling |
| NFR1: Response begins <2s | Integration | - | 1 | QA | Performance baseline |
| Working memory schema | Unit | R-1-008 | 2 | Dev | Zod validation |

**Total P1**: 8 tests, 8 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| NFR6: API keys not logged | Unit | R-1-001 | 1 | Dev | Log sanitization |
| NFR7: .gitignore contains .env | Unit | - | 1 | Dev | Config validation |
| Mastra instance init | Unit | R-1-005 | 2 | Dev | Valid/invalid configs |

**Total P2**: 4 tests, 2 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| Agent greeting variations | Manual | N/A | QA | Exploratory testing |

**Total P3**: 0 automated tests

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] CLI starts without errors (30s)
- [ ] Agent responds to "hello" (1min)
- [ ] Exit command works (30s)

**Total**: 3 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] API keys loaded from environment (Unit)
- [ ] Missing API key shows clear error (Unit)
- [ ] Streaming response begins within 2s (Integration)
- [ ] Memory persists across CLI restart (Integration)
- [ ] CLI input loop accepts messages (Integration)
- [ ] Streaming doesn't block input (Integration)

**Total**: 6 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Agent responds with persona (Integration)
- [ ] "exit" command terminates CLI (Integration)
- [ ] "quit" command terminates CLI (Integration)
- [ ] Ctrl+C triggers graceful shutdown (Integration)
- [ ] Working memory schema accepts valid data (Unit)
- [ ] Working memory schema rejects invalid data (Unit)
- [ ] Response latency <2s for simple queries (Integration)
- [ ] Persona maintained across multiple turns (Integration)

**Total**: 8 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] API keys not present in console output (Unit)
- [ ] .gitignore excludes .env file (Unit)
- [ ] Mastra init with valid config succeeds (Unit)
- [ ] Mastra init with invalid config fails gracefully (Unit)

**Total**: 4 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 6 | 2.0 | 12 | Complex setup, security |
| P1 | 8 | 1.0 | 8 | Standard coverage |
| P2 | 4 | 0.5 | 2 | Simple scenarios |
| P3 | 0 | 0.25 | 0 | Manual only |
| **Total** | **18** | **-** | **22** | **~3 days** |

### Prerequisites

**Test Data:**

- Mock Mastra agent for unit tests
- Test LibSQL database file (isolated)

**Tooling:**

- Vitest for unit and integration tests
- Mock environment variables helper

**Environment:**

- Node.js 22.13.0+
- TypeScript 5.9.3
- Local LibSQL file (test-mastra.db)

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
- [ ] Security tests (SEC category) pass 100%
- [ ] API keys never exposed in any test output

---

## Mitigation Plans

### R-1-001: API Keys Exposed in Logs or Code (Score: 6)

**Mitigation Strategy:**
1. Validate all API key loading goes through environment variables only
2. Add log sanitization to strip any accidental key logging
3. Unit test that keys are not in source code

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Unit tests for env loading, grep for hardcoded keys

### R-1-002: LibSQL Storage Fails to Persist (Score: 6)

**Mitigation Strategy:**
1. Integration test that writes to DB, restarts process, reads back
2. Verify mastra.db file exists after write operations

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Integration test with process restart simulation

### R-1-003: Missing API Key Causes Cryptic Crash (Score: 6)

**Mitigation Strategy:**
1. Add startup validation that checks for required env vars
2. Display user-friendly error message with missing key name
3. Exit with non-zero code

**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Unit test with missing env var

---

## Assumptions and Dependencies

### Assumptions

1. Mastra framework handles model API calls internally
2. LibSQL adapter is stable and well-tested
3. Google Gemini API is available and responsive

### Dependencies

1. GOOGLE_GENERATIVE_AI_API_KEY - Required for agent responses
2. Mastra framework v0.24.9+ - Required for agent primitives
3. LibSQL adapter v0.16.4+ - Required for persistence

### Risks to Plan

- **Risk**: Mastra framework breaking changes
  - **Impact**: Test fixtures may need updates
  - **Contingency**: Pin exact versions, monitor changelog

---

## Test Scenarios Detail

### 1.1-UNIT-001: API Keys Loaded from Environment

```typescript
// tests/mastra/lib/env-config.test.ts
describe('Environment Configuration', () => {
  test('should load GOOGLE_GENERATIVE_AI_API_KEY from env', () => {
    // Verify key loaded from process.env, not hardcoded
  });

  test('should throw clear error when GOOGLE_GENERATIVE_AI_API_KEY missing', () => {
    // Verify error message includes key name
  });
});
```

### 1.1-INT-001: Memory Persistence Across Restarts

```typescript
// tests/mastra/memory-persistence.test.ts
describe('LibSQL Memory Persistence', () => {
  test('should persist working memory to mastra.db', async () => {
    // Write preference, verify file exists
  });

  test('should read persisted memory after simulated restart', async () => {
    // Write, close connection, reopen, verify data
  });
});
```

### 1.3-INT-001: Streaming Response Output

```typescript
// tests/cli/streaming.test.ts
describe('CLI Streaming', () => {
  test('should output tokens as they arrive', async () => {
    // Mock agent.stream(), verify stdout.write called per chunk
  });

  test('should not block CLI during streaming', async () => {
    // Verify readline remains responsive during stream
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
