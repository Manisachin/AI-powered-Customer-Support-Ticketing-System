import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('services');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // New Ticket State
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [title, setTitle] = useState('');
    const [query, setQuery] = useState('');
    const [file, setFile] = useState(null);

    // Ticket View/Reply Logic
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError(null);
            console.log('[Dashboard] Fetching tickets and services...');
            const [ticketsRes, servicesRes] = await Promise.all([
                api.get('/tickets/my-tickets'),
                api.get('/services/my-services')
            ]);
            console.log('[Dashboard] Tickets received:', ticketsRes.data);
            if (ticketsRes.data.length > 0) {
                console.log('[Dashboard] First ticket fields:', Object.keys(ticketsRes.data[0]));
            }
            setTickets(ticketsRes.data);
            setServices(servicesRes.data);
        } catch (err) {
            console.error('[Dashboard] Error fetching data:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load dashboard data. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('query', query);
        if (file) formData.append('file', file);

        try {
            await api.post('/tickets', formData);
            setTitle('');
            setQuery('');
            setFile(null);
            setShowTicketForm(false);
            fetchData();
            alert('Ticket created successfully!');
        } catch (err) {
            console.error('[Dashboard] Error creating ticket:', err);
            const msg = err.response?.data?.message || 'Failed to create ticket. Please check if all fields are filled.';
            setError(msg);
        }
    };

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

    if (loading) return <div className="container text-center">Loading...</div>;

    // Filter services into Domain and Hosting groups
    const domains = services.filter(s => s.service_type === 'domain');
    const hosting = services.filter(s => s.service_type === 'hosting');

    return (
        <div className="container">
            <h1 className="mb-3">My Dashboard</h1>

            {/* Error Alert */}
            {error && (
                <div className="card mb-3" style={{ borderColor: '#ef4444', backgroundColor: '#7f1d1d' }}>
                    <div className="p-3">
                        <strong>⚠️ Error:</strong> {error}
                    </div>
                </div>
            )}

            {/* Quick Stats Overview */}
            <div className="grid grid-3 mb-3">
                <div className="card text-center" style={{ borderColor: '#2563eb' }}>
                    <h4 className="text-muted">Domains</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{domains.length}</div>
                </div>
                <div className="card text-center" style={{ borderColor: '#7c3aed' }}>
                    <h4 className="text-muted">Hosting</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{hosting.length}</div>
                </div>
                <div className="card text-center" style={{ borderColor: '#10b981' }}>
                    <h4 className="text-muted">Active Tickets</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{tickets.filter(t => t.status !== 'closed').length}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
                <button
                    className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('services')}
                >
                    My Services
                </button>
                <button
                    className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('tickets')}
                >
                    Support Tickets
                </button>
            </div>

            {/* Services View */}
            {activeTab === 'services' && (
                <div className="grid grid-2">
                    <div className="card">
                        <h3 className="card-header">Managed Domains</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Domain Name</th>
                                        <th>Price</th>
                                        <th>Renewal Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {domains.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center text-muted">No domains registered</td></tr>
                                    ) : (
                                        domains.map(domain => (
                                            <tr key={domain.id}>
                                                <td><strong>{domain.service_name}</strong></td>
                                                <td>${domain.price}/yr</td>
                                                <td>{new Date(domain.renewal_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-header">Hosting Plans</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Plan</th>
                                        <th>Price</th>
                                        <th>Renewal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hosting.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center text-muted">No hosting plans</td></tr>
                                    ) : (
                                        hosting.map(h => (
                                            <tr key={h.id}>
                                                <td>{h.service_name}</td>
                                                <td><span className="badge badge-secondary">{h.plan}</span></td>
                                                <td>${h.price}/mo</td>
                                                <td>{new Date(h.renewal_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tickets View */}
            {activeTab === 'tickets' && (
                <div className="card">
                    <div className="card-header flex justify-between align-center">
                        <h3>My Support Tickets</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowTicketForm(!showTicketForm)}>
                            {showTicketForm ? 'Close Form' : 'Create New Ticket'}
                        </button>
                    </div>

                    {showTicketForm && (
                        <div className="p-3 border-bottom">
                            <form onSubmit={handleTicketSubmit}>
                                <div className="mb-2">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label>Briefly describe your issue</label>
                                    <textarea
                                        className="form-input"
                                        style={{ minHeight: '100px' }}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-2">
                                    <label>Attach Screenshot (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Submit Ticket</button>
                            </form>
                        </div>
                    )}

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted">You have no tickets</td></tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
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
                                            <td>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openTicketDetails(ticket)}>
                                                    View Conversation
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ticket Details Modal Overlay */}
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
                    <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="card-header flex justify-between align-center">
                            <h3>Conversation: {selectedTicket.title}</h3>
                            <button className="btn btn-secondary" onClick={() => setIsTicketModalOpen(false)}>Close</button>
                        </div>
                        <div className="p-3">
                            <div className="mb-3" style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                                <strong>Your Query:</strong>
                                <p>{selectedTicket.description || selectedTicket.query}</p>
                            </div>

                            <hr className="mb-3" />

                            <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                                {replies.length === 0 ? (
                                    <p className="text-center text-muted">Waiting for support team to reply...</p>
                                ) : (
                                    replies.map((reply, idx) => (
                                        <div key={idx} className="mb-2 p-2" style={{
                                            backgroundColor: reply.sender === 'admin' ? '#2563eb' : '#1e293b',
                                            borderRadius: '8px',
                                            marginLeft: reply.sender === 'admin' ? '0' : '2rem',
                                            marginRight: reply.sender === 'admin' ? '2rem' : '0',
                                            color: 'white'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {reply.sender === 'admin' ? 'HostAI Support' : 'You'} - {new Date(reply.timestamp).toLocaleString()}
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
                                        placeholder="Type your message..."
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">Send</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
