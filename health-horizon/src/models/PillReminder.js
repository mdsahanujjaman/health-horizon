const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PillReminder = sequelize.define('PillReminder', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.BIGINT, allowNull: false, field: 'patient_id' },
    medicationName: { type: DataTypes.STRING },
    dosage: { type: DataTypes.STRING },
    reminderTime: { type: DataTypes.TIME },
    foodInstruction: { type: DataTypes.STRING },
    durationDays: { type: DataTypes.INTEGER },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'pill_reminders', timestamps: false });
module.exports = PillReminder;
