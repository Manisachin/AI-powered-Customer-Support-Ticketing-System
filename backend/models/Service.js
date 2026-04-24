const db = require('../config/db');

const Service = {
    // Get all services for a user
    getUserServices: async (userId) => {
        const [rows] = await db.execute(
            'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    },

    // Get all services (admin)
    getAllServices: async () => {
        const [rows] = await db.execute(`
            SELECT s.*, u.name as user_name, u.email as user_email 
            FROM services s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.created_at DESC
        `);
        return rows;
    },

    // Create new service
    create: async (serviceData) => {
        const { user_id, service_type, service_name, plan, status, price, renewal_date } = serviceData;
        const [result] = await db.execute(
            'INSERT INTO services (user_id, service_type, service_name, plan, status, price, renewal_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [user_id, service_type, service_name, plan, status || 'active', price, renewal_date]
        );
        return result;
    },

    // Update service status
    updateStatus: async (id, status) => {
        const [result] = await db.execute(
            'UPDATE services SET status = ? WHERE id = ?',
            [status, id]
        );
        return result;
    }
};

module.exports = Service;
