'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { RULESET_VERSION, parseObservation, evaluateObservation } = require('./reconciliationEngine');

const fixedNow = new Date('2026-11-22T12:00:00.000Z');
function validInput(overrides = {}) {
  return {
    patientId: 42,
    metricCode: 'glucose',
    value: 110,
    unit: 'mg/dL',
    observedAt: '2026-11-22T09:00:00+05:30',
    sourceType: 'PATIENT_ENTRY',
    sourceReference: 'synthetic-entry-001',
    ...overrides,
  };
}

test('parses valid observation and preserves provenance', () => {
  const result = parseObservation(validInput(), fixedNow);
  assert.equal(result.valid, true);
  assert.equal(result.observation.patientId, 42);
  assert.equal(result.observation.metricCode, 'GLUCOSE');
  assert.equal(result.observation.unit, 'mg/dl');
  assert.equal(result.observation.sourceReference, 'synthetic-entry-001');
  assert.equal(result.observation.rulesetVersion, RULESET_VERSION);
  assert.match(result.observation.fingerprint, /^[a-f0-9]{64}$/);
});

test('rejects a timezone-less timestamp', () => {
  const result = parseObservation(validInput({ observedAt: '2026-11-22T09:00:00' }), fixedNow);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('OBSERVED_AT_MUST_BE_ISO8601_WITH_TIMEZONE'));
});

test('rejects non-finite values', () => {
  const result = parseObservation(validInput({ value: 'NaN' }), fixedNow);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('VALUE_MUST_BE_FINITE_NUMBER'));
});

test('classifies no matching group as NEW', () => {
  assert.equal(evaluateObservation(validInput(), [], fixedNow).status, 'NEW');
});

test('classifies same value and unit at same time as duplicate candidate', () => {
  const existing = [{
    id: 7, patientId: 42, metricCode: 'GLUCOSE', value: 110, unit: 'MG/DL',
    observedAt: '2026-11-22T03:30:00.000Z',
  }];
  const result = evaluateObservation(validInput(), existing, fixedNow);
  assert.equal(result.status, 'DUPLICATE_CANDIDATE');
  assert.deepEqual(result.matchedRecordIds, [7]);
});

test('flags different value at same observation time for review', () => {
  const existing = [{
    id: 8, patientId: 42, metricCode: 'GLUCOSE', value: 180, unit: 'mg/dL',
    observedAt: '2026-11-22T03:30:00.000Z',
  }];
  const result = evaluateObservation(validInput(), existing, fixedNow);
  assert.equal(result.status, 'CONFLICT_REVIEW_REQUIRED');
  assert.deepEqual(result.matchedRecordIds, [8]);
});

test('does not compare records belonging to another patient', () => {
  const existing = [{
    id: 9, patientId: 99, metricCode: 'GLUCOSE', value: 180, unit: 'mg/dL',
    observedAt: '2026-11-22T03:30:00.000Z',
  }];
  assert.equal(evaluateObservation(validInput(), existing, fixedNow).status, 'NEW');
});

test('fingerprint is independent of source metadata', () => {
  const first = parseObservation(validInput(), fixedNow);
  const second = parseObservation(validInput({
    sourceType: 'LAB_REPORT', sourceReference: 'synthetic-lab-009',
  }), fixedNow);
  assert.equal(first.observation.fingerprint, second.observation.fingerprint);
});
