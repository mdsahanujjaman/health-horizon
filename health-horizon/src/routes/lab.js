const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { LabTest, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }];

router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try { const t = await LabTest.create({ ...req.body, status: 'REQUESTED' }); res.json(await LabTest.findByPk(t.id, { include: inc })); } catch (err) { next(err); }
});

router.post('/request', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        let pId = req.body.patientId;
        if (typeof pId === 'string') {
            // Strip any non-digit characters, e.g. "HH-PAT-1" -> "1"
            pId = pId.replace(/\D/g, '');
        }
        
        const patientIdInt = parseInt(pId, 10);
        if (isNaN(patientIdInt)) {
            return res.status(400).json({ message: 'Invalid Patient Identifier format. Must contain a numeric patient ID.' });
        }

        // Verify if patient exists
        const patientExists = await Patient.findByPk(patientIdInt);
        if (!patientExists) {
            return res.status(404).json({ message: `Patient with ID HH-PAT-${patientIdInt} not found in database.` });
        }

        const t = await LabTest.create({
            patientId: patientIdInt,
            doctorId: req.body.doctorId,
            testName: req.body.testType || req.body.testName,
            clinicalReason: req.body.instruction || req.body.clinicalReason,
            status: 'REQUESTED'
        });
        res.json(await LabTest.findByPk(t.id, { include: inc }));
    } catch (err) { next(err); }
});

router.post('/upload/:id', authenticate, authorize('LAB_TECHNICIAN', 'ADMIN'), async (req, res, next) => {
    try {
        const t = await LabTest.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: 'Not found' });
        t.labReportUrl = req.query.reportUrl || req.body.reportUrl;
        t.status = 'COMPLETED';
        await t.save();
        res.json(t);
    } catch (err) { next(err); }
});

router.post('/verify/:id', authenticate, authorize('RECORD_HANDLER', 'ADMIN'), async (req, res, next) => {
    try {
        const t = await LabTest.findByPk(req.params.id);
        if (!t) return res.status(404).json({ message: 'Not found' });
        t.status = 'VERIFIED';
        t.verifiedBy = req.query.verifierName || req.body.verifierName || 'Governance Handler';
        t.verifiedAt = new Date();
        await t.save();
        res.json(t);
    } catch (err) { next(err); }
});

router.get('/doctor/my', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        const d = await Doctor.findOne({ where: { userId: req.user.id } });
        if (!d) return res.status(404).json({ message: 'Doctor profile not found' });
        res.json(await LabTest.findAll({ where: { doctorId: d.id }, include: inc }));
    } catch (err) { next(err); }
});

router.get('/my', authenticate, async (req, res, next) => {
    try { const p = await Patient.findOne({ where: { userId: req.user.id } }); if (!p) return res.json([]); res.json(await LabTest.findAll({ where: { patientId: p.id }, include: inc })); } catch (err) { next(err); }
});
router.get('/patient/:patientId', authenticate, async (req, res, next) => {
    try { res.json(await LabTest.findAll({ where: { patientId: req.params.patientId }, include: inc })); } catch (err) { next(err); }
});
router.get('/pending', authenticate, authorize('LAB_TECHNICIAN', 'ADMIN'), async (req, res, next) => {
    try { res.json(await LabTest.findAll({ where: { status: 'REQUESTED' }, include: inc })); } catch (err) { next(err); }
});
router.get('/to-verify', authenticate, authorize('RECORD_HANDLER', 'ADMIN'), async (req, res, next) => {
    try { res.json(await LabTest.findAll({ where: { status: 'COMPLETED' }, include: inc })); } catch (err) { next(err); }
});
router.put('/:id/status', authenticate, async (req, res, next) => {
    try { const t = await LabTest.findByPk(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' }); t.status = req.body.status || req.query.status; await t.save(); res.json(t); } catch (err) { next(err); }
});
router.post('/:id/upload-report', authenticate, authorize('LAB_TECHNICIAN', 'ADMIN'), upload.single('file'), async (req, res, next) => {
    try { const t = await LabTest.findByPk(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' }); t.labReportUrl = `/api/v1/files/${req.file.filename}`; t.status = 'COMPLETED'; await t.save(); res.json(t); } catch (err) { next(err); }
});
module.exports = router;
