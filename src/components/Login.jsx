import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="login-logo-icon">🏠</div>
          <div>
            <h1>Chosanta</h1>
            <span>Compliance Management System</span>
          </div>
        </div>
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@chosanta.com" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        {error && <p className="login-error">⚠ {error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <div className="login-hint">
          <strong>Demo Accounts:</strong><br />
          director@chosanta.com · pic@chosanta.com · staff1@chosanta.com<br />
          Password for all: <strong>Chosanta2025!</strong>
        </div>
      </form>
    </div>
  );
}
