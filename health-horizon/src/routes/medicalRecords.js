
const router = require('express').Router();

const {
    authenticate,
    authorize
} = require('../middleware/auth');

const {
    upload,
    validateUploadedFile
} = require('../middleware/upload');

const {
    resolveStoredFile,
    deleteStoredFile
} = require('../config/storage');

const {
    MedicalRecord,
    Patient,
    Doctor,
    Appointment
} = require('../models/index');

const path = require('path');
const fs = require('fs/promises');

// Find the authenticated user's patient profile.
const getOwnPatient = async (userId) => {
    return Patient.findOne({
        where: { userId }
    });
};

// Check whether a doctor has an appointment with this patient.
const doctorCanAccessPatient = async (doctorUserId, patientId) => {
    const doctor = await Doctor.findOne({
        where: { userId: doctorUserId }
    });

    if (!doctor) return false;

    const appointment = await Appointment.findOne({
        where: {
            doctorId: doctor.id,
            patientId
        }
    });

    return Boolean(appointment);
};

// Remove internal storage paths from API responses.
const safeRecord = (record) => {
    const data = record.toJSON();
    delete data.storagePath;
    return data;
};

// Upload a patient's own medical record.
router.post(
    '/',
    authenticate,
    authorize('PATIENT'),
    upload.single('file'),
    validateUploadedFile('medicalRecord'),
    async (req, res, next) => {
        let storageKey;

        try {
            if (!req.uploadedFile) {
                return res.status(400).json({
                    message: 'Medical record file is required.'
                });
            }

            storageKey = req.uploadedFile.storageKey;

            const patient = await getOwnPatient(req.user.id);

            if (!patient) {
                await deleteStoredFile(storageKey);
                storageKey = null;

                return res.status(404).json({
                    message: 'Patient profile not found.'
                });
            }

            const record = await MedicalRecord.create({
                patientId: patient.id,
                fileName: req.uploadedFile.originalname,
                fileType: req.uploadedFile.mimetype,
                fileSize: req.uploadedFile.size,
                description: req.body.description,
                uploadDate: new Date(),
                storagePath: storageKey
            });

            storageKey = null;

            return res.status(201).json(safeRecord(record));
        } catch (err) {
            if (storageKey) {
                await deleteStoredFile(storageKey).catch(() => { });
            }

            next(err);
        }
    }
);

// Get the authenticated patient's own records.
router.get('/my', authenticate, async (req, res, next) => {
    try {
        const patient = await getOwnPatient(req.user.id);

        if (!patient) {
            return res.json([]);
        }

        const records = await MedicalRecord.findAll({
            where: { patientId: patient.id },
            order: [['uploadDate', 'DESC']]
        });

        return res.json(records.map(safeRecord));
    } catch (err) {
        next(err);
    }
});

// Get records belonging to a specific patient.
router.get(
    '/patient/:patientId',
    authenticate,
    authorize('DOCTOR', 'ADMIN', 'RECORD_HANDLER'),
    async (req, res, next) => {
        try {
            const patientId = Number(req.params.patientId);

            if (!Number.isSafeInteger(patientId) || patientId <= 0) {
                return res.status(400).json({
                    message: 'Invalid patient ID.'
                });
            }

            if (req.user.role === 'DOCTOR') {
                const allowed = await doctorCanAccessPatient(
                    req.user.id,
                    patientId
                );

                if (!allowed) {
                    return res.status(403).json({
                        message: 'You are not authorized to access this patient.'
                    });
                }
            }

            const records = await MedicalRecord.findAll({
                where: { patientId },
                order: [['uploadDate', 'DESC']]
            });

            return res.json(records.map(safeRecord));
        } catch (err) {
            next(err);
        }
    }
);

// Download a record only when the authenticated user has access.
router.get(
    '/download/:id',
    authenticate,
    async (req, res, next) => {
        try {
            const record = await MedicalRecord.findByPk(req.params.id);

            if (!record) {
                return res.status(404).json({
                    message: 'Medical record not found.'
                });
            }

            let allowed = false;

            if (req.user.role === 'PATIENT') {
                const patient = await getOwnPatient(req.user.id);

                allowed = Boolean(
                    patient &&
                    String(patient.id) === String(record.patientId)
                );
            } else if (req.user.role === 'DOCTOR') {
                allowed = await doctorCanAccessPatient(
                    req.user.id,
                    record.patientId
                );
            } else if (
                ['ADMIN', 'RECORD_HANDLER'].includes(req.user.role)
            ) {
                allowed = true;
            }

            if (!allowed) {
                return res.status(403).json({
                    message: 'You are not authorized to download this record.'
                });
            }

            const filePath = resolveStoredFile(record.storagePath);

            await fs.access(filePath);

            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader(
                'Content-Type',
                record.fileType || 'application/octet-stream'
            );

            return res.download(
                filePath,
                path.basename(record.fileName || 'medical-record')
            );
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({
                    message: 'Medical record file not found.'
                });
            }

            next(err);
        }
    }
);

// Only the owning patient or an administrator can delete a record.
router.delete(
    '/:id',
    authenticate,
    async (req, res, next) => {
        try {
            const record = await MedicalRecord.findByPk(req.params.id);

            if (!record) {
                return res.status(404).json({
                    message: 'Medical record not found.'
                });
            }

            let allowed = req.user.role === 'ADMIN';

            if (req.user.role === 'PATIENT') {
                const patient = await getOwnPatient(req.user.id);

                allowed = Boolean(
                    patient &&
                    String(patient.id) === String(record.patientId)
                );
            }

            if (!allowed) {
                return res.status(403).json({
                    message: 'You are not authorized to delete this record.'
                });
            }

            await record.destroy();

            await deleteStoredFile(record.storagePath);

            return res.json({
                message: 'Medical record deleted successfully.'
            });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;
