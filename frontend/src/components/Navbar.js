import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, User, Menu, X, ChevronDown, Sparkles,
  Search, Building2, Home, TreePine, Store, TrendingUp,
  Facebook, Instagram, Youtube, Linkedin, BookOpen, FileText,
} from 'lucide-react';
import Logo from './Logo';
import LoginModal from './LoginModal';
import ProfileDrawer from './ProfileDrawer';
import styles from './Navbar.module.css';

function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ── Nav structure with mega-menu items ───────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Buy',
    to: '/search?listingType=Sell',
    sub: [
      { icon: Building2, label: 'Apartments',       desc: 'Ready & under-construction flats', to: '/search?listingType=Sell&propertyType=Apartment' },
      { icon: Home,      label: 'Independent House', desc: 'Villas, bungalows & row houses',   to: '/search?listingType=Sell&propertyType=Independent' },
      { icon: TreePine,  label: 'Plots & Land',      desc: 'NA plots, layouts & farmlands',    to: '/search?listingType=Sell&propertyType=Plot' },
      { icon: Store,     label: 'Commercial',         desc: 'Offices, shops & warehouses',      to: '/search?listingType=Sell&buildingType=Commercial' },
    ],
  },
  {
    label: 'Rent',
    to: '/search?listingType=Rent',
    sub: [
      { icon: Building2, label: 'Apartments',       desc: 'Furnished & semi-furnished flats',  to: '/search?listingType=Rent&propertyType=Apartment' },
      { icon: Home,      label: 'Independent House', desc: 'Standalone houses for families',   to: '/search?listingType=Rent&propertyType=Independent' },
      { icon: Store,     label: 'Office Space',      desc: 'Plug-and-play & co-working',       to: '/search?listingType=Rent&buildingType=Commercial' },
    ],
  },
  {
    label: 'Commercial',
    to: '/search?buildingType=Commercial',
    sub: [
      { icon: TrendingUp, label: 'Pre-Leased',   desc: 'Rental income from day one',       to: '/search?buildingType=Commercial&tag=pre-leased' },
      { icon: Store,      label: 'Retail Shops', desc: 'High-street & mall shops',          to: '/search?buildingType=Commercial&propertyType=Shop' },
      { icon: Building2,  label: 'Offices',      desc: 'Grade A corporate offices',         to: '/search?buildingType=Commercial&propertyType=Office' },
    ],
  },
  {
    label: 'BridgeGuide',
    to: '/guide',
    sub: [
      { icon: FileText, label: 'Blogs',            desc: 'Real estate articles, insights & updates', to: '/blogs' },
      { icon: BookOpen, label: 'Homebuyer Guides', desc: 'Buying checklists, RERA & legal advice',    to: '/guide' },
    ],
  },
];

/* ── Scroll threshold for shrink effect ──────────────────────── */
const SCROLL_THRESHOLD = 60;

