const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { User, Doctor } = require('../models/index');

router.post('/register', async (req, res, next) => {
    try {
        const { fullName, email, password, role = 'PATIENT', specialization } = req.body;
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email already in use' });
        const hashed = await bcrypt.hash(password, 10);
        const verificationStatus = (role === 'PATIENT' || role === 'CAREGIVER') ? 'VERIFIED' : 'PENDING';
        const user = await User.create({ fullName, email, password: hashed, role, verificationStatus });
        if (role === 'DOCTOR') {
            await Doctor.create({ userId: user.id, specialization: specialization || 'MBBS', isVerified: false });
        }
        const token = generateToken(user);
        res.json({ token, userId: user.id, fullName: user.fullName, role: user.role, verificationStatus: user.verificationStatus });
    } catch (err) { next(err); }
});

router.post('/authenticate', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = generateToken(user);
        res.json({ token, userId: user.id, fullName: user.fullName, role: user.role, profilePictureUrl: user.profilePictureUrl, verificationStatus: user.verificationStatus });
    } catch (err) { next(err); }
});

module.exports = router;
