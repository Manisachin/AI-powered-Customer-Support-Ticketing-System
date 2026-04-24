const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const [userCount] = await db.execute('SELECT COUNT(*) as total FROM users WHERE role = "user"');
        const [ticketCount] = await db.execute('SELECT COUNT(*) as total FROM tickets');
        const [openTickets] = await db.execute('SELECT COUNT(*) as total FROM tickets WHERE status = "open"');
        const [chatCount] = await db.execute('SELECT COUNT(*) as total FROM chat_history');

        // Sentiment stats (mock data or based on stored sentiment if available)
        // For now, let's just return counts

        res.json({
            users: userCount[0].total,
            tickets: ticketCount[0].total,
            openTickets: openTickets[0].total,
            chats: chatCount[0].total,
            sentiment: {
                positive: Math.round(chatCount[0].total * 0.4),
                neutral: Math.round(chatCount[0].total * 0.4),
                negative: Math.round(chatCount[0].total * 0.2)
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
