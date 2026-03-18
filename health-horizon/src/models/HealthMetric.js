const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const HealthMetric = sequelize.define('HealthMetric', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    type: { type: DataTypes.STRING },
    value: { type: DataTypes.DOUBLE },
    unit: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    doctorNote: { type: DataTypes.STRING },
    recordedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'health_metrics', timestamps: false });
module.exports = HealthMetric;
