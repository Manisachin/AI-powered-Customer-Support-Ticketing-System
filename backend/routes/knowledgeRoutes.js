const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Minimal CRUD for knowledge_base table as per proposal

// GET /api/knowledge
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM knowledge_base ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error('[KnowledgeRoutes] list error:', err.message);
        res.status(500).json({ message: 'Failed to fetch knowledge base' });
    }
});

// POST /api/knowledge
router.post('/', async (req, res) => {
    const { question, answer, category } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO knowledge_base (question, answer, category, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [question, answer, category || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Knowledge entry created' });
    } catch (err) {
        console.error('[KnowledgeRoutes] create error:', err.message);
        res.status(500).json({ message: 'Failed to create knowledge entry' });
    }
});

// PUT /api/knowledge/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { question, answer, category } = req.body;
    try {
        await db.query(
            'UPDATE knowledge_base SET question = ?, answer = ?, category = ?, updated_at = NOW() WHERE id = ?',
            [question, answer, category || null, id]
        );
        res.json({ message: 'Knowledge entry updated' });
    } catch (err) {
        console.error('[KnowledgeRoutes] update error:', err.message);
        res.status(500).json({ message: 'Failed to update knowledge entry' });
    }
});

// DELETE /api/knowledge/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM knowledge_base WHERE id = ?', [id]);
        res.json({ message: 'Knowledge entry deleted' });
    } catch (err) {
        console.error('[KnowledgeRoutes] delete error:', err.message);
        res.status(500).json({ message: 'Failed to delete knowledge entry' });
    }
});

module.exports = router;

