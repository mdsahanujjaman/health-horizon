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


const signatures = {
    '.jpg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    '.jpeg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    '.png': (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    '.gif': (buffer) => buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6)),
    '.pdf': (buffer) => buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-'
};

// Multer's MIME type and extension checks are not sufficient on their own.
// Verify the file's leading bytes before creating a database record or exposing it.
upload.validateFileSignature = async (req, res, next) => {
    if (!req.file) return next();

    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const signatureCheck = signatures[extension];
    let handle;

    try {
        if (!signatureCheck) {
            await fs.promises.unlink(req.file.path).catch(() => {});
            return res.status(415).json({ message: 'Unsupported file type.' });
        }

        handle = await fs.promises.open(req.file.path, 'r');
        const buffer = Buffer.alloc(8);
        const { bytesRead } = await handle.read(buffer, 0, 8, 0);
        if (!signatureCheck(buffer.subarray(0, bytesRead))) {
            await handle.close();
            handle = null;
            await fs.promises.unlink(req.file.path).catch(() => {});
            return res.status(415).json({ message: 'File content does not match its declared type.' });
        }

        await handle.close();
        return next();
    } catch (error) {
        if (handle) await handle.close().catch(() => {});
        await fs.promises.unlink(req.file.path).catch(() => {});
        return next(error);
    }
};

module.exports = upload;
