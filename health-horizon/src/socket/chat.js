const { ChatMessage } = require('../models/index');

const initSocket = (io) => {
    const userSocketMap = {};

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`[Socket] User ${userId} connected`);
        }

        socket.on('chat', async (data) => {
            try {
                const { senderId, recipientId, content } = data;
                const saved = await ChatMessage.create({ senderId, recipientId, content, timestamp: new Date(), status: 'SENT' });
                // Deliver to recipient if online
                const recipientSocketId = userSocketMap[recipientId];
                if (recipientSocketId) io.to(recipientSocketId).emit('message', saved);
                socket.emit('message', saved);
            } catch (err) {
                console.error('[Socket] Error:', err.message);
            }
        });

        socket.on('disconnect', () => {
            if (userId) { delete userSocketMap[userId]; console.log(`[Socket] User ${userId} disconnected`); }
        });
    });
};

module.exports = initSocket;
