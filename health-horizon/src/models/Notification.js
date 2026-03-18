const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    recipientId: { type: DataTypes.BIGINT, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('INFO', 'ALERT', 'SUCCESS', 'WARNING') },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'notifications', timestamps: false });
module.exports = Notification;
