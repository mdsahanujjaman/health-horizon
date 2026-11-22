'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { Patient, ClinicalObservation } = require('../models');
const { evaluateObservation } = require('../services/clinicalIntegrity/reconciliationEngine');

// A patient may submit only to their own profile. Admin ingestion is permitted
// for controlled back-office workflows. Other roles are intentionally excluded
// until a verified clinician-to-patient assignment check exists.
router.post('/observations', authenticate, async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const input = { ...req.body };
    const requestedPatientId = Number(input.patientId);

    if (!Number.isSafeInteger(requestedPatientId) || requestedPatientId <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'A valid patientId is required.' });
    }

    if (req.user.role === 'PATIENT') {
      const ownPatient = await Patient.findOne({
        where: { userId: req.user.id },
        transaction,
      });
      if (!ownPatient || Number(ownPatient.id) !== requestedPatientId) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Patients may submit observations only to their own profile.' });
      }
    } else if (req.user.role !== 'ADMIN') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Only the patient or an administrator may submit this observation.' });
    }

    const patientExists = await Patient.findByPk(requestedPatientId, { transaction });
    if (!patientExists) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Patient profile not found.' });
    }

    // Validate before passing user-controlled timestamps to Sequelize.
    const preliminary = evaluateObservation(input, []);
    if (preliminary.status === 'INVALID') {
      await transaction.rollback();
      return res.status(400).json({
        status: preliminary.status,
        reasonCodes: preliminary.reasonCodes,
        rulesetVersion: preliminary.rulesetVersion,
      });
    }

    const existing = await ClinicalObservation.findAll({
      where: {
        patientId: preliminary.observation.patientId,
        metricCode: preliminary.observation.metricCode,
        observedAt: preliminary.observation.observedAt,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const result = evaluateObservation(input, existing.map((record) => record.toJSON()));
    if (result.status === 'INVALID') {
      await transaction.rollback();
      return res.status(400).json({
        status: result.status,
        reasonCodes: result.reasonCodes,
        rulesetVersion: result.rulesetVersion,
      });
    }

    const saved = await ClinicalObservation.create({
      patientId: result.observation.patientId,
      metricCode: result.observation.metricCode,
      value: result.observation.value,
      unit: result.observation.unit,
      observedAt: result.observation.observedAt,
      sourceType: result.observation.sourceType,
      sourceReference: result.observation.sourceReference,
      receivedAt: result.observation.receivedAt,
      rulesetVersion: result.rulesetVersion,
      fingerprint: result.observation.fingerprint,
      reconciliationStatus: result.status,
      reasonCodes: result.reasonCodes,
      matchedRecordIds: result.matchedRecordIds,
    }, { transaction });

    await transaction.commit();
    return res.status(201).json({
      id: saved.id,
      status: result.status,
      reasonCodes: result.reasonCodes,
      matchedRecordIds: result.matchedRecordIds,
      rulesetVersion: result.rulesetVersion,
      fingerprint: result.observation.fingerprint,
      message: result.status === 'CONFLICT_REVIEW_REQUIRED'
        ? 'Observation stored; conflicting record requires authorised human review.'
        : result.status === 'DUPLICATE_CANDIDATE'
          ? 'Observation stored as a duplicate candidate; no source record was overwritten.'
          : 'Observation stored.',
    });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    return next(error);
  }
});

// Only the patient concerned or an administrator can inspect this history.
// Clinician access will be added only after assignment-based authorization exists.
router.get('/observations/my', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({ message: 'This endpoint is for the authenticated patient.' });
    }
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found.' });

    const records = await ClinicalObservation.findAll({
      where: { patientId: patient.id },
      order: [['observedAt', 'DESC'], ['id', 'DESC']],
      attributes: [
        'id', 'metricCode', 'value', 'unit', 'observedAt', 'sourceType',
        'sourceReference', 'receivedAt', 'rulesetVersion', 'fingerprint',
        'reconciliationStatus', 'reasonCodes', 'matchedRecordIds',
      ],
    });
    return res.json(records);
  } catch (error) {
    return next(error);
  }
});

router.get('/observations/patient/:patientId', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const records = await ClinicalObservation.findAll({
      where: { patientId: req.params.patientId },
      order: [['observedAt', 'DESC'], ['id', 'DESC']],
    });
    return res.json(records);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
