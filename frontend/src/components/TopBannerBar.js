import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Building2 } from 'lucide-react';
import { getTopBanners, trackTopBannerClick, getActiveAds } from '../services/api';
import styles from './TopBannerBar.module.css';

const ROTATE_INTERVAL = 4800; // 4.8s per banner transition

// Fallback high-definition wide real estate promotional banners (long width ~1600x320)
const FALLBACK_BANNERS = [
  {
    _id: 'default-top-1',
    title: 'Prestige Waterfront Residences &bull; Luxury 3 & 4 BHK Condos',
    subtitle: 'Prime Whitefield, Bengaluru &bull; Starting at ₹1.45 Cr',
    topBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
    isTopBanner: true,
  },
  {
    _id: 'default-top-2',
    title: 'Godrej Palm Retreat &bull; Resort Style Green Living Villas',
    subtitle: 'OMR Expressway, Chennai &bull; 0% Brokerage &bull; Ready to Move',
    topBanner: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=85',
    isTopBanner: true,
  },
  {
    _id: 'default-top-3',
    title: 'Signature Corporate Towers &bull; Grade-A Pre-Leased Commercial',
    subtitle: 'Cyber City, Hyderabad &bull; 9.2% Guaranteed Rental Yield',
    topBanner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85',
    isTopBanner: true,
  },
];

export default function TopBannerBar() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  // Load standalone top banners from backend API
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch standalone top banners (not connected to ads)
    getTopBanners()
      .then(({ data }) => {
        if (!isMounted) return;
        const list = data.results || [];
        if (list.length > 0) {
          const normalized = list.map((b) => ({
            ...b,
            topBanner: b.image || b.topBanner,
          }));
          setBanners(normalized);
          return;
        }

        // 2. If no standalone banners yet, check active ads with top banners
        getActiveAds()
          .then(({ data: adData }) => {
            if (!isMounted) return;
            const adList = (adData.results || []).filter((a) => a.topBanner || a.isTopBanner);
            if (adList.length > 0) {
              setBanners(adList.map((a) => ({ ...a, topBanner: a.topBanner || a.image })));
            } else {
              setBanners(FALLBACK_BANNERS);
            }
          })
          .catch(() => {
            if (isMounted) setBanners(FALLBACK_BANNERS);
          });
      })
      .catch(() => {
        if (isMounted) setBanners(FALLBACK_BANNERS);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const total = banners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
    setProgress(0);
    lastTickRef.current = Date.now();
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setProgress(0);
    lastTickRef.current = Date.now();
  }, [total]);

  // Auto rotation with smooth progress bar
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      nextSlide();
    }, ROTATE_INTERVAL);

    // Progress bar animation
    const updateProgress = () => {
      const elapsed = Date.now() - lastTickRef.current;
      const pct = Math.min((elapsed / ROTATE_INTERVAL) * 100, 100);
      setProgress(pct);
      if (!isPaused) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      clearInterval(interval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [total, isPaused, nextSlide, currentIndex]);

  const handleBannerClick = (ad) => {
    if (!ad) return;
    if (ad._id && !String(ad._id).startsWith('default-')) {
      trackTopBannerClick(ad._id).catch(() => {});
    }

    if (ad.link) {
      if (ad.link.startsWith('http://') || ad.link.startsWith('https://')) {
        window.open(ad.link, '_blank', 'noopener,noreferrer');
      } else {
        navigate(ad.link);
      }
      return;
    }

    const propId = ad.property?._id || ad.property?.id || (typeof ad.property === 'string' ? ad.property : null);
    if (propId) {
      navigate(`/property/${propId}`);
    } else {
      navigate('/search?buildingType=Residential');
    }
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className={styles.bannerWrap}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        lastTickRef.current = Date.now() - (progress / 100) * ROTATE_INTERVAL;
      }}
    >
      <div className={styles.bannerCard}>
        {/* Render each slide layer for smooth appear and disappear crossfade */}
        {banners.map((ad, idx) => {
          const isActive = idx === currentIndex;
          const bgImg = ad.topBanner || ad.image;
          const title = ad.title || ad.property?.title || 'Featured Property Development';
          const sub = ad.subtitle || (ad.property ? `${ad.property.locality || ''} ${ad.property.city || ''} • ${ad.property.price || ''}` : '');

          return (
            <div
              key={ad._id || idx}
              className={`${styles.slideLayer} ${isActive ? styles.slideActive : ''}`}
              onClick={() => handleBannerClick(ad)}
              title={`Click to view: ${title}`}
            >
              <img
                src={bgImg}
                alt={title}
                className={styles.bannerImg}
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85';
                }}
              />

              {/* Gradient overlay for readability */}
              <div className={styles.gradientOverlay}>
                <div className={styles.badgeRow}>
                  <span className={styles.sponsoredBadge}>
                    <Sparkles size={11} />
                    <span>SPONSORED</span>
                  </span>
                  <span className={styles.featuredBadge}>
                    <Building2 size={11} />
                    <span>PREMIUM LAUNCH</span>
                  </span>
                </div>

                <h3 className={styles.bannerTitle}>{title}</h3>

                {sub && (
                  <p className={styles.bannerSub}>
                    <span>{sub}</span>
                    <span className={styles.viewDetailsPill}>
                      <span>Explore Project</span>
                      <ArrowRight size={12} />
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (visible on hover if multiple banners) */}
        {total > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.arrowLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Top Banner"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`${styles.navArrow} ${styles.arrowRight}`}
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Top Banner"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {total > 1 && (
          <div className={styles.dotsWrap}>
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setProgress(0);
                  lastTickRef.current = Date.now();
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Progress Timer Line */}
        {total > 1 && (
          <div
            className={styles.timerBar}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  );
}
