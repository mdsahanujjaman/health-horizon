const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Notification } = require('../models/index');
router.get('/my', authenticate, async (req, res, next) => {
    try { res.json(await Notification.findAll({ where: { recipientId: req.user.id }, order: [['timestamp', 'DESC']] })); } catch (err) { next(err); }
});
router.put('/read-all', authenticate, async (req, res, next) => {
    try { await Notification.update({ isRead: true }, { where: { recipientId: req.user.id } }); res.json({ message: 'All marked as read' }); } catch (err) { next(err); }
});
router.put('/:id/read', authenticate, async (req, res, next) => {
    try { const n = await Notification.findByPk(req.params.id); if (!n) return res.status(404).json({ message: 'Not found' }); n.isRead = true; await n.save(); res.json(n); } catch (err) { next(err); }
});
router.post('/', authenticate, async (req, res, next) => {
    try { res.json(await Notification.create({ ...req.body, timestamp: new Date() })); } catch (err) { next(err); }
});
module.exports = router;
