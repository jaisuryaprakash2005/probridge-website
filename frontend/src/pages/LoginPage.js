import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendPhoneOtp } from '../services/api';
import Logo from '../components/Logo';
import { AlertCircle } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { user, loginWithPhone } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }
  }, [step]);

  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtp({ phone: cleanPhone });
      if (res.data?.devOtp) setDevOtp(res.data.devOtp);
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const enteredOtp = otp.join('').trim();
    if (enteredOtp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await loginWithPhone(name.trim(), cleanPhone, enteredOtp);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const char = val.slice(-1);
    if (char && !/[0-9]/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (char && index === 5 && newOtp.every((d) => d !== '')) {
      const full = newOtp.join('');
      setLoading(true);
      loginWithPhone(name.trim(), cleanPhone, full)
        .then(() => navigate('/', { replace: true }))
        .catch((err) => {
          setError(err.response?.data?.message || 'Invalid verification code');
          setLoading(false);
        });
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
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

        <h1 className={styles.heading}>
          {step === 1 ? 'Login to ProBridge' : 'Verify Mobile'}
        </h1>
        <p className={styles.sub}>
          {step === 1
            ? 'Enter your name and mobile number to continue'
            : `Enter 6-digit OTP sent to +91 ${cleanPhone}`}
        </p>

        {error && (
          <div className={styles.error} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {devOtp && step === 2 && (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              color: '#166534',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
            }}
            onClick={() => setOtp(devOtp.split('').slice(0, 6))}
            title="Click to auto-fill"
          >
            <span>Dev Code:</span>
            <span>{devOtp} (Click to fill)</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mobile Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    background: '#F1F5F9',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#475569',
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ flex: 1 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !name.trim() || cleanPhone.length !== 10}
            >
              {loading ? 'Sending OTP…' : 'Continue with Mobile'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0 16px' }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpInputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  style={{
                    width: 44,
                    height: 50,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    borderRadius: 10,
                    border: d ? '2px solid #0284C7' : '1.5px solid #CBD5E1',
                    background: d ? '#F0F9FF' : '#F8FAFC',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || otp.some((d) => d === '')}
            >
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 13 }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: 0 }}
              >
                Change Number
              </button>

              {resendTimer > 0 ? (
                <span style={{ color: '#64748B' }}>Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
