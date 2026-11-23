const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { MedicalRecord, Patient } = require('../models/index');

async function canAccessRecord(user, record) {
    if (user.role === 'ADMIN') return true;
    if (user.role !== 'PATIENT') return false;
    const patient = await Patient.findOne({ where: { userId: user.id } });
    return Boolean(patient && Number(patient.id) === Number(record.patientId));
}

router.post('/', authenticate, authorize('PATIENT'), upload.single('file'), upload.validateFileSignature, async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
        const record = await MedicalRecord.create({
            patientId: patient.id,
            fileName: req.file?.originalname || req.body.fileName,
            fileType: req.file?.mimetype || req.body.fileType,
            fileSize: req.file?.size || req.body.fileSize,
            description: req.body.description,
            uploadDate: new Date(),
            storagePath: req.file ? `/api/v1/files/${req.file.filename}` : req.body.storagePath
        });
        return res.json(record);
    } catch (err) { return next(err); }
});

router.get('/my', authenticate, authorize('PATIENT'), async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.json([]);
        return res.json(await MedicalRecord.findAll({ where: { patientId: patient.id } }));
    } catch (err) { return next(err); }
});

// Until clinician-to-patient assignment authorization exists, restrict cross-patient
// record listing to administrators rather than granting every doctor global access.
router.get('/patient/:patientId', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        return res.json(await MedicalRecord.findAll({ where: { patientId: req.params.patientId } }));
    } catch (err) { return next(err); }
});

router.get('/download/:id', authenticate, async (req, res, next) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        if (!(await canAccessRecord(req.user, record))) {
            return res.status(403).json({ message: 'You are not allowed to access this medical record.' });
        }
        if (!record.storagePath) return res.status(404).json({ message: 'File path not available' });
        const filename = path.basename(record.storagePath);
        const filePath = path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/credentials', filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found on disk' });
        return res.download(filePath, record.fileName);
    } catch (err) { return next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        if (!(await canAccessRecord(req.user, record))) {
            return res.status(403).json({ message: 'You are not allowed to delete this medical record.' });
        }
        await record.destroy();
        return res.json({ message: 'Record deleted' });
    } catch (err) { return next(err); }
});

module.exports = router;
