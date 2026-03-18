const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { User, Doctor } = require('../models/index');

router.get('/users/pending', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const users = await User.findAll({ where: { verificationStatus: 'PENDING' } });
        res.json(users.map(u => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, profilePictureUrl: u.profilePictureUrl, verificationStatus: u.verificationStatus })));
    } catch (err) { next(err); }
});

router.put('/users/:id/verify', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.verificationStatus = 'VERIFIED';
        await user.save();
        if (user.role === 'DOCTOR') {
            const doctor = await Doctor.findOne({ where: { userId: user.id } });
            if (doctor) { doctor.isVerified = true; await doctor.save(); }
        }
        res.json({ message: 'User verified' });
    } catch (err) { next(err); }
});

router.put('/users/:id/reject', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.verificationStatus = 'REJECTED';
        await user.save();
        res.json({ message: 'User rejected' });
    } catch (err) { next(err); }
});

router.get('/doctors/pending', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const doctors = await Doctor.findAll({ where: { isVerified: false }, include: [{ model: User, as: 'user' }] });
        res.json(doctors.map(d => ({ id: d.id, fullName: d.user?.fullName, specialization: d.specialization, experienceYears: d.experienceYears, hospitalName: d.hospitalName, bio: d.bio, consultationFee: d.consultationFee, profilePictureUrl: d.user?.profilePictureUrl, isVerified: d.isVerified })));
    } catch (err) { next(err); }
});

router.put('/doctors/:id/verify', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        doctor.isVerified = true;
        await doctor.save();
        if (doctor.user) { doctor.user.verificationStatus = 'VERIFIED'; await doctor.user.save(); }
        res.json({ message: 'Doctor verified' });
    } catch (err) { next(err); }
});

module.exports = router;
