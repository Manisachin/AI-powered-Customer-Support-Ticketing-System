const { processMessage } = require('../services/chatbotService');

/**
 * Socket.io chat handlers
 * Rooms are keyed by `user_<userId>` so both user and admin can join.
 */
module.exports = function initChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('[Socket] Connected:', socket.id);

        socket.on('join', ({ userId }) => {
            if (!userId) return;
            const room = `user_${userId}`;
            socket.join(room);
            console.log(`[Socket] ${socket.id} joined room ${room}`);
        });

        socket.on('typing', ({ userId, isTyping }) => {
            if (!userId) return;
            socket.to(`user_${userId}`).emit('typing', { userId, isTyping });
        });

        socket.on('send_message', async ({ userId, text }) => {
            if (!userId || !text) return;

            try {
                const { userMessage, botMessage } = await processMessage(userId, text);

                io.to(`user_${userId}`).emit('new_message', {
                    userId,
                    messages: [
                        { sender: 'user', text: userMessage },
                        { sender: 'bot', text: botMessage },
                    ],
                });
            } catch (err) {
                console.error('[Socket] Error processing message:', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected:', socket.id);
        });
    });
};

