const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { AuditLog } = require('../models/index');

// Audit records are security-sensitive: clients must not be able to forge or
// inspect the audit trail using an ordinary authenticated account.
router.post('/audit', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const action = typeof req.body.action === 'string' ? req.body.action.trim() : '';
        if (!action || action.length > 120) {
            return res.status(400).json({ message: 'A valid audit action (1-120 characters) is required.' });
        }
        const record = await AuditLog.create({
            userId: req.user.id,
            userEmail: req.user.email,
            role: req.user.role,
            action,
            resourceId: req.body.resourceId,
            reason: typeof req.body.reason === 'string' ? req.body.reason.slice(0, 1000) : null,
            timestamp: new Date()
        });
        return res.json(record);
    } catch (err) { return next(err); }
});

router.get('/audit', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        return res.json(await AuditLog.findAll({ order: [['timestamp', 'DESC']], limit: 500 }));
    } catch (err) { return next(err); }
});

module.exports = router;
