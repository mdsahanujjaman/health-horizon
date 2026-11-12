
const router = require('express').Router();
const path = require('path');
const fs = require('fs/promises');

const { Op } = require('sequelize');

const {
    authenticate,
    authorize
} = require('../middleware/auth');

const {
    upload,
    validateUploadedFile
} = require('../middleware/upload');

const {
    saveUploadedFile,
    resolveStoredFile,
    deleteStoredFile
} = require('../config/storage');

const {
    LabTest,
    Patient,
    Doctor,
    User
} = require('../models/index');

// Only return safe user information.
const inc = [
    {
        model: Patient,
        as: 'patient',
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'role', 'profilePictureUrl']
        }]
    },
    {
        model: Doctor,
        as: 'doctor',
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'role', 'profilePictureUrl']
        }]
    }
];

// Never expose private storage keys in API responses.
const mapLabTest = (test) => {
    const data = test.toJSON();

    data.hasReport = Boolean(data.labReportUrl);
    data.labReportUrl = data.labReportUrl
        ? `/api/v1/lab/${data.id}/report`
        : null;

    return data;
};

const mapLabTests = (tests) => tests.map(mapLabTest);

const getDoctor = async (userId) => {
    return Doctor.findOne({
        where: { userId }
    });
};

const getPatient = async (userId) => {
    return Patient.findOne({
        where: { userId }
    });
};

const getLabTestAccess = async (test, user) => {
    if (user.role === 'ADMIN' ||
        user.role === 'LAB_TECHNICIAN' ||
        user.role === 'RECORD_HANDLER') {
        return true;
    }

    if (user.role === 'PATIENT') {
        const patient = await getPatient(user.id);

        return Boolean(
            patient &&
            String(patient.id) === String(test.patientId)
        );
    }

    if (user.role === 'DOCTOR') {
        const doctor = await getDoctor(user.id);

        return Boolean(
            doctor &&
            String(doctor.id) === String(test.doctorId)
        );
    }

    return false;
};

// Create a laboratory request using authenticated doctor identity.
const createLabRequest = async (req, res) => {
    const rawPatientId = req.body.patientId;

    let patientId;

    if (typeof rawPatientId === 'number') {
        patientId = rawPatientId;
    } else if (
        typeof rawPatientId === 'string' &&
        /^(\d+|HH-PAT-\d+)$/i.test(rawPatientId.trim())
    ) {
        patientId = Number(
            rawPatientId.replace(/^HH-PAT-/i, '')
        );
    }

    if (!Number.isSafeInteger(patientId) || patientId <= 0) {
        return res.status(400).json({
            message: 'Invalid patient identifier.'
        });
    }

    const doctor = await getDoctor(req.user.id);

    if (!doctor) {
        return res.status(404).json({
            message: 'Doctor profile not found.'
        });
    }

    const patient = await Patient.findByPk(patientId);

    if (!patient) {
        return res.status(404).json({
            message: 'Patient not found.'
        });
    }

    const testName = req.body.testType || req.body.testName;
    const clinicalReason =
        req.body.instruction || req.body.clinicalReason;

    if (
        typeof testName !== 'string' ||
        !testName.trim()
    ) {
        return res.status(400).json({
            message: 'Test name is required.'
        });
    }

    const test = await LabTest.create({
        patientId: patient.id,
        doctorId: doctor.id,
        testName: testName.trim(),
        clinicalReason:
            typeof clinicalReason === 'string'
                ? clinicalReason.trim()
                : null,
        status: 'REQUESTED'
    });

    return res.status(201).json(
        mapLabTest(
            await LabTest.findByPk(test.id, { include: inc })
        )
    );
};

