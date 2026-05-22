const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');
const { Patient, User, Appointment } = require('../models/index');

router.post('/create-by-doctor', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'DOCTOR') {
            return res.status(403).json({ message: 'Forbidden: Only doctors can create patients.' });
        }
        const { fullName } = req.body;
        if (!fullName) {
            return res.status(400).json({ message: 'Full name is required.' });
        }

        let email = req.body.email;
        if (!email) {
            email = `emergency.patient.${Date.now()}.${Math.floor(Math.random() * 1000)}@healthhorizon.com`;
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const password = req.body.password || 'Password123!';
        const hashed = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            fullName,
            email,
            password: hashed,
            role: 'PATIENT',
            verificationStatus: 'VERIFIED'
        });

        let dateOfBirth = null;
        if (req.body.age) {
            const ageInt = parseInt(req.body.age, 10);
            if (!isNaN(ageInt)) {
                const currentYear = new Date().getFullYear();
                dateOfBirth = `${currentYear - ageInt}-01-01`;
            }
        } else if (req.body.dateOfBirth) {
            dateOfBirth = req.body.dateOfBirth;
        }

        let gender = null;
        if (req.body.gender) {
            const gUpper = req.body.gender.toUpperCase();
            if (['MALE', 'FEMALE', 'OTHER'].includes(gUpper)) {
                gender = gUpper;
            }
        }

        const patient = await Patient.create({
            userId: user.id,
            dateOfBirth,
            gender,
            address: req.body.address || null,
            medicalConditions: req.body.medicalConditions || null
        });

        res.json({
            id: patient.id,
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            gender: patient.gender,
            dateOfBirth: patient.dateOfBirth,
            address: patient.address,
            medicalConditions: patient.medicalConditions
        });
    } catch (err) { next(err); }
});
const mapP = (p) => ({ id: p.id, userId: p.userId, fullName: p.user?.fullName, email: p.user?.email, dateOfBirth: p.dateOfBirth, gender: p.gender, bloodGroup: p.bloodGroup, address: p.address, emergencyContact: p.emergencyContact, height: p.height, weight: p.weight, medicalConditions: p.medicalConditions, beneficiaryName: p.beneficiaryName, calmMode: p.calmMode });
const incU = [{ model: User, as: 'user' }];

router.get('/', authenticate, async (req, res, next) => {
    try {
        if (req.user.role !== 'DOCTOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const list = await Patient.findAll({
            include: [
                { model: User, as: 'user' },
                { model: Appointment, as: 'appointments' }
            ]
        });
        
        const mapped = list.map(p => {
            const base = mapP(p);
            const sortedApts = (p.appointments || []).sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
            base.lastAppointmentDate = sortedApts.length > 0 ? sortedApts[0].appointmentTime : null;
            base.lastAppointmentTime = sortedApts.length > 0 ? sortedApts[0].appointmentTime : null;
            return base;
        });

        res.json(mapped);
    } catch (err) { next(err); }
});

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const p = await Patient.findOne({ where: { userId: req.user.id }, include: incU });
        if (!p) return res.status(404).json({ message: 'Patient profile not found' });
        res.json(mapP(p));
    } catch (err) {
        console.error('Patient fetch error:', err);
        next(err);
    }
});
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { fullName, phoneNumber, ...patientData } = req.body;
        
        if (patientData.dateOfBirth === '') patientData.dateOfBirth = null;
        if (patientData.height === '') patientData.height = null;
        if (patientData.weight === '') patientData.weight = null;

        const [p] = await Patient.findOrCreate({ where: { userId: req.user.id }, defaults: { ...patientData, userId: req.user.id } });
        await p.update(patientData);
        
        if (fullName !== undefined || phoneNumber !== undefined) {
            const user = await User.findByPk(req.user.id);
            if (user) {
                if (fullName !== undefined) user.fullName = fullName;
                if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
                await user.save();
            }
        }
        
        res.json(mapP(await Patient.findOne({ where: { userId: req.user.id }, include: incU })));
    } catch (err) {
        console.error('Patient update error:', err);
        next(err);
    }
});
module.exports = router;
