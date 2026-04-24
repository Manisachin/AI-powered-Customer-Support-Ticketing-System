import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [services, setServices] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('tickets');
    const [searchTerm, setSearchTerm] = useState('');

    // For FAQ management
    const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

    // For ticket replies
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    // For chat grouping
    const [selectedUserChat, setSelectedUserChat] = useState(null);

    useEffect(() => {
        fetchTickets();
        fetchChatHistory();
        fetchServices();
        fetchFaqs();
        fetchStats();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await api.get('/faqs');
            setFaqs(res.data);
        } catch (err) {
            console.error('Error fetching FAQs:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets/all');
            setTickets(res.data);
        } catch (err) {
            console.error('Error fetching tickets:', err);
        }
    };

    const fetchChatHistory = async () => {
        try {
            const res = await api.get('/ai/history');
            setChatHistory(res.data);
        } catch (err) {
            console.error('Error fetching chat history:', err);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/services/all');
            setServices(res.data);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
            fetchTickets();
        } catch (err) {
            console.error(err);
        }
    };

    const handleServiceStatusUpdate = async (serviceId, newStatus) => {
        try {
            await api.put(`/services/${serviceId}/status`, { status: newStatus });
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    // Ticket View/Reply Logic
    const openTicketDetails = async (ticket) => {
        setSelectedTicket(ticket);
        setIsTicketModalOpen(true);
        try {
            const res = await api.get(`/tickets/${ticket.id}/replies`);
            setReplies(res.data);
        } catch (err) {
            console.error('Error fetching replies:', err);
        }
    };

    const handleAddReply = async (e) => {
        e.preventDefault();
        if (!newReply.trim()) return;
        try {
            await api.post(`/tickets/${selectedTicket.id}/replies`, { message: newReply });
            setNewReply('');
            // Refresh replies
            const res = await api.get(`/tickets/${selectedTicket.id}/replies`);
            setReplies(res.data);
        } catch (err) {
            console.error('Error adding reply:', err);
        }
    };

    // Filtering logic
    const filteredTickets = (tickets || []).filter(ticket =>
        (ticket.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.query?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const filteredServices = (services || []).filter(service =>
        (service.service_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (service.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (service.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Grouping chat history by user
    const groupedChats = chatHistory.reduce((acc, chat) => {
        if (!acc[chat.user_id]) {
            acc[chat.user_id] = {
                userName: chat.user_name,
                messages: []
            };
        }
        acc[chat.user_id].messages.push(chat);
        return acc;
    }, {});

    return (
        <div className="container">
            <h1 className="mb-3">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
                <button
                    className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('tickets')}
                >
                    Support Tickets
                </button>
                <button
                    className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('services')}
                >
                    User Services
                </button>
                <button
                    className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('chat')}
                >
                    User Chat History
                </button>
                <button
                    className={`btn ${activeTab === 'faqs' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('faqs')}
                >
                    Knowledge Base (FAQ)
                </button>
                <button
                    className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    System Analytics
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-input"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
                <div className="card">
                    <h3 className="card-header">All Support Tickets</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-muted">No tickets found</td></tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
                                            <td>{ticket.user_name}</td>
                                            <td>{ticket.title}</td>
                                            <td>
                                                <span className={`badge ${ticket.status === 'open' ? 'badge-success' :
                                                    ticket.status === 'pending' ? 'badge-warning' :
                                                        'badge-danger'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                            <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openTicketDetails(ticket)}>
                                                    View & Reply
                                                </button>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 'auto' }}
                                                    value={ticket.status}
                                                    onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="card">
                    <h3 className="card-header">All User Services (CRM)</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Service Name</th>
                                    <th>Type</th>
                                    <th>Plan</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Renewal</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.length === 0 ? (
                                    <tr><td colSpan="8" className="text-center text-muted">No services found</td></tr>
                                ) : (
                                    filteredServices.map((service) => (
                                        <tr key={service.id}>
                                            <td>
                                                <div>{service.user_name}</div>
                                                <small className="text-muted">{service.user_email}</small>
                                            </td>
                                            <td>{service.service_name}</td>
                                            <td><span className="badge badge-secondary">{service.service_type}</span></td>
                                            <td>{service.plan || '-'}</td>
                                            <td>${service.price}</td>
                                            <td>
                                                <span className={`badge ${service.status === 'active' ? 'badge-success' : 'badge-danger'
                                                    }`}>
                                                    {service.status}
                                                </span>
                                            </td>
                                            <td>{new Date(service.renewal_date).toLocaleDateString()}</td>
                                            <td>
                                                <select
                                                    className="form-select"
                                                    value={service.status}
                                                    onChange={(e) => handleServiceStatusUpdate(service.id, e.target.value)}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="expired">Expired</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Chat History Tab */}
            {activeTab === 'chat' && (
                <div className="grid grid-2" style={{ alignItems: 'start' }}>
                    {/* User List */}
                    <div className="card">
                        <h3 className="card-header">Activity Feed</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {Object.keys(groupedChats).map(userId => (
                                <div
                                    key={userId}
                                    className={`card mb-1 p-2`}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedUserChat === userId ? '#2563eb' : 'inherit',
                                        color: selectedUserChat === userId ? 'white' : 'inherit'
                                    }}
                                    onClick={() => setSelectedUserChat(userId)}
                                >
                                    <strong>{groupedChats[userId].userName}</strong>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                        {groupedChats[userId].messages.length} messages
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="card">
                        <h3 className="card-header">
                            {selectedUserChat ? `Chat with ${groupedChats[selectedUserChat].userName}` : 'Select a user to view chat'}
                        </h3>
                        <div style={{
                            height: '400px',
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            backgroundColor: '#0f172a'
                        }}>
                            {selectedUserChat ? (
                                groupedChats[selectedUserChat].messages.slice().reverse().map((chat, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: chat.sender === 'user' ? 'flex-start' : 'flex-end',
                                        maxWidth: '80%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: chat.sender === 'user' ? '#1e293b' : '#2563eb',
                                        color: 'white'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', marginBottom: '0.2rem', opacity: 0.7 }}>
                                            {chat.sender === 'user' ? 'User' : 'AI'}
                                        </div>
                                        {chat.message}
                                        <div style={{ fontSize: '0.6rem', marginTop: '0.2rem', opacity: 0.5, textAlign: 'right' }}>
                                            {new Date(chat.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted" style={{ marginTop: '4rem' }}>
                                    Select a conversation from the left
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
                <div className="card">
                    <div className="card-header flex justify-between align-center">
                        <h3>Knowledge Base / FAQs</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setIsFaqModalOpen(true)}>Add FAQ</button>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Category</th>
                                    <th>Added On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.map(faq => (
                                    <tr key={faq.id}>
                                        <td>{faq.question}</td>
                                        <td><span className="badge badge-secondary">{faq.category}</span></td>
                                        <td>{new Date(faq.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={async () => {
                                                if (confirm('Delete this FAQ?')) {
                                                    await api.delete(`/faqs/${faq.id}`);
                                                    fetchFaqs();
                                                }
                                            }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && stats && (
                <div>
                    <div className="grid grid-4 mb-3" style={{ gap: '1rem' }}>
                        <div className="card p-3 text-center">
                            <div className="text-muted mb-1">Total Users</div>
                            <h2 style={{ color: '#2563eb' }}>{stats.users}</h2>
                        </div>
                        <div className="card p-3 text-center">
                            <div className="text-muted mb-1">Total Tickets</div>
                            <h2 style={{ color: '#2563eb' }}>{stats.tickets}</h2>
                        </div>
                        <div className="card p-3 text-center">
                            <div className="text-muted mb-1">Open Tickets</div>
                            <h2 style={{ color: '#ef4444' }}>{stats.openTickets}</h2>
                        </div>
                        <div className="card p-3 text-center">
                            <div className="text-muted mb-1">Total AI Chats</div>
                            <h2 style={{ color: '#10b981' }}>{stats.chats}</h2>
                        </div>
                    </div>

                    <div className="card p-3 mb-3">
                        <div className="flex justify-between align-center mb-3">
                            <h3>Sentiment & Activity Overview</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => {
                                alert('Generating PDF Report... (HostAI_Monthly_Report.pdf)');
                                // Logic for PDF generation using jspdf or simplified window.print
                                window.print();
                            }}>Export to PDF</button>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4>Sentiment Distribution</h4>
                                <div style={{ display: 'flex', height: '40px', borderRadius: '20px', overflow: 'hidden', marginTop: '1rem' }}>
                                    <div style={{ width: `${(stats.sentiment.positive / stats.chats) * 100}%`, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>Positive</div>
                                    <div style={{ width: `${(stats.sentiment.neutral / stats.chats) * 100}%`, backgroundColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>Neutral</div>
                                    <div style={{ width: `${(stats.sentiment.negative / stats.chats) * 100}%`, backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>Negative</div>
                                </div>
                                <div className="flex justify-between mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                    <span>Positive: {stats.sentiment.positive}</span>
                                    <span>Neutral: {stats.sentiment.neutral}</span>
                                    <span>Negative: {stats.sentiment.negative}</span>
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h4>System Health</h4>
                                <div className="grid grid-2" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                                    <div className="p-2 card" style={{ backgroundColor: '#1e293b' }}>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>AI Success Rate</div>
                                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>98.2%</div>
                                    </div>
                                    <div className="p-2 card" style={{ backgroundColor: '#1e293b' }}>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Avg Response Time</div>
                                        <div style={{ color: '#2563eb', fontWeight: 'bold' }}>1.2s</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ ADD MODAL */}
            {isFaqModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 101,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="card" style={{ width: '400px' }}>
                        <div className="card-header">Add New FAQ</div>
                        <div className="p-3">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await api.post('/faqs', newFaq);
                                    setIsFaqModalOpen(false);
                                    setNewFaq({ question: '', answer: '', category: 'General' });
                                    fetchFaqs();
                                } catch (err) {
                                    console.error('Error adding FAQ:', err);
                                }
                            }}>
                                <div className="mb-2">
                                    <label>Question</label>
                                    <input type="text" className="form-input" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} required />
                                </div>
                                <div className="mb-2">
                                    <label>Answer</label>
                                    <textarea className="form-input" value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label>Category</label>
                                    <select className="form-select" value={newFaq.category} onChange={e => setNewFaq({ ...newFaq, category: e.target.value })}>
                                        <option value="General">General</option>
                                        <option value="Billing">Billing</option>
                                        <option value="Technical">Technical</option>
                                        <option value="Account">Account</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary flex-1">Save FAQ</button>
                                    <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsFaqModalOpen(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Details Modal-like Overlay */}
            {isTicketModalOpen && selectedTicket && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="card-header flex justify-between align-center">
                            <h3>Ticket: {selectedTicket.title}</h3>
                            <button className="btn btn-secondary" onClick={() => setIsTicketModalOpen(false)}>Close</button>
                        </div>
                        <div className="p-3">
                            <div className="mb-3" style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                                <strong>User Query:</strong>
                                <p className="mb-2">{selectedTicket.query}</p>
                                {selectedTicket.file_path && (
                                    <a href={`http://localhost:5000/${selectedTicket.file_path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">
                                        View Attachment
                                    </a>
                                )}
                            </div>

                            <hr className="mb-3" />

                            <h4 className="mb-2">Conversation</h4>
                            <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                                {replies.length === 0 ? (
                                    <p className="text-center text-muted">No replies yet.</p>
                                ) : (
                                    replies.map((reply, idx) => (
                                        <div key={idx} className="mb-2 p-2" style={{
                                            backgroundColor: reply.sender === 'admin' ? '#2563eb' : '#1e293b',
                                            borderRadius: '8px',
                                            marginLeft: reply.sender === 'admin' ? '2rem' : '0',
                                            marginRight: reply.sender === 'admin' ? '0' : '2rem',
                                            color: 'white'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {reply.sender === 'admin' ? 'Admin' : reply.user_name} - {new Date(reply.timestamp).toLocaleString()}
                                            </div>
                                            {reply.message}
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddReply}>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Type your message to the user..."
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">Send Message</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
