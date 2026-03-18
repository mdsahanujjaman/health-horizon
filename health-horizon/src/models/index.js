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
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctor' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medicalRecords' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Doctor.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
LabTest.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
LabTest.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Patient.hasMany(LabTest, { foreignKey: 'patient_id', as: 'labTests' });
Doctor.hasMany(LabTest, { foreignKey: 'doctor_id', as: 'labTests' });
HealthMetric.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Patient.hasMany(HealthMetric, { foreignKey: 'patient_id', as: 'healthMetrics' });
PillReminder.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Patient.hasMany(PillReminder, { foreignKey: 'patient_id', as: 'pillReminders' });
CounselingReferral.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
CounselingReferral.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
CounselingReferral.belongsTo(User, { foreignKey: 'counselor_id', as: 'counselor' });
Patient.hasMany(CounselingReferral, { foreignKey: 'patient_id', as: 'counselingReferrals' });

module.exports = {
    User, Doctor, Patient, Appointment, ChatMessage,
    MedicalRecord, Prescription, LabTest, Payment,
    Notification, HealthMetric, PillReminder,
    CounselingReferral, AuditLog,
};
