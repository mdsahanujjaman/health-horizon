const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { MedicalRecord, Patient } = require('../models/index');
const uploadDir = path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/credentials');

router.post('/upload', authenticate, authorize('PATIENT', 'ADMIN'), upload.single('file'), upload.validateFileSignature, (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    return res.json({ url: `/api/v1/files/${req.file.filename}`, filename: req.file.filename });
});

// Uploaded health documents are private. Resolve the file to its record and
// enforce ownership before serving any bytes.
router.get('/:filename', authenticate, async (req, res, next) => {
    try {
        const filename = path.basename(req.params.filename);
        if (!filename || filename !== req.params.filename) {
            return res.status(400).json({ message: 'Invalid filename' });
        }
        const record = await MedicalRecord.findOne({
            where: { storagePath: `/api/v1/files/${filename}` }
        });
        if (!record) return res.status(404).json({ message: 'File record not found' });

        let allowed = req.user.role === 'ADMIN';
        if (!allowed && req.user.role === 'PATIENT') {
            const patient = await Patient.findOne({ where: { userId: req.user.id } });
            allowed = Boolean(patient && Number(patient.id) === Number(record.patientId));
        }
        if (!allowed) return res.status(403).json({ message: 'You are not allowed to access this file.' });

        const filePath = path.resolve(uploadDir, filename);
        if (!filePath.startsWith(uploadDir + path.sep)) {
            return res.status(400).json({ message: 'Invalid file path' });
        }
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
        return res.sendFile(filePath);
    } catch (err) { return next(err); }
});

module.exports = router;
