const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING },
    profilePictureUrl: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('PATIENT', 'DOCTOR', 'ADMIN', 'LAB_TECHNICIAN', 'COUNSELOR', 'RECORD_HANDLER', 'CAREGIVER'), allowNull: false, defaultValue: 'PATIENT' },
    verificationStatus: { type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'), defaultValue: 'PENDING' },
}, { tableName: 'users', timestamps: true });
module.exports = User;
