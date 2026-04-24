const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../config/db');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_FREE_API_KEY_HERE");

// List of high-performance models to try in order (updated to 2026 supported models)
// Gemini 1.5 models were deprecated - now using Gemini 2.x series
const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];

/**
 * Generate a response using Gemini AI with Multi-Model Fallback.
 * No local-brain heuristics; strictly uses Generative AI.
 */
async function generateAIResponse(prompt) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_FREE_API_KEY_HERE") {
        return "AI Service is not configured. Please add a valid Gemini API Key.";
    }

    // Prepare Database Context for the AI
    let servicesContext = "";
    try {
        const [services] = await db.query('SELECT service_name, service_type, status FROM services ORDER BY created_at DESC LIMIT 5');
        if (services.length > 0) {
            servicesContext = `User's Active Services: ${services.map(s => `${s.service_name} (${s.service_type}: ${s.status})`).join(', ')}`;
        }
    } catch (e) {
        console.warn("[AI] DB Context Fetch Failed:", e.message);
    }

    const systemPrompt = `
    You are the "HostAI Intelligent Assistant".
    
    SYSTEM CONTEXT:
    - Platform: HostAI (Web Hosting & Domain Provider).
    - Features: Real-time support, automated tickets, sentiment analysis.
    - ${servicesContext}
    
    GUIDELINES:
    - Respond in the language used by the user (English/Tamil).
    - Be professional, accurate, and helpful.
    - Never mention you are a model or local bot. You are the official HostAI assistant.
    `;

    // Attempt to get a response from any available AI model in the chain
    for (const modelName of MODEL_CHAIN) {
        try {
            console.log(`[Pure-AI] Contacting model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(`${systemPrompt}\n\nUSER QUERY: ${prompt}`);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`[Pure-AI] Response successful from ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`[Pure-AI] ${modelName} encountered an error:`, error.message);
            // If it's a 429 (Quota) or 404, we move to the next model in the chain
            continue;
        }
    }

    // Final failure message if ALL models fail (Quota exhaustion across all versions)
    return "HostAI's AI brain is currently experiencing high demand and has reached its processing limit. Please try again in 30 seconds or open a support ticket for urgent help.";
}

module.exports = { generateAIResponse };
