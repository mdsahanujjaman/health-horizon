# Clinical Integrity Engine — Technical Design

**Status:** Design baseline for implementation  
**Branch:** feature/clinical-integrity-engine  
**Rule-set version:** 1.0.0

## Scope

This subsystem is a deterministic data-integrity layer for structured healthcare observations. It preserves incoming records and provenance, validates technical structure, detects exact duplicate candidates, and flags competing values for the same patient, observation type, and exact observation timestamp.

It does not diagnose, recommend treatment, infer clinical correctness, or choose a winning record.

## Existing platform components reused

- PostgreSQL through Sequelize
- Existing patient identity and association
- Existing Express API and authentication middleware
- Existing audit-log model as a future integration point
- Existing health metrics and laboratory workflows as potential upstream sources

## Processing contract

Required input: positive integer patientId; metricCode; finite numeric value; unit; ISO-8601 observedAt with explicit timezone; sourceType; sourceReference.

Version 1.0.0 conservatively trims and lowercases unit text. It performs no physical unit conversion and no clinical range inference.

## Deterministic classification

1. INVALID: required fields or timestamp are invalid.
2. NEW: no matching patient/metric/time group exists.
3. DUPLICATE_CANDIDATE: same observation group, numeric value, and normalized unit.
4. CONFLICT_REVIEW_REQUIRED: same observation group exists but value or normalized unit differs.

No record is deleted or overwritten. A conflict is retained for authorised human review. The engine never selects which source is medically correct.

## Provenance and reproducibility

Each evaluation returns the rule-set version, source metadata, observed and ingestion timestamps, canonical SHA-256 fingerprint, matched record identifiers, and machine-readable reason codes. The fingerprint excludes source metadata so equivalent observations from different sources can be compared.

## Security and privacy

- Use synthetic data for development and demonstrations.
- Do not put direct identifiers or medical document contents in logs.
- API integration must enforce patient ownership and role-based access.
- Database writes must be transactional.
- Audit events must be generated server-side.

## Known limitations

- Exact timestamp matching is conservative and may miss duplicates with slightly different timestamps.
- No unit conversion, clinical thresholds, or diagnosis are implemented.
- This is a baseline engineering implementation, not an established novel invention.
- Patentability requires independent prior-art analysis and a specific technical contribution beyond generic validation and record comparison.