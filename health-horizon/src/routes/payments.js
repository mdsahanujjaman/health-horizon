const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Payment } = require('../models/index');
router.post('/', authenticate, async (req, res, next) => {
    try { res.json(await Payment.create({ ...req.body, status: 'PENDING' })); } catch (err) { next(err); }
});
router.put('/:id/complete', authenticate, async (req, res, next) => {
    try {
        const p = await Payment.findByPk(req.params.id);
        if (!p) return res.status(404).json({ message: 'Not found' });
        p.status = 'COMPLETED'; p.transactionId = req.body.transactionId; p.paymentMethod = req.body.paymentMethod;
        await p.save(); res.json(p);
    } catch (err) { next(err); }
});
router.get('/appointment/:appointmentId', authenticate, async (req, res, next) => {
    try {
        const p = await Payment.findOne({ where: { appointmentId: req.params.appointmentId } });
        if (!p) return res.status(404).json({ message: 'Not found' });
        res.json(p);
    } catch (err) { next(err); }
});
module.exports = router;
