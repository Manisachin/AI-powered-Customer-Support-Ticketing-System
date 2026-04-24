const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: async (userData) => {
        const { name, email, password, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user']
        );
        return result;
    },
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = User;
