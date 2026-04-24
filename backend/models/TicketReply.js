const db = require('../config/db');

const TicketReply = {
    create: async (replyData) => {
        const { ticket_id, user_id, message, sender } = replyData;
        const [result] = await db.execute(
            'INSERT INTO ticket_replies (ticket_id, user_id, message, sender) VALUES (?, ?, ?, ?)',
            [ticket_id, user_id, message, sender]
        );
        return result;
    },
    getByTicketId: async (ticketId) => {
        const [rows] = await db.execute(`
            SELECT tr.*, u.name as user_name 
            FROM ticket_replies tr 
            JOIN users u ON tr.user_id = u.id 
            WHERE tr.ticket_id = ? 
            ORDER BY tr.timestamp ASC
        `, [ticketId]);
        return rows;
    }
};

module.exports = TicketReply;
