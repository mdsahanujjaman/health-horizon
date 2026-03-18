const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    doctorId: { type: DataTypes.BIGINT, allowNull: false, field: 'doctor_id' },
    appointmentTime: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
    reason: { type: DataTypes.TEXT },
}, { tableName: 'appointments', timestamps: true });
module.exports = Appointment;
