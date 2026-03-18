const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/credentials');

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: `/api/v1/files/${req.file.filename}`, filename: req.file.filename });
});

router.get('/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: 'File not found' });
});

module.exports = router;
