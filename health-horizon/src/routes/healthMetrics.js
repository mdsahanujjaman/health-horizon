const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { HealthMetric, Patient } = require('../models/index');

router.post('/', authenticate, async (req, res, next) => {
    try {
        res.json(await HealthMetric.create({ ...req.body, recordedAt: new Date() }));
    } catch (err) {
        next(err);
    }
});

router.get('/my', authenticate, async (req, res, next) => {
    try {
        const patient = await Patient.findOne({ where: { userId: req.user.id } });
        if (!patient) return res.json([]);
        res.json(await HealthMetric.findAll({
            where: { patientId: patient.id },
            order: [['recordedAt', 'DESC']],
        }));
    } catch (err) {
        next(err);
    }
});

router.get('/patient/:patientId', authenticate, authorize('DOCTOR', 'ADMIN'), async (req, res, next) => {
    try {
        res.json(await HealthMetric.findAll({
            where: { patientId: req.params.patientId },
            order: [['recordedAt', 'DESC']],
        }));
    } catch (err) {
        next(err);
    }
});

// Clinical integrity sub-router is mounted under /api/v1/health-metrics.
router.use('/clinical-integrity', require('./clinicalIntegrity'));

module.exports = router;
