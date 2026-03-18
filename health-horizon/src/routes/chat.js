const router = require('express').Router();
const { Op } = require('sequelize');
const { authenticate } = require('../middleware/auth');
const { ChatMessage, User } = require('../models/index');

// IMPORTANT: specific routes BEFORE parameterized routes
// GET /api/v1/messages/conversations/:userId
router.get('/conversations/:userId', authenticate, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const sentMsgs = await ChatMessage.findAll({ where: { senderId: userId }, attributes: ['recipientId'] });
        const recvMsgs = await ChatMessage.findAll({ where: { recipientId: userId }, attributes: ['senderId'] });
        const partnerIds = new Set([...sentMsgs.map(m => m.recipientId), ...recvMsgs.map(m => m.senderId)]);
        partnerIds.delete(userId);
        const conversations = await Promise.all([...partnerIds].map(async (partnerId) => {
            const partner = await User.findByPk(partnerId);
            const lastMsg = await ChatMessage.findOne({ where: { [Op.or]: [{ senderId: userId, recipientId: partnerId }, { senderId: partnerId, recipientId: userId }] }, order: [['timestamp', 'DESC']] });
            return {
                participantId: partnerId,
                participantName: partner?.fullName || 'Unknown',
                participantProfilePictureUrl: partner?.profilePictureUrl || null,
                lastMessage: lastMsg?.content || '',
                lastMessageTimestamp: lastMsg?.timestamp || null,
                unreadCount: 0,
            };
        }));
        res.json(conversations);
    } catch (err) { next(err); }
});

// GET /api/v1/messages/:senderId/:recipientId  — must come AFTER /conversations/:userId
router.get('/:senderId/:recipientId', authenticate, async (req, res, next) => {
    try {
        const { senderId, recipientId } = req.params;
        const messages = await ChatMessage.findAll({
            where: { [Op.or]: [{ senderId, recipientId }, { senderId: recipientId, recipientId: senderId }] },
            order: [['timestamp', 'ASC']],
        });
        res.json(messages);
    } catch (err) { next(err); }
});

module.exports = router;
