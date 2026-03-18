const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const LabTest = sequelize.define('LabTest', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    doctorId: { type: DataTypes.BIGINT, allowNull: false, field: 'doctor_id' },
    testName: { type: DataTypes.STRING, allowNull: false },
    clinicalReason: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'), defaultValue: 'REQUESTED' },
    labReportUrl: { type: DataTypes.STRING },
    verifiedBy: { type: DataTypes.STRING },
    verifiedAt: { type: DataTypes.DATE },
}, { tableName: 'lab_tests', timestamps: true });
module.exports = LabTest;
