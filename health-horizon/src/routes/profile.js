const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
    try {
        const fileUrl = `/api/v1/files/${req.file.filename}`;
        req.user.profilePictureUrl = fileUrl;
        await req.user.save();
        res.json({ url: fileUrl });
    } catch (err) { next(err); }
});
router.get('/me', authenticate, async (req, res, next) => {
    try { const { password, ...safeUser } = req.user.toJSON(); res.json(safeUser); } catch (err) { next(err); }
});
router.put('/me', authenticate, async (req, res, next) => {
    try {
        if (req.body.fullName) req.user.fullName = req.body.fullName;
        await req.user.save();
        const { password, ...safeUser } = req.user.toJSON();
        res.json(safeUser);
    } catch (err) { next(err); }
});
module.exports = router;
