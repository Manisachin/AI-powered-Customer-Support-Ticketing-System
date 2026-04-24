const db = require('../config/db');

const Ticket = {
    create: async (ticketData) => {
        const { user_id, title, description, file_path } = ticketData;
        const [result] = await db.execute(
            'INSERT INTO tickets (user_id, title, description, file_path, category, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, title, description, file_path || null, 'general', 'medium', 'open']
        );
        return result;
    },
    getByUserId: async (user_id) => {
        const [rows] = await db.execute('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        return rows;
    },
    getAll: async () => {
        const [rows] = await db.execute('SELECT t.*, u.name as user_name FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
        return rows;
    },
    updateStatus: async (id, status) => {
        const [result] = await db.execute('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
        return result;
    }
};

module.exports = Ticket;
