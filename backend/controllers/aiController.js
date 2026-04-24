const Chat = require('../models/Chat');
const { processMessage } = require('../services/chatbotService');

/**
 * AI Chatbot Controller using enhanced Chatbot Service (FAQ + Gemini)
 */
exports.askAI = async (req, res) => {
    try {
        const { message } = req.body;
        const user_id = req.user.id;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Process message using the centralized AI service (FAQ + Gemini)
        const { botMessage } = await processMessage(user_id, message);

        res.json({ response: botMessage });
    } catch (err) {
        console.error('AI Controller Error:', err);
        res.status(500).json({ message: "I'm having a little trouble connecting to my AI brain. Please try again or create a support ticket!" });
    }
};


exports.getChatHistory = async (req, res) => {
    try {
        let history;
        if (req.user.role === 'admin') {
            history = await Chat.getAllHistory();
        } else {
            history = await Chat.getHistory(req.user.id);
        }
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
