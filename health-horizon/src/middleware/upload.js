
const multer = require('multer');
const path = require('path');

const { fileTypeFromBuffer } = require('file-type');
const { saveUploadedFile } = require('../config/storage');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});

const ALLOWED_TYPES = {
    profile: ['image/jpeg', 'image/png'],
    medicalRecord: ['application/pdf', 'image/jpeg', 'image/png'],
    doctorCredential: ['application/pdf', 'image/jpeg', 'image/png'],
    labReport: ['application/pdf', 'image/jpeg', 'image/png'],
    general: ['application/pdf', 'image/jpeg', 'image/png']
};

const validateUploadedFile = (category) => {
    if (!ALLOWED_TYPES[category]) {
        throw new Error('Invalid upload category.');
    }

    return async (req, res, next) => {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                message: 'No file uploaded.'
            });
        }

        try {
            const detected = await fileTypeFromBuffer(req.file.buffer);

            if (
                !detected ||
                !ALLOWED_TYPES[category].includes(detected.mime)
            ) {
                return res.status(415).json({
                    message: 'Unsupported or invalid file format.'
                });
            }

            const originalExtension = path.extname(
                req.file.originalname || ''
            ).toLowerCase();

            const validExtensions = {
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'application/pdf': ['.pdf']
            };

            if (
                !validExtensions[detected.mime].includes(originalExtension)
            ) {
                return res.status(415).json({
                    message: 'File extension does not match its actual content.'
                });
            }

            const saved = await saveUploadedFile(
                req.file.buffer,
                category,
                detected.ext
            );

            req.uploadedFile = {
                filename: saved.filename,
                storageKey: saved.storageKey,
                mimetype: detected.mime,
                size: req.file.size,
                originalname: path.basename(req.file.originalname)
            };

            // Release the in-memory buffer after saving.
            req.file.buffer = null;

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    upload,
    validateUploadedFile
};
