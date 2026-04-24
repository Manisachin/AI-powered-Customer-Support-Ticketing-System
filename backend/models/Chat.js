const db = require('../config/db');

const Chat = {
    saveMessage: async (data) => {
        const { user_id, message, sender } = data;
        const [result] = await db.execute(
            'INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)',
            [user_id, message, sender]
        );
        return result;
    },
    getHistory: async (user_id) => {
        const [rows] = await db.execute(
            'SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC',
            [user_id]
        );
        return rows;
    },
    getAllHistory: async () => {
        const [rows] = await db.execute(
            'SELECT ch.*, u.name as user_name FROM chat_history ch JOIN users u ON ch.user_id = u.id ORDER BY ch.timestamp DESC'
        );
        return rows;
    }
};

module.exports = Chat;
