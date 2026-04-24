const Sentiment = require('sentiment');

const sentimentAnalyzer = new Sentiment();

/**
 * Very lightweight NLP placeholder.
 * You can extend this with `natural`, `compromise`, etc.
 */
async function analyzeMessage(text) {
    const lower = text.toLowerCase();
    let intent = 'general_query';
    let confidence = 0.6;

    if (lower.includes('refund')) {
        intent = 'refund_request';
        confidence = 0.9;
    } else if (lower.includes('billing') || lower.includes('invoice')) {
        intent = 'billing_query';
        confidence = 0.8;
    } else if (lower.includes('domain')) {
        intent = 'domain_query';
        confidence = 0.8;
    }

    const sentimentResult = sentimentAnalyzer.analyze(text);
    const sentiment =
        sentimentResult.score > 1 ? 'positive' : sentimentResult.score < -1 ? 'negative' : 'neutral';

    return {
        intent,
        confidence,
        sentiment,
        entities: [], // extend later if needed
    };
}

module.exports = {
    analyzeMessage,
};

