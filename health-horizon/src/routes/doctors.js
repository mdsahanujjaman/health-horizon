
const router = require('express').Router();
const { Op } = require('sequelize');

const { authenticate, authorize } = require('../middleware/auth');

const {
    upload,
    validateUploadedFile
} = require('../middleware/upload');

const {
    deleteStoredFile
} = require('../config/storage');

const { Doctor, User } = require('../models/index');

const incU = [
    {
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
    }
];

// Public doctor information only.
// Private credential storage paths are deliberately excluded.
const mapD = (d) => ({
    id: d.id,
    userId: d.userId,
    fullName: d.user?.fullName,
    specialization: d.specialization,
    experienceYears: d.experienceYears,
    hospitalName: d.hospitalName,
    bio: d.bio,
    consultationFee: d.consultationFee,
    profilePictureUrl: d.user?.profilePictureUrl,
    isVerified: d.isVerified
});

// Create or update the authenticated doctor's profile.
router.post(
    '/',
    authenticate,
    authorize('DOCTOR'),
    async (req, res, next) => {
        try {
            const {
                fullName,
                phoneNumber,
                specialization,
                experienceYears,
                hospitalName,
                bio,
                consultationFee
            } = req.body;

            const doctorData = {};

            if (specialization !== undefined)
                doctorData.specialization = specialization;

            if (experienceYears !== undefined)
                doctorData.experienceYears = experienceYears;

            if (hospitalName !== undefined)
                doctorData.hospitalName = hospitalName;

            if (bio !== undefined)
                doctorData.bio = bio;

            if (consultationFee !== undefined)
                doctorData.consultationFee = consultationFee;

            let doctor = await Doctor.findOne({
                where: { userId: req.user.id }
            });

            if (doctor) {
                await doctor.update(doctorData);
            } else {
                doctor = await Doctor.create({
                    ...doctorData,
                    userId: req.user.id
                });
            }

            if (fullName !== undefined || phoneNumber !== undefined) {
                const user = await User.findByPk(req.user.id);

                if (user) {
                    if (typeof fullName === 'string') {
                        user.fullName = fullName.trim();
                    }

                    if (typeof phoneNumber === 'string') {
                        user.phoneNumber = phoneNumber;
                    }

                    await user.save();
                }
            }

            doctor = await Doctor.findOne({
                where: { userId: req.user.id },
                include: incU
            });

            return res.json(mapD(doctor));
        } catch (err) {
            next(err);
        }
    }
);

// Authenticated doctor's own profile.
router.get('/me', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({
            where: { userId: req.user.id },
            include: incU
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor profile not found.'
            });
        }

        return res.json(mapD(doctor));
    } catch (err) {
        next(err);
    }
});

// Verified doctors only.
router.get('/', authenticate, async (req, res, next) => {
    try {
        const doctors = await Doctor.findAll({
            where: { isVerified: true },
            include: incU
        });

        return res.json(doctors.map(mapD));
    } catch (err) {
        next(err);
    }
});

// Search verified doctors.
router.get('/search', authenticate, async (req, res, next) => {
    try {
        const {
            name,
            specialization,
            hospitalName,
            minExperience
        } = req.query;

        const where = { isVerified: true };

        if (specialization) {
            where.specialization = {
                [Op.iLike]: `%${specialization}%`
            };
        }

        if (hospitalName) {
            where.hospitalName = {
                [Op.iLike]: `%${hospitalName}%`
            };
        }

        if (minExperience !== undefined) {
            const experience = Number(minExperience);

            if (!Number.isFinite(experience) || experience < 0) {
                return res.status(400).json({
                    message: 'Invalid minimum experience.'
                });
            }

            where.experienceYears = {
                [Op.gte]: experience
            };
        }

        const userInclude = {
            model: User,
            as: 'user',
            required: Boolean(name),
            attributes: { exclude: ['password'] }
        };

        if (name) {
            userInclude.where = {
                fullName: { [Op.iLike]: `%${name}%` }
            };
        }

        const doctors = await Doctor.findAll({
            where,
            include: [userInclude]
        });

        return res.json(doctors.map(mapD));
    } catch (err) {
        next(err);
    }
});

// Doctor details.
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({
            where: {
                id: req.params.id,
                isVerified: true
            },
            include: incU
        });

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor not found.'
            });
        }

        return res.json(mapD(doctor));
    } catch (err) {
        next(err);
    }
});

// Upload private doctor credentials.
router.post(
    '/upload-credential',
    authenticate,
    authorize('DOCTOR'),
    upload.single('file'),
    validateUploadedFile('doctorCredential'),
    async (req, res, next) => {
        let storageKey;

        try {
            if (!req.uploadedFile) {
                return res.status(400).json({
                    message: 'No credential file uploaded.'
                });
            }

            storageKey = req.uploadedFile.storageKey;

            const doctor = await Doctor.findOne({
                where: { userId: req.user.id }
            });

            if (!doctor) {
                await deleteStoredFile(storageKey);
                storageKey = null;

                return res.status(404).json({
                    message: 'Doctor profile not found.'
                });
            }

            doctor.credentialUrl = storageKey;
            await doctor.save();

            return res.status(201).json({
                message: 'Credential uploaded successfully.'
            });
        } catch (err) {
            if (storageKey) {
                await deleteStoredFile(storageKey).catch(() => { });
            }

            next(err);
        }
    }
);

module.exports = router;
