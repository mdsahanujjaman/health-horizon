const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const MedicalRecord = sequelize.define('MedicalRecord', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    fileName: { type: DataTypes.STRING, allowNull: false },
    fileType: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.BIGINT },
    description: { type: DataTypes.STRING },
    uploadDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    storagePath: { type: DataTypes.STRING },
}, { tableName: 'medical_records', timestamps: false });
module.exports = MedicalRecord;
