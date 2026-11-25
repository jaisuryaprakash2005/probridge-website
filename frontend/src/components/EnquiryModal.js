import React, { useState, useEffect } from 'react';
import { sendEnquiry } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, PhoneCall, Send, CheckCircle2, Home } from 'lucide-react';
import styles from './EnquiryModal.module.css';

export default function EnquiryModal({
  property,
  onClose,
  initialMode = 'enquire',
  unitTitle = '',
  initialName = '',
  initialPhone = '',
  initialEmail = '',
  onSuccess,
}) {
  const { user, openLoginModal } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'enquire' | 'callback'

  useEffect(() => {
    if (!user) {
      if (onClose) onClose();
      openLoginModal();
    }
  }, [user, onClose, openLoginModal]);

  const defaultMessage = (m, unit) => {
    if (m === 'callback') {
      return unit
        ? `Request callback for ${unit} at "${property?.title || 'this property'}".`
        : `Request callback for "${property?.title || 'this property'}".`;
    }
    return unit
      ? `I am interested in ${unit} at "${property?.title || 'this property'}". Please share pricing, availability, and full brochure details.`
      : `I am interested in "${property?.title || 'this property'}". Please get in touch with me.`;
  };

  const [form, setForm] = useState({
    name: initialName || user?.name || '',
    email: initialEmail || user?.email || '',
    phone: initialPhone || user?.phone || '',
    message: defaultMessage(initialMode, unitTitle),
  });

  useEffect(() => {
    setMode(initialMode);
    setForm((f) => ({
      ...f,
      name: f.name || initialName || user?.name || '',
      phone: f.phone || initialPhone || user?.phone || '',
      email: f.email || initialEmail || user?.email || '',
      message: defaultMessage(initialMode, unitTitle),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, unitTitle, initialName, initialPhone, initialEmail, user]);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const isCallback = mode === 'callback';

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setForm((f) => ({
      ...f,
      message: defaultMessage(newMode, unitTitle),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      if (onClose) onClose();
      openLoginModal();
      return;
    }

    if (!form.phone.trim()) {
      setError('Please provide a 10-digit phone number so our advisor can reach you.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        propertyId: property?.id || property?._id,
        propertyTitle: property?.title || '',
        propertyImage: property?.image || (property?.images?.[0]) || '',
        name: form.name.trim() || 'Interested Buyer',
        email: form.email.trim(),
        phone: form.phone.trim(),
        mobile: form.phone.trim(),
        message: form.message.trim(),
        unit: unitTitle || '',
        isCallback,
      };

      await sendEnquiry(payload);
      setSent(true);
      if (onSuccess) {
        onSuccess(payload);
      }
    } catch (err) {
      console.error('[Enquiry Submission Error]', err);
      const serverMsg = err.response?.data?.message || err.message;
      setError(serverMsg && serverMsg !== 'Network Error' ? serverMsg : 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className={styles.title}>
              {isCallback ? 'Request a Callback' : 'Submit Enquiry'}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Mode switcher tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
          <button
            type="button"
            onClick={() => handleModeChange('enquire')}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              background: !isCallback ? '#fff' : 'transparent',
              color: !isCallback ? 'var(--primary, #0D5F4E)' : 'var(--text-secondary, #64748b)',
              borderBottom: !isCallback ? '2px solid var(--primary, #0D5F4E)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Send size={14} />
            Send Enquiry
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('callback')}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              background: isCallback ? '#fff' : 'transparent',
              color: isCallback ? '#b45309' : 'var(--text-secondary, #64748b)',
              borderBottom: isCallback ? '2px solid #b45309' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <PhoneCall size={14} />
            Request Callback
          </button>
        </div>

        {/* Property snippet */}
        {property && (
          <div className={styles.propSnippet}>
            <img
              src={property.image || (property.images?.[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70'}
              alt={property.title}
              className={styles.propImg}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.propTitle} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.title}
              </div>
              <div className={styles.propPrice}>{property.price || 'Price on Request'}</div>
              <div className={styles.propLoc}>{property.location || property.city}</div>
              {unitTitle && (
                <div className={styles.unitBadge}>
                  <Home size={12} />
                  <span>{unitTitle}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIcon} style={{ color: '#16a34a' }}>
              <CheckCircle2 size={54} />
            </div>
            <div className={styles.successTitle}>
              {isCallback ? 'Callback Requested!' : 'Enquiry Sent!'}
            </div>
            <div className={styles.successSub}>
              {isCallback
                ? 'Our advisor will call you back shortly on your phone number.'
                : 'Your enquiry has been received and listed in the admin dashboard leads. We will get in touch shortly.'}
            </div>
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                Email Address (Optional)
              </label>
              <input
                type="email"
                className={styles.input}
                placeholder="your.email@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Message</label>
              <textarea
                rows={3}
                className={styles.textarea}
                placeholder="I am interested in this property..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              style={{
                background: isCallback ? '#b45309' : 'var(--primary, #0D5F4E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              disabled={loading}
            >
              {loading ? (
                'Submitting…'
              ) : isCallback ? (
                <>
                  <PhoneCall size={16} /> Request Callback
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Enquiry
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
