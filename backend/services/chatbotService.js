const db = require('../config/db');
const { analyzeMessage } = require('./nlpEngine');
const { generateAIResponse } = require('./aiService');

/**
 * Process a user message using FAQ + AI (Gemini) fallback.
 * Uses the actual 'chat_history' table from the schema.
 */
async function processMessage(userId, text) {
    const analysis = await analyzeMessage(text);
    const userMessage = text;

    // AI Response Hierarchy
    let botMessage = "";
    let escalated = false;

    try {
        // 1. Try Knowledge Base (FAQ)
        const [faqs] = await db.query(
            'SELECT answer FROM faqs WHERE question LIKE ? OR ? LIKE CONCAT("%", question, "%") LIMIT 1',
            [`%${text}%`, text]
        );

        if (faqs.length > 0) {
            botMessage = faqs[0].answer;
        }
        // 2. Try Rule-based Intents
        else if (analysis.intent === 'refund_request') {
            botMessage = 'I understand you need a refund. I can process this for you. Please provide your Order ID.';
        }
        // 3. Difficult Question or Negative Sentiment Detection
        else if (text.length > 150 ||
            text.toLowerCase().includes('emergency') ||
            text.toLowerCase().includes('critical') ||
            analysis.sentiment === 'negative'
        ) {
            botMessage = analysis.sentiment === 'negative' ?
                "I'm sorry you're feeling frustrated. I'm escalating this to a human manager right now to ensure your issue is resolved immediately. Check 'Tickets' for our response." :
                "This sounds critical. I'm escalating this to a human agent right now. You can check the 'Tickets' section for their reply.";

            escalated = true;
            await db.query(
                'INSERT INTO tickets (user_id, title, query, status, created_at) VALUES (?, ?, ?, ?, NOW())',
                [userId, (analysis.sentiment === 'negative' ? '[Urgent-Sentiment] ' : '[AI-Escalated] ') + text.substring(0, 30), text, 'open']
            );
        }
        // 4. Dynamic AI Brain (Gemini)
        else {
            botMessage = await generateAIResponse(text);
        }
    } catch (err) {
        console.warn('[Chatbot] AI Logic Error:', err.message);
        botMessage = "I'm experiencing a brief connection issue. Please try rephrasing your question.";
    }

    // Persist messages in 'chat_history' table (matches schema.sql)
    try {
        // Save User Message
        await db.query(
            'INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)',
            [userId, userMessage, 'user']
        );
        // Save AI Response
        await db.query(
            'INSERT INTO chat_history (user_id, message, sender) VALUES (?, ?, ?)',
            [userId, botMessage, 'ai']
        );
    } catch (err) {
        console.warn('[Chatbot] Persistence failed:', err.message);
    }

    return { userMessage, botMessage, analysis, escalated };
}

module.exports = { processMessage };
