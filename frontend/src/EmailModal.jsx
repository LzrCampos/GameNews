import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import './index.css';

const EmailModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const response = await fetch(`${backendUrl}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessData(data);
            } else {
                setError(data.error || 'Failed to send email.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Network error. Is the backend server running?');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset state when closing
        setTimeout(() => {
            setEmail('');
            setSuccessData(null);
            setError('');
        }, 300);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>
                    <X size={20} />
                </button>

                {!successData ? (
                    <>
                        <div className="modal-header">
                            <Mail size={32} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ marginBottom: '0.5rem' }}>Share Top Posts</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                                Enter an email address to send a beautifully formatted digest of the top 5 most highly-rated anime posts right now.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="email"
                                    className="modal-input"
                                    placeholder="Enter email address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                                {error && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
                            </div>

                            <button
                                type="submit"
                                className="modal-submit-btn"
                                disabled={isSubmitting || !email}
                            >
                                {isSubmitting ? (
                                    <svg style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Digest Email
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="modal-success-state" style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(75, 123, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Send size={32} color="var(--accent-blue)" />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Digest Sent!</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            The HTML email with the top 5 posts was generated successfully via our test server.
                        </p>
                        <a
                            href={successData.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-submit-btn"
                            style={{ textDecoration: 'none', display: 'inline-flex', justifyContent: 'center' }}
                        >
                            View Email Preview
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailModal;
