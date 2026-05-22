const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { MedicalRecord, Patient } = require('../models/index');

router.post('/', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
        const record = await MedicalRecord.create({ patientId: patient.id, fileName: req.file?.originalname || req.body.fileName, fileType: req.file?.mimetype || req.body.fileType, fileSize: req.file?.size || req.body.fileSize, description: req.body.description, uploadDate: new Date(), storagePath: req.file ? `/api/v1/files/${req.file.filename}` : req.body.storagePath });
        res.json(record);
    } catch (err) { next(err); }
});
router.get('/my', authenticate, async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.json([]);
        res.json(await MedicalRecord.findAll({ where: { patientId: patient.id } }));
    } catch (err) { next(err); }
});
router.get('/patient/:patientId', authenticate, authorize('DOCTOR', 'ADMIN', 'RECORD_HANDLER'), async (req, res, next) => {
    try { res.json(await MedicalRecord.findAll({ where: { patientId: req.params.patientId } })); } catch (err) { next(err); }
});
router.get('/download/:id', authenticate, async (req, res, next) => {
    try {
        const record = await MedicalRecord.findByPk(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        
        const filename = path.basename(record.storagePath);
        const filePath = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/credentials', filename);
        
        if (fs.existsSync(filePath)) {
            res.download(filePath, record.fileName);
        } else {
            res.status(404).json({ message: 'File not found on disk' });
        }
    } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
    try { await MedicalRecord.destroy({ where: { id: req.params.id } }); res.json({ message: 'Record deleted' }); } catch (err) { next(err); }
});
module.exports = router;
