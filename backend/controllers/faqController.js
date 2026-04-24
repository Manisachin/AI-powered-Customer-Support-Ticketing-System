const FAQ = require('../models/FAQ');

exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.getAll();
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createFAQ = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { question, answer, category } = req.body;
        await FAQ.create({ question, answer, category: category || 'General' });
        res.status(201).json({ message: 'FAQ created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateFAQ = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { question, answer, category } = req.body;
        await FAQ.update(id, { question, answer, category });
        res.json({ message: 'FAQ updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        await FAQ.delete(id);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
