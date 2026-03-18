const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT },
    userEmail: { type: DataTypes.STRING },
    action: { type: DataTypes.STRING },
    resourceId: { type: DataTypes.STRING },
    reason: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'audit_logs', timestamps: false });
module.exports = AuditLog;
