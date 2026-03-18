const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { LabTest, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }];

router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try { const t = await LabTest.create({ ...req.body, status: 'REQUESTED' }); res.json(await LabTest.findByPk(t.id, { include: inc })); } catch (err) { next(err); }
});
router.get('/my', authenticate, async (req, res, next) => {
    try { const p = await Patient.findOne({ where: { userId: req.user.id } }); if (!p) return res.json([]); res.json(await LabTest.findAll({ where: { patientId: p.id }, include: inc })); } catch (err) { next(err); }
});
router.get('/pending', authenticate, authorize('LAB_TECHNICIAN', 'ADMIN'), async (req, res, next) => {
    try { res.json(await LabTest.findAll({ where: { status: 'REQUESTED' }, include: inc })); } catch (err) { next(err); }
});
router.put('/:id/status', authenticate, async (req, res, next) => {
    try { const t = await LabTest.findByPk(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' }); t.status = req.body.status || req.query.status; await t.save(); res.json(t); } catch (err) { next(err); }
});
router.post('/:id/upload-report', authenticate, authorize('LAB_TECHNICIAN', 'ADMIN'), upload.single('file'), async (req, res, next) => {
    try { const t = await LabTest.findByPk(req.params.id); if (!t) return res.status(404).json({ message: 'Not found' }); t.labReportUrl = `/api/v1/files/${req.file.filename}`; t.status = 'COMPLETED'; await t.save(); res.json(t); } catch (err) { next(err); }
});
module.exports = router;
