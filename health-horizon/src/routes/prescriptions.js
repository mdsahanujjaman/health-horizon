const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Prescription, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }];

router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try { const p = await Prescription.create(req.body); res.json(await Prescription.findByPk(p.id, { include: inc })); } catch (err) { next(err); }
});
router.get('/my', authenticate, async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.json([]);
        const prescriptions = await Prescription.findAll({ where: { patientId: patient.id }, include: inc });
        res.json(prescriptions.map(p => { const json = p.toJSON(); if (req.user.role === 'PATIENT') delete json.internalObservations; return json; }));
    } catch (err) { next(err); }
});
router.get('/patient/:patientId', authenticate, authorize('DOCTOR', 'ADMIN'), async (req, res, next) => {
    try { res.json(await Prescription.findAll({ where: { patientId: req.params.patientId }, include: inc })); } catch (err) { next(err); }
});
module.exports = router;
