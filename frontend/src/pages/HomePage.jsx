import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HomePage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [domainName, setDomainName] = useState('');
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseMsg, setPurchaseMsg] = useState({ type: '', text: '' });

    const handleBuy = async (serviceType, serviceName, plan, price) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setPurchaseLoading(true);
        setPurchaseMsg({ type: '', text: '' });

        try {
            await api.post('/services/buy', {
                service_type: serviceType,
                service_name: serviceName,
                plan: plan,
                price: price
            });
            setPurchaseMsg({ type: 'success', text: `Successfully purchased ${serviceName}!` });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setPurchaseMsg({ type: 'error', text: err.response?.data?.message || 'Purchase failed' });
        } finally {
            setPurchaseLoading(false);
        }
    };

    const handleDomainSearch = (e) => {
        e.preventDefault();
        if (!domainName) return;
        handleBuy('domain', domainName, 'Standard', 12.99);
    };

    return (
        <div>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                padding: '4rem 0',
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
                        HostAI - Premium Web Hosting
                    </h1>
                    <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9, color: 'white' }}>
                        Fast, Reliable & Secure Hosting with 24/7 AI Support
                    </p>

                    {purchaseMsg.text && (
                        <div className={`container ${purchaseMsg.type === 'success' ? 'success-message' : 'error-message'}`} style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                            {purchaseMsg.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {user ? (
                            <Link to="/dashboard" className="btn" style={{
                                backgroundColor: 'white',
                                color: '#2563eb',
                                padding: '1rem 2rem',
                                fontSize: '1.125rem'
                            }}>
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn" style={{
                                    backgroundColor: 'white',
                                    color: '#2563eb',
                                    padding: '1rem 2rem',
                                    fontSize: '1.125rem'
                                }}>
                                    Get Started
                                </Link>
                                <Link to="/login" className="btn btn-secondary" style={{
                                    padding: '1rem 2rem',
                                    fontSize: '1.125rem'
                                }}>
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Domain Search Mock */}
                <div className="card" style={{ marginTop: '-6rem', zIndex: 10, position: 'relative', padding: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Find Your Perfect Domain</h2>
                    <form onSubmit={handleDomainSearch} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="enter-your-domain.com"
                            value={domainName}
                            onChange={(e) => setDomainName(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" disabled={purchaseLoading}>
                            {purchaseLoading ? 'Processing...' : 'Register'}
                        </button>
                    </form>
                </div>

                {/* Hosting Plans */}
                <div style={{ margin: '4rem 0' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
                        Our Hosting Plans
                    </h2>
                    <div className="grid grid-3">
                        {/* Basic Plan */}
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                                Basic
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                $9.99<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
                            </div>
                            <ul style={{ textAlign: 'left', marginTop: '1.5rem', lineHeight: '2' }}>
                                <li>✓ 10 GB SSD Storage</li>
                                <li>✓ 100 GB Bandwidth</li>
                                <li>✓ 1 Website</li>
                                <li>✓ Free SSL Certificate</li>
                                <li>✓ 24/7 AI Support</li>
                            </ul>
                            <button
                                onClick={() => handleBuy('hosting', 'Basic Plan', 'Basic', 9.99)}
                                className="btn btn-primary"
                                style={{ marginTop: '1.5rem', width: '100%' }}
                                disabled={purchaseLoading}
                            >
                                Choose Plan
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="card" style={{
                            textAlign: 'center',
                            border: '2px solid #2563eb',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '0.25rem 1rem',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                POPULAR
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                                Professional
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                $29.99<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
                            </div>
                            <ul style={{ textAlign: 'left', marginTop: '1.5rem', lineHeight: '2' }}>
                                <li>✓ 50 GB SSD Storage</li>
                                <li>✓ Unlimited Bandwidth</li>
                                <li>✓ 5 Websites</li>
                                <li>✓ Free SSL Certificate</li>
                                <li>✓ Free Domain (1 year)</li>
                                <li>✓ 24/7 AI Support</li>
                                <li>✓ Daily Backups</li>
                            </ul>
                            <button
                                onClick={() => handleBuy('hosting', 'Pro Plan', 'Professional', 29.99)}
                                className="btn btn-primary"
                                style={{ marginTop: '1.5rem', width: '100%' }}
                                disabled={purchaseLoading}
                            >
                                Choose Plan
                            </button>
                        </div>

                        {/* Business Plan */}
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                                Business
                            </h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                $59.99<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span>
                            </div>
                            <ul style={{ textAlign: 'left', marginTop: '1.5rem', lineHeight: '2' }}>
                                <li>✓ 100 GB SSD Storage</li>
                                <li>✓ Unlimited Bandwidth</li>
                                <li>✓ Unlimited Websites</li>
                                <li>✓ Free SSL Certificate</li>
                                <li>✓ Free Domain (1 year)</li>
                                <li>✓ 24/7 AI Support</li>
                                <li>✓ Daily Backups</li>
                                <li>✓ Priority Support</li>
                            </ul>
                            <button
                                onClick={() => handleBuy('hosting', 'Business Plan', 'Business', 59.99)}
                                className="btn btn-primary"
                                style={{ marginTop: '1.5rem', width: '100%' }}
                                disabled={purchaseLoading}
                            >
                                Choose Plan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
                        Why Choose HostAI?
                    </h2>
                    <div className="grid grid-3">
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Lightning Fast</h3>
                            <p className="text-muted">
                                SSD storage and optimized servers for maximum speed
                            </p>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>AI Support</h3>
                            <p className="text-muted">
                                Get instant help 24/7 from our intelligent AI assistant
                            </p>
                        </div>

                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Secure & Reliable</h3>
                            <p className="text-muted">
                                Free SSL, daily backups, and 99.9% uptime guarantee
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
