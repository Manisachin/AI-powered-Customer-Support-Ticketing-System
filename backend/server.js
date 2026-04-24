const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io instance (real-time chat)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Attach Socket.io chat handlers
require('./sockets/chatSocket')(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/', (req, res) => {
    res.send('AI Customer Support API with Real-time Chat is running...');
});

const PORT = process.env.PORT || 5005;

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

// Prevent crash on uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

process.on('exit', (code) => {
    console.log(
        `[Lifecycle] PROCESS EXIT: Server process exited with code ${code} at ${new Date().toISOString()}`
    );
});

process.on('SIGINT', () => {
    console.log('[Lifecycle] PROCESS SIGINT: Received Ctrl+C');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[Lifecycle] PROCESS SIGTERM: Termination signal received');
    process.exit(0);
});

// Keep event loop alive for debugging
setInterval(() => {
    console.log('[Heartbeat] Server still alive at', new Date().toLocaleTimeString());
}, 60000); // Once a minute

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});
