'use strict';

const crypto = require('crypto');

const RULESET_VERSION = '1.0.0';
const SOURCE_TYPES = new Set([
  'PATIENT_ENTRY', 'DOCTOR_ENTRY', 'LAB_REPORT', 'DEVICE', 'IMPORTED_RECORD', 'OTHER',
]);

function normalizeUnit(unit) {
  return String(unit).trim().toLowerCase();
}

function parseObservation(input, now = new Date()) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, errors: ['INPUT_MUST_BE_OBJECT'] };
  }

  const patientId = Number(input.patientId);
  if (!Number.isSafeInteger(patientId) || patientId <= 0) errors.push('INVALID_PATIENT_ID');
  if (typeof input.metricCode !== 'string' || !input.metricCode.trim()) errors.push('METRIC_CODE_REQUIRED');

  const value = Number(input.value);
  if (input.value === null || input.value === '' || !Number.isFinite(value)) {
    errors.push('VALUE_MUST_BE_FINITE_NUMBER');
  }
  if (typeof input.unit !== 'string' || !input.unit.trim()) errors.push('UNIT_REQUIRED');
  if (!SOURCE_TYPES.has(input.sourceType)) errors.push('UNSUPPORTED_SOURCE_TYPE');
  if (typeof input.sourceReference !== 'string' || !input.sourceReference.trim()) {
    errors.push('SOURCE_REFERENCE_REQUIRED');
  }

  const observedDate = typeof input.observedAt === 'string' ? new Date(input.observedAt) : null;
  const hasExplicitTimezone = typeof input.observedAt === 'string'
    && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input.observedAt);
  if (!observedDate || Number.isNaN(observedDate.getTime()) || !hasExplicitTimezone) {
    errors.push('OBSERVED_AT_MUST_BE_ISO8601_WITH_TIMEZONE');
  }
  if (errors.length) return { valid: false, errors };

  const observation = {
    patientId,
    metricCode: input.metricCode.trim().toUpperCase(),
    value,
    unit: normalizeUnit(input.unit),
    observedAt: observedDate.toISOString(),
    sourceType: input.sourceType,
    sourceReference: input.sourceReference.trim(),
    receivedAt: now.toISOString(),
    rulesetVersion: RULESET_VERSION,
  };

  const fingerprintPayload = JSON.stringify({
    patientId: observation.patientId,
    metricCode: observation.metricCode,
    value: observation.value,
    unit: observation.unit,
    observedAt: observation.observedAt,
  });
  observation.fingerprint = crypto.createHash('sha256').update(fingerprintPayload).digest('hex');

  return { valid: true, observation, errors: [] };
}

function evaluateObservation(input, existingRecords = [], now = new Date()) {
  const parsed = parseObservation(input, now);
  if (!parsed.valid) {
    return {
      status: 'INVALID',
      rulesetVersion: RULESET_VERSION,
      reasonCodes: parsed.errors,
      matchedRecordIds: [],
    };
  }

  const candidate = parsed.observation;
  const matchingGroup = existingRecords.filter((record) => {
    const existingDate = new Date(record.observedAt);
    return Number(record.patientId) === candidate.patientId
      && String(record.metricCode || '').trim().toUpperCase() === candidate.metricCode
      && !Number.isNaN(existingDate.getTime())
      && existingDate.toISOString() === candidate.observedAt;
  });

  let status = 'NEW';
  let reasonCodes = ['NO_MATCHING_OBSERVATION_GROUP'];
  let matchedRecordIds = [];

  if (matchingGroup.length) {
    matchedRecordIds = matchingGroup
      .map((record) => record.id)
      .filter((id) => id !== undefined && id !== null);
    const exactMatch = matchingGroup.some((record) =>
      Number(record.value) === candidate.value
      && normalizeUnit(String(record.unit || '')) === candidate.unit
    );

    if (exactMatch) {
      status = 'DUPLICATE_CANDIDATE';
      reasonCodes = ['SAME_PATIENT_METRIC_TIME_VALUE_AND_UNIT'];
    } else {
      status = 'CONFLICT_REVIEW_REQUIRED';
      reasonCodes = ['SAME_PATIENT_METRIC_TIME_DIFFERENT_VALUE_OR_UNIT'];
    }
  }

  return {
    status,
    rulesetVersion: RULESET_VERSION,
    reasonCodes,
    matchedRecordIds,
    observation: candidate,
  };
}

module.exports = { RULESET_VERSION, SOURCE_TYPES: [...SOURCE_TYPES], normalizeUnit, parseObservation, evaluateObservation };
