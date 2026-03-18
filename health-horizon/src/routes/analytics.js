const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { User, Doctor, Patient, Appointment } = require('../models/index');
router.get('/overview', authenticate, authorize('ADMIN', 'DOCTOR'), async (req, res, next) => {
    try {
        const [totalUsers, totalDoctors, totalPatients, totalAppointments, pendingVerification] = await Promise.all([User.count(), Doctor.count(), Patient.count(), Appointment.count(), User.count({ where: { verificationStatus: 'PENDING' } })]);
        res.json({ totalUsers, totalDoctors, totalPatients, totalAppointments, pendingVerification });
    } catch (err) { next(err); }
});
module.exports = router;
