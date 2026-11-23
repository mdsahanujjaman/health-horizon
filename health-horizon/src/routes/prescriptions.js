const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Prescription, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }];

router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        const doctorObj = await Doctor.findOne({ where: { userId: req.user.id } });
        if (!doctorObj) return res.status(404).json({ message: 'Doctor clinical profile not found.' });

        const patientId = Number(String(req.body.patientId || '').replace(/\D/g, ''));
        if (!Number.isSafeInteger(patientId) || patientId <= 0) {
            return res.status(400).json({ message: 'A valid patientId is required.' });
        }
        const patient = await Patient.findByPk(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient profile not found.' });

        // Never accept client-supplied doctor identity or patient demographic edits.
        const payload = { ...req.body };
        delete payload.doctorId;
        delete payload.patientName;
        delete payload.internalObservations;
        payload.patientId = patientId;
        payload.doctorId = doctorObj.id;

        const created = await Prescription.create(payload);
        const record = await Prescription.findByPk(created.id, { include: inc });
        const json = record.toJSON();
        json.patientName = record.patient?.user?.fullName || `Patient HH-PAT-${record.patientId}`;
        return res.status(201).json(json);
    } catch (err) { return next(err); }
});

router.get('/my', authenticate, async (req, res, next) => {
    try {
        let where;
        if (req.user.role === 'DOCTOR') {
            const doctorObj = await Doctor.findOne({ where: { userId: req.user.id } });
            if (!doctorObj) return res.json([]);
            where = { doctorId: doctorObj.id };
        } else if (req.user.role === 'PATIENT') {
            const patient = await Patient.findOne({ where: { userId: req.user.id } });
            if (!patient) return res.json([]);
            where = { patientId: patient.id };
        } else if (req.user.role === 'ADMIN') {
            where = {};
        } else {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        const prescriptions = await Prescription.findAll({ where, include: inc });
        return res.json(prescriptions.map((p) => {
            const json = p.toJSON();
            json.patientName = p.patient?.user?.fullName || `Patient HH-PAT-${p.patientId}`;
            if (req.user.role === 'PATIENT') delete json.internalObservations;
            return json;
        }));
    } catch (err) { return next(err); }
});

// Until clinician assignment checks are implemented, cross-patient prescription
// lookup is restricted to administrators.
router.get('/patient/:patientId', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const list = await Prescription.findAll({ where: { patientId: req.params.patientId }, include: inc });
        return res.json(list.map((p) => {
            const json = p.toJSON();
            json.patientName = p.patient?.user?.fullName || `Patient HH-PAT-${p.patientId}`;
            return json;
        }));
    } catch (err) { return next(err); }
});

module.exports = router;
