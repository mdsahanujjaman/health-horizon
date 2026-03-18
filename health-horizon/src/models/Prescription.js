const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Prescription = sequelize.define('Prescription', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    doctorId: { type: DataTypes.BIGINT, allowNull: false, field: 'doctor_id' },
    medications: { type: DataTypes.TEXT, allowNull: false },
    instructions: { type: DataTypes.TEXT },
    diagnosis: { type: DataTypes.TEXT },
    internalObservations: { type: DataTypes.TEXT },
    isDiagnosisVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
    prescriptionDate: { type: DataTypes.DATEONLY },
}, { tableName: 'prescriptions', timestamps: true });
module.exports = Prescription;
