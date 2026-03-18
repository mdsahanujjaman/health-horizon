const router = require('express').Router();
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Doctor, User } = require('../models/index');
const mapD = (d) => ({ id: d.id, userId: d.userId, fullName: d.user?.fullName, specialization: d.specialization, experienceYears: d.experienceYears, hospitalName: d.hospitalName, bio: d.bio, consultationFee: d.consultationFee, profilePictureUrl: d.user?.profilePictureUrl, credentialUrl: d.credentialUrl, isVerified: d.isVerified });
const incU = [{ model: User, as: 'user' }];

router.post('/', authenticate, async (req, res, next) => {
    try {
        let d = await Doctor.findOne({ where: { userId: req.user.id }, include: incU });
        if (d) { await d.update(req.body); return res.json(mapD(await Doctor.findOne({ where: { userId: req.user.id }, include: incU }))); }
        const created = await Doctor.create({ ...req.body, userId: req.user.id });
        res.json(mapD(await Doctor.findByPk(created.id, { include: incU })));
    } catch (err) { next(err); }
});
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const d = await Doctor.findOne({ where: { userId: req.user.id }, include: incU });
        if (!d) return res.status(404).json({ message: 'Doctor profile not found' });
        res.json(mapD(d));
    } catch (err) { next(err); }
});
router.get('/', authenticate, async (req, res, next) => {
    try {
        res.json((await Doctor.findAll({ where: { isVerified: true }, include: incU })).map(mapD));
    } catch (err) { next(err); }
});
router.get('/search', authenticate, async (req, res, next) => {
    try {
        const { name, specialization, hospitalName, minExperience } = req.query;
        const where = {};
        if (specialization) where.specialization = { [Op.iLike]: `%${specialization}%` };
        if (hospitalName) where.hospitalName = { [Op.iLike]: `%${hospitalName}%` };
        if (minExperience) where.experienceYears = { [Op.gte]: parseInt(minExperience) };

        // Use LEFT JOIN so no-name-filter queries still return all verified doctors
        const userInclude = { model: User, as: 'user', required: !!name };
        if (name) userInclude.where = { fullName: { [Op.iLike]: `%${name}%` } };

        const doctors = await Doctor.findAll({ where, include: [userInclude] });
        res.json(doctors.map(mapD));
    } catch (err) { next(err); }
});
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const d = await Doctor.findByPk(req.params.id, { include: incU });
        if (!d) return res.status(404).json({ message: 'Doctor not found' });
        res.json(mapD(d));
    } catch (err) { next(err); }
});
router.post('/upload-credential', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        const d = await Doctor.findOne({ where: { userId: req.user.id } });
        if (!d) return res.status(404).json({ message: 'Doctor profile not found' });
        d.credentialUrl = `/api/v1/files/${req.file.filename}`;
        await d.save();
        res.json(d.credentialUrl);
    } catch (err) { next(err); }
});
module.exports = router;
