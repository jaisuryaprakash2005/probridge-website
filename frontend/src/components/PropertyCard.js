import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MapPin, BedDouble, Bath, Maximize2,
  CheckCircle2, Building2, ArrowUpRight, Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import styles from './PropertyCard.module.css';

/* ── Helpers ────────────────────────────────────────────────────── */
function formatPrice(raw) {
  if (!raw) return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.]/g, ''));
  if (!n) return raw;
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 100000)   return `₹ ${(n / 100000).toFixed(1).replace(/\.?0+$/, '')} Lac`;
  return `₹ ${n.toLocaleString('en-IN')}`;
}

function emiPerMonth(raw) {
  const n = typeof raw === 'number' ? raw : Number(String(raw || '').replace(/[^0-9.]/g, ''));
  if (!n) return null;
  // Simple EMI: 20yr, 8.5% p.a., 20% down
  const principal = n * 0.8;
  const r = 8.5 / 12 / 100;
  const months = 240;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  if (!emi || !isFinite(emi)) return null;
  if (emi >= 100000) return `₹${(emi / 100000).toFixed(1)}L/mo`;
  if (emi >= 1000)   return `₹${Math.round(emi / 1000)}k/mo`;
  return `₹${Math.round(emi)}/mo`;
}

/* ── Component ──────────────────────────────────────────────────── */
export default function PropertyCard({ property: p, onEnquire }) {
  const { user, openLoginModal } = useAuth();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(p.id || p._id);
  const [imgErr, setImgErr] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLoginModal();
      return;
    }
    toggle(p);
  };

  const handleEnquire = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLoginModal();
      return;
    }
    onEnquire?.(p);
  };

  const imgSrc = imgErr
    ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
    : (p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80');

  const displayPrice  = p.price  || formatPrice(p.priceRaw);
  const displayEmi    = p.priceRaw ? emiPerMonth(p.priceRaw) : null;
  const listingLabel  = (p.listingType || 'Sell').toLowerCase() === 'rent' ? 'FOR RENT' : 'FOR SALE';
  const listingColor  = listingLabel === 'FOR RENT' ? 'rent' : 'sale';

  /* Tags shown on image */
  /* Plot size / Area resolution (Support 'Other' -> customPlotSize) */
  const customSize = p.customPlotSize || p.rawFormData?.customPlotSize;
  const displayPlotSize = (p.plotSize === 'Other' || !p.plotSize)
    ? (customSize || (p.plotSize !== 'Other' ? p.plotSize : null) || p.plotDimension || p.area)
    : p.plotSize;

  const topBadges = (p.badges || []).slice(0, 2);
  const hasBuilder = !!(p.builderName || p.rawFormData?.builderName);
  const builderText = p.builderName || p.rawFormData?.builderName || '';

  return (
    <Link to={`/property/${p.id || p._id}`} className={styles.card} tabIndex={0}>

      {/* ── IMAGE ZONE ─────────────────────────────────────────── */}
      <div className={styles.imgWrap}>
        <img
          src={imgSrc}
          alt={p.title || 'Property'}
          className={styles.img}
          loading="lazy"
          onError={() => setImgErr(true)}
        />

        {/* Gradient scrim for text legibility */}
        <div className={styles.scrim} />

        {/* Top-left: listing type + badges */}
        <div className={styles.topLeft}>
          <span className={`${styles.listingTag} ${styles[`listingTag_${listingColor}`]}`}>
            {listingLabel}
          </span>
          {topBadges.map((b, i) => (
            <span
              key={i}
              className={styles.imgBadge}
              style={{ background: b.variant === 'sage' ? 'rgba(216,232,199,0.95)' : 'rgba(255,255,255,0.92)' }}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Top-right: Save / Heart */}
        <button
          className={`${styles.heartBtn} ${saved ? styles.heartBtnActive : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Unsave property' : 'Save property'}
        >
          <Heart size={16} fill={saved ? '#e11d48' : 'none'} color={saved ? '#e11d48' : '#1E293B'} strokeWidth={2.5} />
        </button>

        {/* Bottom-left: Verified chip */}
        <div className={styles.verifiedChip}>
          <CheckCircle2 size={11} strokeWidth={3} />
          <span>Verified</span>
        </div>

        {/* Bottom-right: Possession */}
        {p.possession && (
          <div className={styles.possessionChip}>{p.possession}</div>
        )}

        {/* Views count */}
        {!!p.views && (
          <div className={styles.viewsChip}>
            <Eye size={11} strokeWidth={2.5} />
            <span>{p.views > 999 ? `${(p.views / 1000).toFixed(1)}k` : p.views}</span>
          </div>
        )}
      </div>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <div className={styles.body}>

        {/* Price row */}
        <div className={styles.priceRow}>
          <div className={styles.priceBlock}>
            <span className={styles.priceMain}>{displayPrice}</span>
            {!!displayEmi && (
              <span className={styles.emiPill}>EMI {displayEmi}</span>
            )}
          </div>
          {!!p.perSqft && <span className={styles.perSqft}>{p.perSqft}</span>}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{p.title || 'Property Listing'}</h3>

        {/* Location */}
        <div className={styles.locationRow}>
          <MapPin size={13} className={styles.locationIcon} strokeWidth={2.5} />
          <span className={styles.locationText}>{p.location || `${p.locality || ''}, ${p.city || ''}`.replace(/^,\s*/, '')}</span>
        </div>

        {/* Builder tag */}
        {hasBuilder && (
          <div className={styles.builderRow}>
            <Building2 size={12} className={styles.builderIcon} strokeWidth={2.5} />
            <span className={styles.builderText}>{builderText}</span>
          </div>
        )}

        {/* Divider */}
        <div className={styles.divider} />

        {/* Specs row */}
        <div className={styles.specsRow}>
          {p.bedroom && (
            <div className={styles.specPill}>
              <BedDouble size={13} strokeWidth={2} />
              <span>{p.bedroom.includes('BHK') ? p.bedroom : `${p.bedroom} BHK`}</span>
            </div>
          )}
          {p.bathroom && (
            <div className={styles.specPill}>
              <Bath size={12} strokeWidth={2} />
              <span>{p.bathroom} Bath</span>
            </div>
          )}
          {(displayPlotSize || p.area) && (
            <div className={styles.specPill}>
              <Maximize2 size={12} strokeWidth={2} />
              <span>{displayPlotSize || p.area}</span>
            </div>
          )}
        </div>

        {/* Action row */}
        <div className={styles.actionRow}>
          <span className={styles.viewBtn}>
            View Details
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </span>
          <button className={styles.enquireBtn} onClick={handleEnquire}>
            {p.secondaryCta?.label || 'Enquire Now'}
          </button>
        </div>
      </div>
    </Link>
  );
}
