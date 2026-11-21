import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin, MapPin, Mail, PhoneCall } from 'lucide-react';
import Logo from './Logo';
import styles from './Footer.module.css';

// Official X (formerly Twitter) vector icon
function XIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about-us' },
  { label: 'Home', to: '/' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact Us', to: '/contact-us' },
  { label: 'Privacy Policy', to: '/privacy' },
];

const RESOURCE_LINKS = [
  { label: 'Bridgeguide', to: '/guide' },
  { label: 'NRI Services', to: '/nri-services' },
  { label: 'How to Buy', to: '/how-to-buy' },
];

const SOCIAL = [
  {
    icon: Facebook,
    label: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61594013548834',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    url: 'https://www.youtube.com/@Probridgeofficial',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    url: 'https://www.instagram.com/probridgeofficial/?hl=en',
  },
  {
    icon: XIcon,
    label: 'X (Twitter)',
    url: 'https://x.com/Probbridge/status/2114328176268849582?s=20',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/probridge-hr-714b19432/?isSelfProfile=true',
  },
];

export default function Footer() {
  const location = useLocation();

  // Company details section appears on the home screen ('/') and company info pages
  const INFO_PATHS = ['/about-us', '/careers', '/contact-us', '/privacy', '/guide', '/nri-services', '/how-to-buy'];
  if (location.pathname !== '/' && !INFO_PATHS.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand & Corporate Overview */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.footerLogoLink} title="ProBridge">
            <Logo size="lg" showTagline={true} />
          </Link>

          <p className={styles.aboutText}>
            Probridge.co.in is one of India’s leading real estate advisory platforms, helping people find and buy their dream homes. Founded in 2011, ProBridge combines deep market knowledge, technology, and real estate expertise to make the home-buying journey simple and seamless. From discovering the right property and scheduling site visits to documentation, home loans, and final possession, ProBridge supports homebuyers at every step.
          </p>

          <div className={styles.contactList}>
            <div className={styles.contactRow}>
              <MapPin size={18} className={styles.contactIcon} />
              <span>First Floor, i5 Complex, 10-B, Ekambaram Industrial Estate Rd, Alapakkam, Karpaga Vinayagar Colony, Valasaravakkam, Chennai, Tamil Nadu 600116</span>
            </div>

            <div className={styles.contactRow}>
              <Mail size={17} className={styles.contactIcon} />
              <a href="mailto:info@probridge.co.in" className={styles.contactLink}>
                info@probridge.co.in
              </a>
            </div>

            <div className={styles.contactRow}>
              <PhoneCall size={17} className={styles.contactIcon} />
              <span>
                <a href="tel:+919176663200" className={styles.contactLink}>+91 9176663200 </a>Toll Free (9:30 AM to 6:30 PM)
              </span>
            </div>
          </div>
        </div>

        {/* Company Links */}
        <div className={styles.navCol}>
          <h4 className={styles.colTitle}>Company</h4>
          <div className={styles.linkList}>
            {COMPANY_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={styles.link}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources Links */}
        <div className={styles.navCol}>
          <h4 className={styles.colTitle}>Resources</h4>
          <div className={styles.linkList}>
            {RESOURCE_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={styles.link}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <span className={styles.copy}>
            © {new Date().getFullYear()} Probridge Pvt. Ltd. All rights reserved.
          </span>
          <div className={styles.social}>
            {SOCIAL.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label={s.label}
                  title={s.label}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

