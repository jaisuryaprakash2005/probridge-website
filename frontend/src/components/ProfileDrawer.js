import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { getMyEnquiries, getMyListings } from '../services/api';
import { X, User, ChevronDown, MapPin, Building2, Calendar, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import styles from './ProfileDrawer.module.css';

function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&q=80';

function getPropertyThumb(p) {
  if (p?.images && Array.isArray(p.images) && p.images.length > 0) return p.images[0];
  if (p?.image && typeof p.image === 'string') return p.image;
  return DEFAULT_THUMB;
}

function formatMiniPrice(p) {
  if (p?.priceFormatted) return p.priceFormatted;
  const num = Number(p?.price || p?.priceRaw);
  if (!num || isNaN(num)) return 'Price on Request';
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lacs`;
  return `₹ ${num.toLocaleString('en-IN')}`;
}

function formatTypeBhk(p) {
  const parts = [];
  if (p?.bedroom || p?.bhk) parts.push(`${p.bedroom || p.bhk} BHK`);
  if (p?.propertyType) parts.push(p.propertyType);
  return parts.join(' ') || 'Residential Property';
}

export default function ProfileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { savedList } = useSaved();
  const navigate = useNavigate();

  // Accordion open section (default 'liked' matching the reference image)
  const [openSection, setOpenSection] = useState('liked');
  const [enquiries, setEnquiries] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [recentViewed, setRecentViewed] = useState([]);

  // Toggle accordion item
  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Load recent properties from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('pb_recent_viewed') || '[]');
        setRecentViewed(Array.isArray(stored) ? stored.slice(0, 3) : []);
      } catch (e) {
        setRecentViewed([]);
      }
      // Load enquiries
      getMyEnquiries()
        .then(({ data }) => setEnquiries(data?.enquiries || data?.results || []))
        .catch(() => {});
      // Load listings
      getMyListings()
        .then(({ data }) => setMyListings(data?.properties || data?.results || []))
        .catch(() => {});
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="User Profile"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Profile</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* User Card matching PropTiger reference */}
          <div className={styles.userCard}>
            <div className={styles.avatarCircle}>
              {user.photo ? (
                <img src={user.photo} alt={user.name} className={styles.avatarImg} />
              ) : (
                <User size={28} />
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.greeting} title={user.name || user.email}>
                Hi {user.name || user.email}
              </div>
              <div className={styles.userPhone}>
                {user.phone ? user.phone : user.email}
              </div>
            </div>
          </div>

          {/* Accordion Group */}
          <div className={styles.accordionGroup}>
            {/* 1. Recently viewed projects */}
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionHeader} ${openSection === 'recent' ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleSection('recent')}
              >
                <span>Recently viewed projects</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openSection === 'recent' ? styles.chevronOpen : ''}`}
                />
              </button>

              {openSection === 'recent' && (
                <div className={styles.accordionContent}>
                  {recentViewed.length > 0 ? (
                    <>
                      {recentViewed.map((p) => (
                        <div
                          key={p.id || p._id}
                          className={styles.miniCard}
                          onClick={() => handleNav(`/property/${p.id || p._id}`)}
                        >
                          <img
                            src={getPropertyThumb(p)}
                            alt={p.title || 'Property'}
                            className={styles.miniThumb}
                            onError={(e) => { e.target.src = DEFAULT_THUMB; }}
                          />
                          <div className={styles.miniInfo}>
                            <div className={styles.miniTitle}>{p.title}</div>
                            <div className={styles.miniRow}>
                              <MapPin size={11} className={styles.miniIcon} />
                              <span>{p.locality || p.city || 'Verified Location'}</span>
                            </div>
                            <div className={styles.miniRow}>
                              <Building2 size={11} className={styles.miniIcon} />
                              <span>{p.builder || p.builderName || 'ProBridge Partner'}</span>
                            </div>
                            <div className={styles.miniPriceRow}>
                              <span className={styles.miniPriceTag}>{formatMiniPrice(p)}</span>
                              <span className={styles.miniTypeTag}>| {formatTypeBhk(p)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.seeAllBtn}
                        onClick={() => handleNav('/search')}
                      >
                        Explore all projects
                      </button>
                    </>
                  ) : (
                    <div className={styles.emptyBox}>
                      <span>No recently viewed projects yet.</span>
                      <button
                        type="button"
                        className={styles.emptyBtn}
                        onClick={() => handleNav('/search')}
                      >
                        Browse projects
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Enquired Properties */}
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionHeader} ${openSection === 'enquiries' ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleSection('enquiries')}
              >
                <span>Enquired Properties</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openSection === 'enquiries' ? styles.chevronOpen : ''}`}
                />
              </button>

              {openSection === 'enquiries' && (
                <div className={styles.accordionContent}>
                  {enquiries.length > 0 ? (
                    <>
                      {enquiries.slice(0, 3).map((enq) => {
                        const prop = enq.property || {};
                        return (
                          <div
                            key={enq._id || enq.id}
                            className={styles.miniCard}
                            onClick={() => prop._id && handleNav(`/property/${prop._id}`)}
                          >
                            <img
                              src={getPropertyThumb(prop)}
                              alt={prop.title || 'Enquired property'}
                              className={styles.miniThumb}
                              onError={(e) => { e.target.src = DEFAULT_THUMB; }}
                            />
                            <div className={styles.miniInfo}>
                              <div className={styles.miniTitle}>{prop.title || 'Enquiry Request'}</div>
                              <div className={styles.miniRow}>
                                <Calendar size={11} className={styles.miniIcon} />
                                <span>{enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Active'}</span>
                              </div>
                              <div className={styles.miniPriceRow}>
                                <span className={styles.miniPriceTag}>{formatMiniPrice(prop)}</span>
                                <span className={styles.miniTypeTag}>| Enquiry Sent</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        className={styles.seeAllBtn}
                        onClick={() => handleNav('/search')}
                      >
                        See all properties
                      </button>
                    </>
                  ) : (
                    <div className={styles.emptyBox}>
                      <span>No enquired properties yet.</span>
                      <button
                        type="button"
                        className={styles.emptyBtn}
                        onClick={() => handleNav('/search')}
                      >
                        Find properties to enquire
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Liked Properties (Exact PropTiger Match from reference image) */}
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionHeader} ${openSection === 'liked' ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleSection('liked')}
              >
                <span>Liked Properties</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openSection === 'liked' ? styles.chevronOpen : ''}`}
                />
              </button>

              {openSection === 'liked' && (
                <div className={styles.accordionContent}>
                  {savedList.length > 0 ? (
                    <>
                      {savedList.slice(0, 3).map((p) => (
                        <div
                          key={p.id || p._id}
                          className={styles.miniCard}
                          onClick={() => handleNav(`/property/${p.id || p._id}`)}
                        >
                          <img
                            src={getPropertyThumb(p)}
                            alt={p.title || 'Property'}
                            className={styles.miniThumb}
                            onError={(e) => { e.target.src = DEFAULT_THUMB; }}
                          />
                          <div className={styles.miniInfo}>
                            <div className={styles.miniTitle} title={p.title}>
                              {p.title}
                            </div>
                            <div className={styles.miniRow}>
                              <MapPin size={11} className={styles.miniIcon} />
                              <span>{p.locality || p.city || 'Verified Locality'}</span>
                            </div>
                            <div className={styles.miniRow}>
                              <Building2 size={11} className={styles.miniIcon} />
                              <span>{p.builder || p.builderName || 'ProBridge Verified'}</span>
                            </div>
                            <div className={styles.miniPriceRow}>
                              <span className={styles.miniPriceTag}>{formatMiniPrice(p)}</span>
                              <span className={styles.miniTypeTag}>| {formatTypeBhk(p)}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pill button matching the user's reference image */}
                      <button
                        type="button"
                        className={styles.seeAllBtn}
                        onClick={() => handleNav('/saved')}
                      >
                        See all liked properties
                      </button>
                    </>
                  ) : (
                    <div className={styles.emptyBox}>
                      <span>No liked properties yet.</span>
                      <button
                        type="button"
                        className={styles.emptyBtn}
                        onClick={() => handleNav('/search')}
                      >
                        Explore properties to shortlist
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Site Visit */}
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionHeader} ${openSection === 'visits' ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleSection('visits')}
              >
                <span>Site Visit</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openSection === 'visits' ? styles.chevronOpen : ''}`}
                />
              </button>

              {openSection === 'visits' && (
                <div className={styles.accordionContent}>
                  <div className={styles.emptyBox}>
                    <span>No upcoming site visits scheduled.</span>
                    <button
                      type="button"
                      className={styles.emptyBtn}
                      onClick={() => handleNav('/search')}
                    >
                      Schedule a site visit
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. My Bookings */}
            <div className={styles.accordionItem}>
              <button
                type="button"
                className={`${styles.accordionHeader} ${openSection === 'bookings' ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleSection('bookings')}
              >
                <span>My Bookings</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${openSection === 'bookings' ? styles.chevronOpen : ''}`}
                />
              </button>

              {openSection === 'bookings' && (
                <div className={styles.accordionContent}>
                  {myListings.length > 0 ? (
                    <>
                      {myListings.slice(0, 3).map((p) => (
                        <div
                          key={p.id || p._id}
                          className={styles.miniCard}
                          onClick={() => handleNav(`/property/${p.id || p._id}`)}
                        >
                          <img
                            src={getPropertyThumb(p)}
                            alt={p.title || 'Property'}
                            className={styles.miniThumb}
                            onError={(e) => { e.target.src = DEFAULT_THUMB; }}
                          />
                          <div className={styles.miniInfo}>
                            <div className={styles.miniTitle}>{p.title}</div>
                            <div className={styles.miniRow}>
                              <MapPin size={11} className={styles.miniIcon} />
                              <span>{p.city}</span>
                            </div>
                            <div className={styles.miniPriceRow}>
                              <span className={styles.miniPriceTag}>{formatMiniPrice(p)}</span>
                              <span className={styles.miniTypeTag}>| {p.status || 'Active'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.seeAllBtn}
                        onClick={() => handleNav('/post-property')}
                      >
                        Post another property
                      </button>
                    </>
                  ) : (
                    <div className={styles.emptyBox}>
                      <span>No active bookings or listings.</span>
                      <button
                        type="button"
                        className={styles.emptyBtn}
                        onClick={() => handleNav('/post-property')}
                      >
                        Post your property free
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Item */}
            <button
              type="button"
              className={styles.logoutItem}
              onClick={handleLogout}
            >
              <span>Logout</span>
            </button>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <a href="tel:+919176663200" style={{ color: 'var(--brand, #0D5F4E)', textDecoration: 'none', fontWeight: 600 }}>📞 +91 9176663200</a>
              <a href="https://www.probridge.co.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand, #0D5F4E)', textDecoration: 'none', fontWeight: 600 }}>🌐 www.probridge.co.in</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <a href="https://www.facebook.com/profile.php?id=61594013548834" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }} title="Facebook">
                <Facebook size={16} />
              </a>
              <a href="https://www.youtube.com/@Probridgeofficial" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }} title="YouTube">
                <Youtube size={16} />
              </a>
              <a href="https://www.instagram.com/probridgeofficial/?hl=en" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }} title="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://x.com/Probbridge/status/2114328176268849582?s=20" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }} title="X">
                <XIcon size={14} />
              </a>
              <a href="https://www.linkedin.com/in/probridge-hr-714b19432/?isSelfProfile=true" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }} title="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className={styles.footerNote}>
            ProBridge Real Estate Network • Verified Listings
          </div>
        </div>
      </aside>
    </div>
  );
}
