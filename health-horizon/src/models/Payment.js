const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    appointmentId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'appointment_id' },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USD' },
    status: { type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'), allowNull: false, defaultValue: 'PENDING' },
    transactionId: { type: DataTypes.STRING },
    paymentMethod: { type: DataTypes.STRING },
}, { tableName: 'payments', timestamps: true });
module.exports = Payment;
