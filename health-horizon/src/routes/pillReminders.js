const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { PillReminder, Patient } = require('../models/index');
router.get('/my', authenticate, async (req, res, next) => {
    try { const p = await Patient.findOne({ where: { userId: req.user.id } }); if (!p) return res.json([]); res.json(await PillReminder.findAll({ where: { patientId: p.id, isActive: true } })); } catch (err) { next(err); }
});
router.post('/', authenticate, async (req, res, next) => {
    try { const p = await Patient.findOne({ where: { userId: req.user.id } }); if (!p) return res.status(404).json({ message: 'Patient not found' }); res.json(await PillReminder.create({ ...req.body, patientId: p.id, isActive: true })); } catch (err) { next(err); }
});
router.delete('/:id', authenticate, async (req, res, next) => {
    try { const r = await PillReminder.findByPk(req.params.id); if (!r) return res.status(404).json({ message: 'Not found' }); r.isActive = false; await r.save(); res.json({ message: 'Deactivated' }); } catch (err) { next(err); }
});
module.exports = router;
