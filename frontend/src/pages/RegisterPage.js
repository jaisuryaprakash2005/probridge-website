import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,  setForm]  = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div style={{ display: 'inline-block', background: 'var(--brand)', padding: '10px 18px', borderRadius: 10, marginBottom: 12 }}>
            <Logo size="sm" showTagline={true} />
          </div>
        </div>
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Join thousands of property seekers</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input type="text" className={styles.input} placeholder="Your Name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" className={styles.input} placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Phone (optional)</label>
            <input type="tel" className={styles.input} placeholder="+91 98765 43210" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input type="password" className={styles.input} placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