export default function Navbar() {
  const { user, logout, openLoginModal } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuOpen,           setMenuOpen]           = useState(false);
  const [profileDrawerOpen,  setProfileDrawerOpen]  = useState(false);
  const [activeMega,         setActiveMega]         = useState(null); // label of open mega-menu
  const [scrolled,           setScrolled]           = useState(false);

  const megaRef  = useRef(null);
  const megaTimer = useRef(null);

  /* Scroll shrink effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Mega-menu hover helpers — delayed close to avoid flicker */
  const openMega  = useCallback((label) => {
    clearTimeout(megaTimer.current);
    setActiveMega(label);
  }, []);

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setActiveMega(null), 140);
  }, []);

  const keepMega  = useCallback(() => {
    clearTimeout(megaTimer.current);
  }, []);

  /* Hide navbar on property view page */
  if (location.pathname.startsWith('/property/')) {
    return null;
  }

  const isHome = location.pathname === '/';

  const isActive = (item) =>
    item.to.includes('?')
      ? location.pathname === '/search' && location.search.includes(item.to.split('?')[1])
      : location.pathname === item.to;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.inner}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className={styles.brand} title="ProBridge – We Connect World of Real Estate">
            <Logo size="md" showTagline={true} />
          </Link>

          {isHome && (
            <>
              {/* ── Vertical separator ───────────────────────────── */}
              <div className={styles.sep} />

              {/* ── Desktop Nav ──────────────────────────────────── */}
              <nav className={styles.nav} role="navigation" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item);
                  const hasSub = item.sub?.length > 0;

                  if (item.cta) {
                    return (
                      <Link key={item.label} to={item.to} className={styles.navCta}>
                        <Sparkles size={13} className={styles.ctaSparkle} />
                        {item.label} Free
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.label}
                      className={styles.navItemWrap}
                      onMouseEnter={() => hasSub && openMega(item.label)}
                      onMouseLeave={closeMega}
                    >
                      <Link
                        to={item.to}
                        className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                        aria-expanded={activeMega === item.label}
                      >
                        {item.label}
                        {hasSub && (
                          <ChevronDown
                            size={13}
                            className={`${styles.chevron} ${activeMega === item.label ? styles.chevronOpen : ''}`}
                          />
                        )}
                        {active && <span className={styles.activeDot} />}
                      </Link>

                      {/* Mega-menu panel */}
                      {hasSub && activeMega === item.label && (
                        <div
                          className={styles.megaMenu}
                          onMouseEnter={keepMega}
                          onMouseLeave={closeMega}
                          ref={megaRef}
                        >
                          <div className={styles.megaHeader}>
                            <span className={styles.megaLabel}>Browse {item.label}</span>
                            <Link to={item.to} className={styles.megaSeeAll}>See all →</Link>
                          </div>
                          <div className={styles.megaGrid}>
                            {item.sub.map((s) => {
                              const Icon = s.icon;
                              return (
                                <Link
                                  key={s.label}
                                  to={s.to}
                                  className={styles.megaItem}
                                  onClick={() => setActiveMega(null)}
                                >
                                  <div className={styles.megaIconWrap}>
                                    <Icon size={18} className={styles.megaIcon} strokeWidth={1.8} />
                                  </div>
                                  <div>
                                    <div className={styles.megaItemLabel}>{s.label}</div>
                                    <div className={styles.megaItemDesc}>{s.desc}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </>
          )}

          {/* ── Spacer ───────────────────────────────────────── */}
          <div className={styles.spacer} />

          {/* ── Right cluster ────────────────────────────────── */}
          <div className={styles.rightCluster}>

            {isHome && (
              <>
                {/* Quick search icon */}
                <button
                  className={styles.iconBtn}
                  onClick={() => navigate('/search')}
                  title="Search properties"
                  aria-label="Search"
                >
                  <Search size={17} strokeWidth={2.2} />
                </button>

                {/* Shortlisted / Saved */}
                <Link to="/saved" className={styles.iconBtn} title="Shortlisted Properties" aria-label="Saved">
                  <Heart size={17} strokeWidth={2.2} />
                  <span className={styles.iconBtnLabel}>Saved</span>
                </Link>

                {/* Divider */}
                <div className={styles.rightSep} />
              </>
            )}

            {/* User pill */}
            <div className={styles.userWrap}>
              {user ? (
                <button
                  type="button"
                  className={styles.userPill}
                  onClick={() => setProfileDrawerOpen(true)}
                  aria-label="Open Profile"
                  title="My Profile"
                >
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className={styles.userAvatar} />
                  ) : (
                    <span className={styles.userInitial}>
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </span>
                  )}
                  <span className={styles.userName}>
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                  <ChevronDown size={13} className={styles.pillChev} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.userPill}
                  onClick={openLoginModal}
                  aria-label="Login to ProBridge"
                >
                  <span className={styles.guestCircle}>
                    <User size={15} strokeWidth={2.2} />
                  </span>
                  <span className={styles.userName}>Login</span>
                </button>
              )}
            </div>

            {/* Mobile hamburger (only on Home) */}
            {isHome && (
              <button
                type="button"
                className={styles.hamburger}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
              </button>
            )}</div>
        </div>

        {/* ── Mobile Drawer (only when open on Home) ────────── */}
        {isHome && menuOpen && (
          <div className={styles.mobileMenu} role="dialog" aria-modal="true" aria-label="Mobile navigation">
            {/* Nav links */}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`${styles.mobileLink} ${item.cta ? styles.mobileLinkCta : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                {item.cta && <span className={styles.mobileFreeTag}>FREE</span>}
              </Link>
            ))}

            <div className={styles.mobileDivider} />

            {user ? (
              <>
                <div
                  className={styles.mobileUser}
                  onClick={() => { setMenuOpen(false); setProfileDrawerOpen(true); }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.mobileUserInitial}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className={styles.mobileUserName}>{user.name}</div>
                    <div className={styles.mobileUserEmail}>{user.phone || user.email}</div>
                  </div>
                </div>
                <Link to="/saved" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Liked Properties</Link>
                <button
                  type="button"
                  className={styles.mobileLink}
                  style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', padding: 0 }}
                  onClick={() => { setMenuOpen(false); setProfileDrawerOpen(true); }}
                >
                  My Profile &amp; Bookings
                </button>
                <div className={styles.mobileDivider} />
                <button
                  type="button"
                  className={`${styles.mobileLink} ${styles.mobileLinkLogout}`}
                  onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.mobileLink}
                style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => { setMenuOpen(false); openLoginModal(); }}
              >
                Login to ProBridge
              </button>
            )}

            <div className={styles.mobileDivider} />
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, marginTop: 8 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--yellow-accent, #FDE047)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                Contact Us
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '13px' }}>
                <a href="tel:+919176663200" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📞 +91 9176663200
                </a>
                <a href="https://www.probridge.co.in" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🌐  www.probridge.co.in
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <a href="https://www.facebook.com/profile.php?id=61594013548834" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} title="Facebook">
                  <Facebook size={16} />
                </a>
                <a href="https://www.youtube.com/@Probridgeofficial" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} title="YouTube">
                  <Youtube size={16} />
                </a>
                <a href="https://www.instagram.com/probridgeofficial/?hl=en" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} title="Instagram">
                  <Instagram size={16} />
                </a>
                <a href="https://x.com/Probbridge/status/2114328176268849582?s=20" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} title="X">
                  <XIcon size={14} />
                </a>
                <a href="https://www.linkedin.com/in/probridge-hr-714b19432/?isSelfProfile=true" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }} title="LinkedIn">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Login Modal & Profile Drawer ─────────────────────── */}
      <LoginModal />
      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </>
  );
}
