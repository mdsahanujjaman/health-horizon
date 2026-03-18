const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
    specialization: { type: DataTypes.STRING, allowNull: false, defaultValue: 'MBBS' },
    experienceYears: { type: DataTypes.INTEGER },
    hospitalName: { type: DataTypes.STRING },
    bio: { type: DataTypes.STRING(1000) },
    consultationFee: { type: DataTypes.STRING },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    credentialUrl: { type: DataTypes.STRING },
}, { tableName: 'doctors', timestamps: true });
module.exports = Doctor;
