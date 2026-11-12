
const router = require('express').Router();
const fs = require('fs/promises');

const {
    resolveStoredFile
} = require('../config/storage');

// Generic uploads are disabled.
// Use dedicated upload routes for each file category.
router.post('/upload', (req, res) => {
    return res.status(410).json({
        message: 'Generic uploads are disabled. Use the appropriate upload endpoint.'
    });
});

// Public profile-picture retrieval only.
router.get('/profile/:filename', async (req, res, next) => {
    try {
        const filename = req.params.filename;

        if (
            typeof filename !== 'string' ||
            !/^[a-f0-9-]+\.(jpg|jpeg|png)$/i.test(filename)
        ) {
            return res.status(400).json({
                message: 'Invalid profile image filename.'
            });
        }

        const filePath = resolveStoredFile(
            `public/profiles/${filename}`
        );

        await fs.access(filePath);

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=86400');

        return res.sendFile(filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                message: 'Profile image not found.'
            });
        }

        next(error);
    }
});

module.exports = router;
