const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { User, Doctor } = require('../models/index');

router.post('/register', async (req, res, next) => {
    try {
        const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;
        // Public registration must never grant privileged roles. Staff accounts
        // are provisioned through a trusted administrative workflow.
        const role = 'PATIENT';
        if (!fullName || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Valid fullName and email are required.' });
        }
        if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
            return res.status(400).json({ message: 'Password must be between 10 and 128 characters.' });
        }
        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(409).json({ message: 'Email already in use' });
        const hashed = await bcrypt.hash(password, 12);
        const user = await User.create({
            fullName, email, password: hashed, role, verificationStatus: 'VERIFIED'
        });
        const token = generateToken(user);
        return res.status(201).json({
            token, userId: user.id, fullName: user.fullName,
            role: user.role, verificationStatus: user.verificationStatus
        });
    } catch (err) { return next(err); }
});

router.post('/authenticate', async (req, res, next) => {
    try {
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = req.body.password;
        if (!email || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = generateToken(user);
        return res.json({
            token, userId: user.id, fullName: user.fullName,
            role: user.role, profilePictureUrl: user.profilePictureUrl,
            verificationStatus: user.verificationStatus
        });
    } catch (err) { return next(err); }
});

module.exports = router;
