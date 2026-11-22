# Clinical Integrity Engine — Test Plan

## Unit test execution

From the backend directory run:

    node --test src/services/clinicalIntegrity/reconciliationEngine.test.js

## Test cases

| ID | Scenario | Expected result |
|---|---|---|
| CI-001 | Valid observation | Parsed with provenance and fingerprint |
| CI-002 | Timestamp without timezone | INVALID |
| CI-003 | Non-finite numeric value | INVALID |
| CI-004 | No matching patient/metric/time group | NEW |
| CI-005 | Same value and unit in same group | DUPLICATE_CANDIDATE |
| CI-006 | Different value in same group | CONFLICT_REVIEW_REQUIRED |
| CI-007 | Different patient | NEW |
| CI-008 | Same observation with different source metadata | Same canonical fingerprint |

These are unit tests of the implemented rule set. They do not establish clinical accuracy, real-world duplicate-detection performance, safety for clinical decisions, or patent novelty.

## Integration gate

1. Add a persistent observation/provenance model.
2. Enforce patient ownership and role-based authorization.
3. Use a database transaction for record creation and reconciliation.
4. Make duplicate and conflict outcomes non-destructive.
5. Add integration tests against a disposable PostgreSQL database.