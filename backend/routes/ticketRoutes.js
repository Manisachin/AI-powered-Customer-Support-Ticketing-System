const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), ticketController.createTicket);
router.get('/my-tickets', auth, ticketController.getUserTickets);
router.get('/all', auth, ticketController.getAllTickets);
router.put('/:id/status', auth, ticketController.updateTicketStatus);
router.get('/:id/replies', auth, ticketController.getReplies);
router.post('/:id/replies', auth, ticketController.addReply);

module.exports = router;
