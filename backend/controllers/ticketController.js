const Ticket = require('../models/Ticket');
const TicketReply = require('../models/TicketReply');

exports.createTicket = async (req, res) => {
    try {
        const { title, query } = req.body;
        const file_path = req.file ? req.file.path : null;
        await Ticket.create({
            user_id: req.user.id,
            title,
            description: query, // Frontend sends 'query', backend uses 'description'
            file_path
        });
        res.status(201).json({ message: 'Ticket created successfully' });
    } catch (err) {
        console.error('[Tickets] Error creating ticket:', err.message);
        res.status(500).json({ message: 'Failed to create ticket. Please try again.' });
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        console.log(`[Tickets] Fetching tickets for user ID: ${req.user.id}`);
        const tickets = await Ticket.getByUserId(req.user.id);
        console.log(`[Tickets] Found ${tickets.length} tickets for user ${req.user.id}`);
        res.json(tickets);
    } catch (err) {
        console.error(`[Tickets] Error fetching tickets for user ${req.user.id}:`, err.message);
        res.status(500).json({ message: 'Failed to fetch tickets. Please try again later.' });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const tickets = await Ticket.getAll();
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { status } = req.body;
        await Ticket.updateStatus(id, status);
        res.json({ message: 'Ticket status updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getReplies = async (req, res) => {
    try {
        const replies = await TicketReply.getByTicketId(req.params.id);
        res.json(replies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addReply = async (req, res) => {
    try {
        const { message } = req.body;
        await TicketReply.create({
            ticket_id: req.params.id,
            user_id: req.user.id,
            message,
            sender: req.user.role === 'admin' ? 'admin' : 'user'
        });
        res.status(201).json({ message: 'Reply added successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
