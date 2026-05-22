const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { Prescription, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }];

router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        const doctorObj = await Doctor.findOne({ where: { userId: req.user.id } });
        if (!doctorObj) {
            return res.status(400).json({ message: 'Doctor clinical profile not found.' });
        }
        req.body.doctorId = doctorObj.id;

        if (req.body.patientId) {
            req.body.patientId = String(req.body.patientId).replace(/\D/g, '');
        }
        if (req.body.patientId && req.body.patientName) {
            const patient = await Patient.findByPk(req.body.patientId);
            if (patient) {
                const userObj = await User.findByPk(patient.userId);
                if (userObj && userObj.fullName !== req.body.patientName) {
                    userObj.fullName = req.body.patientName;
                    await userObj.save();
                }
            }
        }
        const p = await Prescription.create(req.body);
        const created = await Prescription.findByPk(p.id, { include: inc });
        const json = created.toJSON();
        json.patientName = created.patient?.user?.fullName || `Patient HH-PAT-${created.patientId}`;
        res.json(json);
    } catch (err) { next(err); }
});
router.get('/my', authenticate, async (req, res, next) => {
    try {
        if (req.user.role === 'DOCTOR') {
            const doctorObj = await Doctor.findOne({ where: { userId: req.user.id } });
            if (!doctorObj) return res.json([]);
            const prescriptions = await Prescription.findAll({ where: { doctorId: doctorObj.id }, include: inc });
            return res.json(prescriptions.map(p => {
                const json = p.toJSON();
                json.patientName = p.patient?.user?.fullName || `Patient HH-PAT-${p.patientId}`;
                return json;
            }));
        } else {
            const patient = await Patient.findOne({ where: { userId: req.user.id } });
            if (!patient) return res.json([]);
            const prescriptions = await Prescription.findAll({ where: { patientId: patient.id }, include: inc });
            return res.json(prescriptions.map(p => {
                const json = p.toJSON();
                json.patientName = p.patient?.user?.fullName || `Patient HH-PAT-${p.patientId}`;
                if (req.user.role === 'PATIENT') delete json.internalObservations;
                return json;
            }));
        }
    } catch (err) { next(err); }
});
router.get('/patient/:patientId', authenticate, authorize('DOCTOR', 'ADMIN'), async (req, res, next) => {
    try {
        const list = await Prescription.findAll({ where: { patientId: req.params.patientId }, include: inc });
        res.json(list.map(p => {
            const json = p.toJSON();
            json.patientName = p.patient?.user?.fullName || `Patient HH-PAT-${p.patientId}`;
            return json;
        }));
    } catch (err) { next(err); }
});
module.exports = router;
