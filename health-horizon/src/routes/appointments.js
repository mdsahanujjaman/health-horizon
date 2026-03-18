const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { Appointment, Patient, Doctor, Payment, User } = require('../models/index');

const includeAll = [
    { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] },
    { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user' }] },
    { model: Payment, as: 'payment' },
];
const mapA = (a) => ({
    id: a.id, patientId: a.patient?.id, patientUserId: a.patient?.userId, patientName: a.patient?.user?.fullName,
    doctorId: a.doctor?.id, doctorUserId: a.doctor?.userId, doctorName: a.doctor?.user?.fullName,
    doctorSpecialization: a.doctor?.specialization, appointmentTime: a.appointmentTime, status: a.status,
    reason: a.reason, doctorProfilePictureUrl: a.doctor?.user?.profilePictureUrl,
    isPaid: a.payment?.status === 'COMPLETED',
});

router.post('/', authenticate, async (req, res, next) => {
    try {
        const a = await Appointment.create({ ...req.body, status: 'PENDING' });
        res.json(mapA(await Appointment.findByPk(a.id, { include: includeAll })));
    } catch (err) { next(err); }
});

router.get('/my-appointments', authenticate, async (req, res, next) => {
    try {
        let appointments = [];
        if (req.user.role === 'PATIENT') {
            const p = await Patient.findOne({ where: { userId: req.user.id } });
            if (p) appointments = await Appointment.findAll({ where: { patientId: p.id }, include: includeAll });
        } else if (req.user.role === 'DOCTOR') {
            const d = await Doctor.findOne({ where: { userId: req.user.id } });
            if (d) appointments = await Appointment.findAll({ where: { doctorId: d.id }, include: includeAll });
        }
        res.json(appointments.map(mapA));
    } catch (err) { next(err); }
});

router.put('/:id/status', authenticate, async (req, res, next) => {
    try {
        const a = await Appointment.findByPk(req.params.id, { include: includeAll });
        if (!a) return res.status(404).json({ message: 'Not found' });
        a.status = req.query.status || req.body.status;
        await a.save();
        res.json(mapA(a));
    } catch (err) { next(err); }
});

module.exports = router;
