
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const { User, Doctor } = require('../models/index');

const PUBLIC_REGISTRATION_ROLES = new Set([
    'PATIENT',
    'CAREGIVER',
    'DOCTOR'
]);

router.post('/register', async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            password,
            role = 'PATIENT',
            specialization
        } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: 'Full name, email and password are required.'
            });
        }

        if (typeof role !== 'string' ||
            !PUBLIC_REGISTRATION_ROLES.has(role)) {
            return res.status(403).json({
                message: 'This account role cannot be registered publicly.'
            });
        }

        if (typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof fullName !== 'string') {
            return res.status(400).json({
                message: 'Invalid registration details.'
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                message: 'Password must contain between 8 and 72 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await User.findOne({
            where: { email: normalizedEmail }
        });

        if (existing) {
            return res.status(409).json({
                message: 'Email already in use.'
            });
        }

        const hashed = await bcrypt.hash(password, 12);

        const verificationStatus =
            role === 'PATIENT' || role === 'CAREGIVER'
                ? 'VERIFIED'
                : 'PENDING';

        const user = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashed,
            role,
            verificationStatus
        });

        if (role === 'DOCTOR') {
            try {
                await Doctor.create({
                    userId: user.id,
                    specialization: specialization || 'MBBS',
                    isVerified: false
                });
            } catch (err) {
                await user.destroy();
                throw err;
            }
        }

        const token = generateToken(user);

        return res.status(201).json({
            token,
            userId: user.id,
            fullName: user.fullName,
            role: user.role,
            verificationStatus: user.verificationStatus
        });
    } catch (err) {
        next(err);
    }
});

router.post('/authenticate', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' ||
            typeof password !== 'string') {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials.'
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({
                message: 'Invalid credentials.'
            });
        }

        const token = generateToken(user);

        return res.json({
            token,
            userId: user.id,
            fullName: user.fullName,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            verificationStatus: user.verificationStatus
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
