const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { CounselingReferral, Patient, Doctor, User } = require('../models/index');
const inc = [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }, { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] }, { model: User, as: 'counselor' }];
router.post('/', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try { const r = await CounselingReferral.create({ ...req.body, status: 'PENDING' }); res.json(await CounselingReferral.findByPk(r.id, { include: inc })); } catch (err) { next(err); }
});
router.get('/my', authenticate, async (req, res, next) => {
    try { const p = await Patient.findOne({ where: { userId: req.user.id } }); if (!p) return res.json([]); res.json(await CounselingReferral.findAll({ where: { patientId: p.id }, include: inc })); } catch (err) { next(err); }
});
router.put('/:id/status', authenticate, authorize('COUNSELOR', 'DOCTOR', 'ADMIN'), async (req, res, next) => {
    try { const r = await CounselingReferral.findByPk(req.params.id); if (!r) return res.status(404).json({ message: 'Not found' }); r.status = req.body.status; if (req.body.sessionNotes) r.sessionNotes = req.body.sessionNotes; await r.save(); res.json(r); } catch (err) { next(err); }
});
module.exports = router;
