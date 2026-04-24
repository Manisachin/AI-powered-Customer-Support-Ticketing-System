import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ChatPage = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/chat/history/${user.id}`);
                setMessages(
                    res.data.map((m) => ({
                        sender: m.sender || (m.user_id === user.id ? 'user' : 'bot'),
                        text: m.message || m.text,
                    }))
                );
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (payload) => {
            const flat = payload.messages.map((m) => ({
                sender: m.sender,
                text: m.text,
            }));
            setMessages((prev) => [...prev, ...flat]);
        });

        socket.on('typing', ({ isTyping }) => {
            setTyping(isTyping);
        });

        return () => {
            socket.off('new_message');
            socket.off('typing');
        };
    }, [socket]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!socket || !user || !input.trim()) return;
        socket.emit('send_message', { userId: user.id, text: input });
        setInput('');
    };

    const handleTyping = (e) => {
        setInput(e.target.value);
        if (!socket || !user) return;
        socket.emit('typing', { userId: user.id, isTyping: true });
        setTimeout(() => {
            socket.emit('typing', { userId: user.id, isTyping: false });
        }, 800);
    };

    return (
        <div className="container">
            <h1 className="mb-3">Real-time AI Chat</h1>
            <div className="chat-container">
                <div className="chat-header">Chat with AI Support Bot</div>
                <div className="chat-messages">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`chat-message ${m.sender}`}>
                            <div className="chat-avatar">{m.sender === 'user' ? 'U' : 'AI'}</div>
                            <div className="chat-bubble">
                                <p>{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="chat-message ai">
                            <div className="chat-avatar">AI</div>
                            <div className="chat-bubble">
                                <p>Typing...</p>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSend} className="chat-input-container">
                    <input
                        type="text"
                        className="form-input chat-input"
                        placeholder="Type your message..."
                        value={input}
                        onChange={handleTyping}
                    />
                    <button type="submit" className="btn btn-primary">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;

