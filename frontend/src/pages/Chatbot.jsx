import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/ai/history');
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + ' ' + transcript);
        };
        recognition.start();
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Look for common voices or use default
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(v => v.lang.includes('en')) || voices[0];
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { message: input, sender: 'user', timestamp: new Date() };
        setMessages([...messages, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/ask', { message: input });
            const aiMsg = { message: res.data.response, sender: 'ai', timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
            // Automatically speak AI response
            speak(res.data.response);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1 className="mb-3">AI Customer Support</h1>

            <div className="chat-container">
                <div className="chat-header">
                    HostAI Assistant - Ask me anything about hosting, domains, or billing
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="text-center text-muted">
                            <p>Welcome! How can I help you today?</p>
                            <p>Try asking about domains, hosting plans, or pricing.</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender}`}>
                            <div className="chat-avatar">
                                {msg.sender === 'user' ? 'U' : 'AI'}
                            </div>
                            <div className="chat-bubble">
                                <p>{msg.message}</p>
                                <small className="text-muted">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </small>
                                {msg.sender === 'ai' && (
                                    <button
                                        onClick={() => speak(msg.message)}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '5px', opacity: 0.6 }}
                                        title="Speak message"
                                    >
                                        🔊
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chat-message ai">
                            <div className="chat-avatar">AI</div>
                            <div className="chat-bubble">
                                <p>Typing...</p>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-container">
                    <button
                        type="button"
                        className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={startListening}
                        title="Voice Input"
                        style={{ padding: '0.5rem' }}
                    >
                        {isListening ? '🛑' : '🎤'}
                    </button>
                    <input
                        type="text"
                        className="form-input chat-input"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !input.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
