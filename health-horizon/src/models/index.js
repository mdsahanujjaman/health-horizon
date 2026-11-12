const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const ChatMessage = require('./ChatMessage');
const MedicalRecord = require('./MedicalRecord');
const Prescription = require('./Prescription');
const LabTest = require('./LabTest');
const Payment = require('./Payment');
const Notification = require('./Notification');
const HealthMetric = require('./HealthMetric');
const PillReminder = require('./PillReminder');
const CounselingReferral = require('./CounselingReferral');
const AuditLog = require('./AuditLog');

// Associations
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Payment.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Appointment.hasOne(Payment, { foreignKey: 'appointmentId', as: 'payment' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
Doctor.hasMany(Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });
LabTest.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
LabTest.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Patient.hasMany(LabTest, { foreignKey: 'patientId', as: 'labTests' });
Doctor.hasMany(LabTest, { foreignKey: 'doctorId', as: 'labTests' });
HealthMetric.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasMany(HealthMetric, { foreignKey: 'patientId', as: 'healthMetrics' });
PillReminder.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasMany(PillReminder, { foreignKey: 'patientId', as: 'pillReminders' });
CounselingReferral.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
CounselingReferral.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
CounselingReferral.belongsTo(User, { foreignKey: 'counselorId', as: 'counselor' });
Patient.hasMany(CounselingReferral, { foreignKey: 'patientId', as: 'counselingReferrals' });

module.exports = {
    User, Doctor, Patient, Appointment, ChatMessage,
    MedicalRecord, Prescription, LabTest, Payment,
    Notification, HealthMetric, PillReminder,
    CounselingReferral, AuditLog,
};
