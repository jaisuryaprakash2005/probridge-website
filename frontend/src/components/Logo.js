import React from 'react';
import styles from './Logo.module.css';

export default function Logo({ size = 'md', showTagline = true, theme = 'default', className = '' }) {
  return (
    <div className={`${styles.logoWrap} ${styles['size_' + size]} ${styles['theme_' + theme]} ${className}`}>
      {/* Brand Name */}
      <div className={styles.brandRow}>
        <span className={styles.letterPart}>PR</span>
        <span className={styles.letterO}>
          <span className={styles.oText}>O</span>
          <svg
            className={styles.goldenArc}
            viewBox="0 0 32 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M 1 12 C 7 1, 25 1, 31 12 C 24 4, 8 4, 1 12 Z"
              fill="#D99B26"
            />
          </svg>
        </span>
        <span className={styles.letterPart}>BRIDGE</span>
      </div>

      {/* Gold Accent Divider */}
      <div className={styles.goldLine} />

      {/* Brand Tagline */}
      {showTagline && (
        <div className={styles.tagline}>
          We Connect World of Real Estate
        </div>
      )}
    </div>
  );
}

