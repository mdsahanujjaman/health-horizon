const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT, allowNull: false, field: 'user_id' },
    dateOfBirth: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER') },
    bloodGroup: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    emergencyContact: { type: DataTypes.STRING },
    height: { type: DataTypes.DOUBLE },
    weight: { type: DataTypes.DOUBLE },
    medicalConditions: { type: DataTypes.TEXT },
    beneficiaryName: { type: DataTypes.STRING },
    calmMode: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'patients', timestamps: true });
module.exports = Patient;
