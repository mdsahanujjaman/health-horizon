const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { AuditLog } = require('../models/index');
router.post('/audit', authenticate, async (req, res, next) => {
    try { res.json(await AuditLog.create({ userId: req.user.id, userEmail: req.user.email, role: req.user.role, action: req.body.action, resourceId: req.body.resourceId, reason: req.body.reason, timestamp: new Date() })); } catch (err) { next(err); }
});
router.get('/audit', authenticate, async (req, res, next) => {
    try { res.json(await AuditLog.findAll({ order: [['timestamp', 'DESC']], limit: 500 })); } catch (err) { next(err); }
});
module.exports = router;
