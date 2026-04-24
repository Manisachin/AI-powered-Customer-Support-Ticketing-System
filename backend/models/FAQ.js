const db = require('../config/db');

const FAQ = {
    create: async (faqData) => {
        const { question, answer, category } = faqData;
        const [result] = await db.execute(
            'INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)',
            [question, answer, category]
        );
        return result;
    },
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM faqs ORDER BY created_at DESC');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM faqs WHERE id = ?', [id]);
        return rows[0];
    },
    update: async (id, faqData) => {
        const { question, answer, category } = faqData;
        const [result] = await db.execute(
            'UPDATE faqs SET question = ?, answer = ?, category = ? WHERE id = ?',
            [question, answer, category, id]
        );
        return result;
    },
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM faqs WHERE id = ?', [id]);
        return result;
    },
    search: async (query) => {
        const [rows] = await db.execute(
            'SELECT * FROM faqs WHERE question LIKE ? OR answer LIKE ?',
            [`%${query}%`, `%${query}%`]
        );
        return rows;
    }
};

module.exports = FAQ;
