const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Patient, User } = require('../models/index');
const mapP = (p) => ({ id: p.id, userId: p.userId, fullName: p.user?.fullName, email: p.user?.email, dateOfBirth: p.dateOfBirth, gender: p.gender, bloodGroup: p.bloodGroup, address: p.address, emergencyContact: p.emergencyContact, height: p.height, weight: p.weight, medicalConditions: p.medicalConditions, beneficiaryName: p.beneficiaryName, calmMode: p.calmMode });
const incU = [{ model: User, as: 'user' }];
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const p = await Patient.findOne({ where: { userId: req.user.id }, include: incU });
        if (!p) return res.status(404).json({ message: 'Patient profile not found' });
        res.json(mapP(p));
    } catch (err) { next(err); }
});
router.post('/', authenticate, async (req, res, next) => {
    try {
        const [p] = await Patient.findOrCreate({ where: { userId: req.user.id }, defaults: { ...req.body, userId: req.user.id } });
        await p.update(req.body);
        res.json(mapP(await Patient.findOne({ where: { userId: req.user.id }, include: incU })));
    } catch (err) { next(err); }
});
module.exports = router;
