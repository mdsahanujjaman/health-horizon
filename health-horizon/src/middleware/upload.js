const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads/credentials');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();
        if (!Object.prototype.hasOwnProperty.call(allowedTypes, extension)) {
            return cb(new Error('Unsupported file extension'));
        }
        cb(null, `${crypto.randomBytes(16).toString('hex')}${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const expectedMimeType = allowedTypes[extension];

    if (expectedMimeType && file.mimetype === expectedMimeType) {
        return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, GIF, and PDF files with matching file types are allowed'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
        fields: 20,
        parts: 21
    }
});

module.exports = upload;
