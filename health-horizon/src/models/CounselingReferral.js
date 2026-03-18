const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const CounselingReferral = sequelize.define('CounselingReferral', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    doctorId: { type: DataTypes.BIGINT, allowNull: false, field: 'doctor_id' },
    counselorId: { type: DataTypes.BIGINT, field: 'counselor_id' },
    reason: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'COMPLETED'), defaultValue: 'PENDING' },
    sessionNotes: { type: DataTypes.TEXT },
}, { tableName: 'counseling_referrals', timestamps: true });
module.exports = CounselingReferral;
