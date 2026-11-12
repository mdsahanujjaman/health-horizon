
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
    upload,
    validateUploadedFile
} = require('../middleware/upload');

router.post(
    '/upload',
    authenticate,
    upload.single('file'),
    validateUploadedFile('profile'),
    async (req, res, next) => {
        try {
            if (!req.uploadedFile) {
                return res.status(400).json({
                    message: 'No valid profile image uploaded.'
                });
            }

            const fileUrl = `/api/v1/files/profile/${req.uploadedFile.filename}`;

            req.user.profilePictureUrl = fileUrl;
            await req.user.save();

            return res.status(201).json({ url: fileUrl });
        } catch (err) {
            next(err);
        }
    }
);

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const { password, ...safeUser } = req.user.toJSON();
        return res.json(safeUser);
    } catch (err) {
        next(err);
    }
});

router.put('/me', authenticate, async (req, res, next) => {
    try {
        if (req.body.fullName) {
            req.user.fullName = req.body.fullName;
        }

        await req.user.save();

        const { password, ...safeUser } = req.user.toJSON();
        return res.json(safeUser);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
