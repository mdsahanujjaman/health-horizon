'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClinicalObservation = sequelize.define('ClinicalObservation', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
  metricCode: { type: DataTypes.STRING(80), allowNull: false, field: 'metric_code' },
  value: { type: DataTypes.DOUBLE, allowNull: false },
  unit: { type: DataTypes.STRING(40), allowNull: false },
  observedAt: { type: DataTypes.DATE, allowNull: false, field: 'observed_at' },
  sourceType: { type: DataTypes.STRING(32), allowNull: false, field: 'source_type' },
  sourceReference: { type: DataTypes.STRING(160), allowNull: false, field: 'source_reference' },
  receivedAt: { type: DataTypes.DATE, allowNull: false, field: 'received_at' },
  rulesetVersion: { type: DataTypes.STRING(20), allowNull: false, field: 'ruleset_version' },
  fingerprint: { type: DataTypes.STRING(64), allowNull: false },
  reconciliationStatus: { type: DataTypes.STRING(32), allowNull: false, field: 'reconciliation_status' },
  reasonCodes: { type: DataTypes.JSONB, allowNull: false, field: 'reason_codes' },
  matchedRecordIds: { type: DataTypes.JSONB, allowNull: false, field: 'matched_record_ids' },
}, {
  tableName: 'clinical_observations',
  timestamps: true,
  indexes: [
    { fields: ['patient_id', 'metric_code', 'observed_at'] },
    { fields: ['fingerprint'] },
    { fields: ['reconciliation_status'] },
  ],
});

module.exports = ClinicalObservation;