// Create laboratory test.
router.post(
    '/',
    authenticate,
    authorize('DOCTOR'),
    async (req, res, next) => {
        try {
            return await createLabRequest(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// Request laboratory test.
router.post(
    '/request',
    authenticate,
    authorize('DOCTOR'),
    async (req, res, next) => {
        try {
            return await createLabRequest(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// Disable old mock URL-based report uploads.
router.post(
    '/upload/:id',
    authenticate,
    authorize('LAB_TECHNICIAN', 'ADMIN'),
    (req, res) => {
        return res.status(410).json({
            message: 'Mock report uploads are disabled. Upload an actual report file.'
        });
    }
);

// Verify completed laboratory reports.
router.post(
    '/verify/:id',
    authenticate,
    authorize('RECORD_HANDLER', 'ADMIN'),
    async (req, res, next) => {
        try {
            const test = await LabTest.findByPk(req.params.id);

            if (!test) {
                return res.status(404).json({
                    message: 'Laboratory test not found.'
                });
            }

            if (
                test.status !== 'COMPLETED' ||
                !test.labReportUrl
            ) {
                return res.status(409).json({
                    message: 'Only completed reports can be verified.'
                });
            }

            test.status = 'VERIFIED';
            test.verifiedBy = req.user.fullName || req.user.email;
            test.verifiedAt = new Date();

            await test.save();

            return res.json(mapLabTest(test));
        } catch (err) {
            next(err);
        }
    }
);

// Doctor's own laboratory tests.
router.get(
    '/doctor/my',
    authenticate,
    authorize('DOCTOR'),
    async (req, res, next) => {
        try {
            const doctor = await getDoctor(req.user.id);

            if (!doctor) {
                return res.status(404).json({
                    message: 'Doctor profile not found.'
                });
            }

            const tests = await LabTest.findAll({
                where: { doctorId: doctor.id },
                include: inc,
                order: [['id', 'DESC']]
            });

            return res.json(mapLabTests(tests));
        } catch (err) {
            next(err);
        }
    }
);

// Patient's own laboratory tests.
router.get(
    '/my',
    authenticate,
    authorize('PATIENT'),
    async (req, res, next) => {
        try {
            const patient = await getPatient(req.user.id);

            if (!patient) {
                return res.json([]);
            }

            const tests = await LabTest.findAll({
                where: { patientId: patient.id },
                include: inc,
                order: [['id', 'DESC']]
            });

            return res.json(mapLabTests(tests));
        } catch (err) {
            next(err);
        }
    }
);

// Patient-specific laboratory tests.
router.get(
    '/patient/:patientId',
    authenticate,
    authorize(
        'DOCTOR',
        'ADMIN',
        'RECORD_HANDLER',
        'LAB_TECHNICIAN'
    ),
    async (req, res, next) => {
        try {
            const patientId = Number(req.params.patientId);

            if (!Number.isSafeInteger(patientId) || patientId <= 0) {
                return res.status(400).json({
                    message: 'Invalid patient ID.'
                });
            }

            if (req.user.role === 'DOCTOR') {
                const doctor = await getDoctor(req.user.id);

                if (!doctor) {
                    return res.status(404).json({
                        message: 'Doctor profile not found.'
                    });
                }

                const linkedTest = await LabTest.findOne({
                    where: {
                        doctorId: doctor.id,
                        patientId
                    }
                });

                if (!linkedTest) {
                    return res.status(403).json({
                        message: 'You are not authorized to access this patient.'
                    });
                }
            }

            const tests = await LabTest.findAll({
                where: { patientId },
                include: inc,
                order: [['id', 'DESC']]
            });

            return res.json(mapLabTests(tests));
        } catch (err) {
            next(err);
        }
    }
);

// Pending tests for laboratory technicians.
router.get(
    '/pending',
    authenticate,
    authorize('LAB_TECHNICIAN', 'ADMIN'),
    async (req, res, next) => {
        try {
            const tests = await LabTest.findAll({
                where: { status: 'REQUESTED' },
                include: inc,
                order: [['id', 'ASC']]
            });

            return res.json(mapLabTests(tests));
        } catch (err) {
            next(err);
        }
    }
);

// Completed reports awaiting verification.
router.get(
    '/to-verify',
    authenticate,
    authorize('RECORD_HANDLER', 'ADMIN'),
    async (req, res, next) => {
        try {
            const tests = await LabTest.findAll({
                where: { status: 'COMPLETED' },
                include: inc,
                order: [['id', 'ASC']]
            });

            return res.json(mapLabTests(tests));
        } catch (err) {
            next(err);
        }
    }
);

// Upload actual laboratory report into private storage.
router.post(
    '/:id/upload-report',
    authenticate,
    authorize('LAB_TECHNICIAN', 'ADMIN'),
    upload.single('file'),
    validateUploadedFile('labReport'),
    async (req, res, next) => {
        let newStorageKey;

        try {
            if (!req.uploadedFile) {
                return res.status(400).json({
                    message: 'Laboratory report file is required.'
                });
            }

            const test = await LabTest.findByPk(req.params.id);

            if (!test) {
                await deleteStoredFile(req.uploadedFile.storageKey);

                return res.status(404).json({
                    message: 'Laboratory test not found.'
                });
            }

            newStorageKey = req.uploadedFile.storageKey;

            const previousStorageKey = test.labReportUrl;

            test.labReportUrl = newStorageKey;
            test.status = 'COMPLETED';

            await test.save();

            newStorageKey = null;

            if (
                previousStorageKey &&
                previousStorageKey !== test.labReportUrl
            ) {
                await deleteStoredFile(previousStorageKey).catch(() => { });
            }

            return res.json(mapLabTest(test));
        } catch (err) {
            if (newStorageKey) {
                await deleteStoredFile(newStorageKey).catch(() => { });
            }

            next(err);
        }
    }
);

// Protected laboratory report download.
router.get(
    '/:id/report',
    authenticate,
    async (req, res, next) => {
        try {
            const test = await LabTest.findByPk(req.params.id);

            if (!test || !test.labReportUrl) {
                return res.status(404).json({
                    message: 'Laboratory report not found.'
                });
            }

            const allowed = await getLabTestAccess(test, req.user);

            if (!allowed) {
                return res.status(403).json({
                    message: 'You are not authorized to access this report.'
                });
            }

            const filePath = resolveStoredFile(test.labReportUrl);

            await fs.access(filePath);

            res.setHeader('X-Content-Type-Options', 'nosniff');

            return res.download(
                filePath,
                `lab-report-${test.id}${path.extname(filePath)}`
            );
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({
                    message: 'Laboratory report file not found.'
                });
            }

            next(err);
        }
    }
);

module.exports = router;
