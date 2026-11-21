import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, ShieldCheck, ArrowRight, AlertCircle, Phone, RefreshCw, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import styles from './LoginModal.module.css';
import { auth } from '../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import api from '../services/api';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal } = useAuth();

  const [step, setStep] = useState(1); // 1 = Name & Mobile, 2 = SMS OTP
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const otpInputsRef = useRef([]);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerRef = useRef(null);

  // Initialize or reset reCAPTCHA
  const initRecaptcha = useCallback(() => {
    // Teardown any existing verifier
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (_) {}
      recaptchaVerifierRef.current = null;
    }

    setRecaptchaReady(false);

    const el = document.getElementById('recaptcha-box');
    if (!el) return;
    el.innerHTML = '';

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-box', {
        size: 'normal',
        callback: (response) => {
          console.log('✅ Real reCAPTCHA v2 token obtained (length:', response?.length, ')');
          window.__v2RecaptchaToken = response;
          setRecaptchaReady(true);
          setError('');
        },
        'expired-callback': () => {
          window.__v2RecaptchaToken = null;
          setRecaptchaReady(false);
          setError('reCAPTCHA expired. Please tick the checkbox again.');
        },
      });

      verifier.render().then(() => {
        recaptchaVerifierRef.current = verifier;
      }).catch((err) => {
        console.error('reCAPTCHA render error:', err);
      });
    } catch (err) {
      console.error('RecaptchaVerifier creation error:', err);
    }
  }, []);

  // When modal opens on Step 1, render the reCAPTCHA box
  useEffect(() => {
    if (loginModalOpen && step === 1) {
      const timer = setTimeout(() => {
        initRecaptcha();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loginModalOpen, step, initRecaptcha]);

  // Reset state on modal open
  useEffect(() => {
    if (loginModalOpen) {
      setStep(1);
      setError('');
      setLoading(false);
      setOtp(['', '', '', '', '', '']);
      setResendTimer(30);
      setConfirmationResult(null);
    } else {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }, [loginModalOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const t = setInterval(() => setResendTimer((v) => v - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, resendTimer]);

  // Auto-focus first OTP box on Step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 120);
    }
  }, [step]);

  if (!loginModalOpen) return null;

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  // ─── Step 1: Send REAL SMS OTP via Firebase ─────────────────────────────
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
    if (!recaptchaReady || !recaptchaVerifierRef.current) {
      setError('Please check the "I\'m not a robot" box below before proceeding.');
      return;
    }

    setLoading(true);
    try {
      const phoneWithCountry = `+91${cleanPhone}`;
      // Sends REAL SMS via Firebase with verified reCAPTCHA token
      const result = await signInWithPhoneNumber(auth, phoneWithCountry, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep(2);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      console.error('Firebase Real SMS OTP Error:', err?.code, err?.message, err);
      // Re-initialize reCAPTCHA on error
      initRecaptcha();
      const googleRaw = window.__lastGoogleError ? ` | Google: ${window.__lastGoogleError}` : '';
      const detailed = err?.code ? ` [${err.code}]` : '';
      setError(`${getFriendlyError(err)}${detailed}${googleRaw}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify REAL SMS OTP ───────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the 6-digit code received via SMS');
      return;
    }

    setError('');
    setLoading(true);
    try {
      if (!confirmationResult) {
        throw new Error('Verification session expired. Please click Resend OTP.');
      }

      // Verify with Firebase
      const userCredential = await confirmationResult.confirm(enteredOtp);
      const firebaseToken = await userCredential.user.getIdToken();

      // Exchange Firebase verified token for ProBridge JWT
      const res = await api.post('/auth/firebase-phone-login', {
        firebaseToken,
        name: name.trim(),
        phone: cleanPhone,
      });

      if (res.data?.success) {
        localStorage.setItem('pb_token', res.data.token);
        closeLoginModal();
        window.location.reload();
      } else {
        throw new Error(res.data?.message || 'Login verification failed');
      }
    } catch (err) {
      console.error('SMS OTP verify error:', err?.code, err?.message);
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP box input handlers ─────────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    if (char && idx < 5) otpInputsRef.current[idx + 1]?.focus();
    if (char && idx === 5 && next.every((d) => d)) {
      submitOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpInputsRef.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      setTimeout(() => submitOtp(pasted), 50);
    }
  };

  const submitOtp = async (code) => {
    if (loading || !confirmationResult) return;
    setError('');
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(code);
      const firebaseToken = await userCredential.user.getIdToken();
      const res = await api.post('/auth/firebase-phone-login', {
        firebaseToken,
        name: name.trim(),
        phone: cleanPhone,
      });
      if (res.data?.success) {
        localStorage.setItem('pb_token', res.data.token);
        closeLoginModal();
        window.location.reload();
      } else {
        throw new Error(res.data?.message || 'Login verification failed');
      }
    } catch (err) {
      setError(getFriendlyError(err));
      setLoading(false);
    }
  };

  // ─── Friendly error mapping ─────────────────────────────────────────────
  function getFriendlyError(err) {
    const code = err?.code || '';
    const msg = err?.message || '';

    if (code === 'auth/too-many-requests') {
      return 'Firebase SMS rate-limit reached for this number. Please wait a few minutes before trying again.';
    }
    if (code === 'auth/invalid-app-credential') {
      return 'reCAPTCHA verification could not be validated by Google. Please open http://127.0.0.1:3000 instead of localhost and tick the checkbox.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Phone sign-in is not enabled in Firebase Console. Please enable Phone provider in Authentication settings.';
    }
    if (code === 'auth/invalid-phone-number') {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (code === 'auth/captcha-check-failed') {
      return 'reCAPTCHA check failed. Please refresh the page and try again.';
    }
    if (code === 'auth/invalid-verification-code' || msg.includes('invalid-verification-code')) {
      return 'Incorrect SMS code. Please check the SMS on your phone and try again.';
    }
    if (code === 'auth/code-expired' || msg.includes('expired')) {
      return 'The SMS code has expired. Please tap Resend OTP.';
    }
    if (code === 'auth/session-expired') {
      return 'Session expired. Please request a new SMS OTP.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection issue. Please check your internet and try again.';
    }
    return err?.response?.data?.message || msg || 'Failed to send SMS OTP. Please try again.';
  }

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeLoginModal(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Login">
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={closeLoginModal} aria-label="Close">
          <X size={20} strokeWidth={2.2} />
        </button>

        {/* Brand Logo */}
        <div className={styles.brandWrap}>
          <Logo theme="forest" />
        </div>

        {/* Modal Title */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            {step === 1 ? <Phone size={22} strokeWidth={2} /> : <ShieldCheck size={22} strokeWidth={2} />}
          </div>
          <h2 className={styles.title}>
            {step === 1 ? 'Sign in to ProBridge' : 'Verify SMS Code'}
          </h2>
        </div>

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
        </div>

        {/* Step 2 destination info */}
        {step === 2 && (
          <p className={styles.otpSubtitle}>
            Real SMS OTP sent to <strong>+91 {cleanPhone}</strong>&nbsp;
            <button
              className={styles.editPhoneBtn}
              onClick={() => {
                setStep(1);
                setError('');
                setOtp(['', '', '', '', '', '']);
              }}
            >
              Change
            </button>
          </p>
        )}

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Name & Mobile Number ── */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <User size={18} className={styles.fieldIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mobile Number</label>
              <div className={styles.phoneInputWrap}>
                <div className={styles.countryCode}>
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  className={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            {/* Google reCAPTCHA Checkbox Box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 6px' }}>
              <div id="recaptcha-box" ref={recaptchaContainerRef} />
              {recaptchaReady && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                  <CheckCircle2 size={14} color="#16a34a" /> Verified with Google reCAPTCHA
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !name.trim() || cleanPhone.length !== 10 || !recaptchaReady}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Sending Real SMS…
                </>
              ) : (
                <>
                  <span>Send SMS OTP</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── STEP 2: Real 6-Digit SMS OTP ── */
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.otpInputWrap} onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`${styles.otpDigit} ${digit ? styles.otpDigitFilled : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || otp.some((d) => d === '')}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Verifying SMS Code…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify &amp; Login</span>
                </>
              )}
            </button>

            {/* Resend Row */}
            <div className={styles.resendRow}>
              {resendTimer > 0 ? (
                <span>Resend SMS OTP in <span className={styles.resendTimer}>{resendTimer}s</span></span>
              ) : (
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  <RefreshCw size={14} /> Resend SMS OTP
                </button>
              )}
            </div>
          </form>
        )}

        <p className={styles.termsText}>
          By continuing, you agree to ProBridge's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
