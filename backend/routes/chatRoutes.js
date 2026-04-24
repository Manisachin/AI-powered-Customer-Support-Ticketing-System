const express = require('express');
const db = require('../config/db');
const router = express.Router();

// GET /api/chat/history/:userId - basic conversation history view
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT message, sender, created_at FROM messages WHERE user_id = ? ORDER BY created_at ASC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[ChatRoutes] history error:', err.message);
        res.status(500).json({ message: 'Failed to fetch chat history' });
    }
});

// GET /api/chat/conversations - simple list for admin usage
router.get('/conversations', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, user_id, status, created_at, updated_at FROM conversations ORDER BY updated_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('[ChatRoutes] conversations error:', err.message);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

module.exports = router;

