const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.STRING, allowNull: false },
    recipientId: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('SENT', 'DELIVERED', 'READ'), defaultValue: 'SENT' },
}, { tableName: 'chat_messages', timestamps: false });
module.exports = ChatMessage;
