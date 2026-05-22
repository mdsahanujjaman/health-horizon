const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { User, Doctor, Patient, Appointment } = require('../models/index');
router.get('/overview', authenticate, authorize('ADMIN', 'DOCTOR'), async (req, res, next) => {
    try {
        const [totalUsers, totalDoctors, totalPatients, totalAppointments, pendingVerification] = await Promise.all([User.count(), Doctor.count(), Patient.count(), Appointment.count(), User.count({ where: { verificationStatus: 'PENDING' } })]);
        res.json({ totalUsers, totalDoctors, totalPatients, totalAppointments, pendingVerification });
    } catch (err) { next(err); }
});

router.get('/admin', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
            Patient.count(),
            Doctor.count(),
            Appointment.count()
        ]);
        
        const appointments = await Appointment.findAll();
        const statusDistribution = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
        appointments.forEach(a => {
            const statusKey = (a.status || 'PENDING').toUpperCase();
            if (statusDistribution[statusKey] !== undefined) {
                statusDistribution[statusKey]++;
            } else {
                statusDistribution[statusKey] = 1;
            }
        });
        
        res.json({
            totalPatients,
            totalDoctors,
            totalAppointments,
            totalRevenue: (totalAppointments * 120).toFixed(2), // Mock revenue estimation
            statusDistribution
        });
    } catch (err) { next(err); }
});

router.get('/doctor-stats', authenticate, authorize('DOCTOR'), async (req, res, next) => {
    try {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
        
        const trends = [
            { month: 'Jan', count: 0 },
            { month: 'Feb', count: 0 },
            { month: 'Mar', count: 0 },
            { month: 'Apr', count: 0 },
            { month: 'May', count: 0 },
            { month: 'Jun', count: 0 },
            { month: 'Jul', count: 0 },
            { month: 'Aug', count: 0 },
            { month: 'Sep', count: 0 },
            { month: 'Oct', count: 0 },
            { month: 'Nov', count: 0 },
            { month: 'Dec', count: 0 }
        ];
        
        const appointments = await Appointment.findAll({ where: { doctorId: doctor.id } });
        appointments.forEach(a => {
            const date = new Date(a.appointmentTime);
            if (!isNaN(date.getTime())) {
                const mIdx = date.getMonth();
                trends[mIdx].count++;
            }
        });
        
        res.json({ appointmentTrends: trends });
    } catch (err) { next(err); }
});

module.exports = router;
