import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Bed, Maximize2, MapPin,
  Clock, Building, Sparkles, CheckCircle2, ArrowRight,
  Image as ImageIcon, ShieldCheck
} from 'lucide-react';
import { getActiveAds, trackAdClick, getProperties } from '../services/api';
import styles from './AdCarousel.module.css';

const AUTO_SWIPE_INTERVAL = 5500; // 5.5 seconds per ad

const FALLBACK_ADS = [
  {
    _id: 'default-ad-1',
    title: 'Luxury Apartments in Whitefield',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=85',
    bedroom: '3 BHK',
    area: '1,850 Sq.ft',
    locality: 'Whitefield',
    city: 'Bengaluru',
    price: '₹1.25 Cr',
    priceNote: 'Onwards',
    possession: 'Ready to Move',
    buildingType: 'Residential',
    propertyType: 'Apartment',
    description: 'Experience contemporary luxury living in the heart of Whitefield. Spacious 3 BHK residences featuring world-class amenities, private balconies, and landscaped podium gardens.',
    amenities: ['Swimming Pool', 'Gym & Fitness', 'Clubhouse', '24/7 Security'],
  },
  {
    _id: 'default-ad-2',
    title: 'Signature Villa in Indiranagar',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
    bedroom: '4 BHK',
    area: '3,200 Sq.ft',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    price: '₹3.80 Cr',
    priceNote: 'Onwards',
    possession: 'Ready to Move',
    buildingType: 'Residential',
    propertyType: 'Villa',
    description: 'Exclusive gated community luxury villas with personal plunge pool, Italian marble flooring, and smart home automation in prime Indiranagar.',
    amenities: ['Private Pool', 'Home Automation', 'Private Lawn', 'Covered Parking'],
  },
  {
    _id: 'default-ad-3',
    title: 'Modern Sky Penthouse in Koramangala',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=85',
    bedroom: '3 BHK',
    area: '2,400 Sq.ft',
    locality: 'Koramangala',
    city: 'Bengaluru',
    price: '₹2.10 Cr',
    priceNote: 'Onwards',
    possession: 'Under Construction',
    buildingType: 'Residential',
    propertyType: 'Penthouse',
    description: 'Sky-high luxury penthouse with panoramic city skyline views, private terrace garden, and double-height living room ceilings.',
    amenities: ['Sky Deck', 'Infinity Pool', 'Terrace Garden', 'Concierge Service'],
  },
  {
    _id: 'default-ad-4',
    title: 'Grade-A Commercial Park in Cyber City',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=85',
    bedroom: 'Grade-A Office',
    area: '5,500 Sq.ft',
    locality: 'Cyber City',
    city: 'Hyderabad',
    price: '₹7.50 Cr',
    priceNote: 'Expected Yield 9.2%',
    possession: 'Immediate Possession',
    buildingType: 'Commercial',
    propertyType: 'Commercial',
    description: 'Pre-leased institutional-grade corporate office floor leased to MNC tenants with 9-year long lock-in and high annual rental appreciation.',
    amenities: ['High Speed Elevators', 'Central AC', 'Triple Height Lobby', '100% DG Backup'],
  },
];

export default function AdCarousel({ onEnquire }) {
  const navigate = useNavigate();
  const [ads, setAds] = useState(FALLBACK_ADS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch active ads from website backend, linking to real approved properties
  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getActiveAds(),
      getProperties({ limit: 6 })
    ]).then(([adsRes, propsRes]) => {
      if (!active) return;

      const realProps = propsRes.status === 'fulfilled' ? propsRes.value.data?.properties || [] : [];

      if (adsRes.status === 'fulfilled' && adsRes.value.data?.results?.length > 0) {
        const formatted = adsRes.value.data.results.map((ad, i) => {
          const p = ad.property || realProps[i] || {};
          return {
            _id: ad._id,
            title: ad.title || p.title || 'Featured Luxury Property',
            image: ad.image || p.image || p.images?.[0] || FALLBACK_ADS[0].image,
            bedroom: p.bedroom || '3 BHK',
            area: p.area || p.plotSize || '1,850 Sq.ft',
            locality: p.locality || 'Prime Location',
            city: p.city || 'Bengaluru',
            price: p.price || ad.price || 'Price on Request',
            priceNote: p.priceNote || 'Onwards',
            possession: p.possession || 'Ready to Move',
            buildingType: p.buildingType || 'Residential',
            propertyType: p.propertyType || 'Apartment',
            description: p.description || ad.description || 'Exclusive premium property listing verified by ProBridge experts with prime connectivity.',
            amenities: p.amenities && p.amenities.length > 0 ? p.amenities : ['Clubhouse', '24/7 Security', 'Covered Parking', 'Power Backup'],
            propertyId: p._id || p.id,
          };
        });
        setAds(formatted);
      } else if (realProps.length > 0) {
        // Map approved properties into our luxury ads format
        const merged = FALLBACK_ADS.map((fallback, idx) => {
          const rp = realProps[idx % realProps.length];
          return {
            ...fallback,
            propertyId: rp._id || rp.id,
            title: fallback.title,
            price: rp.price || fallback.price,
            locality: rp.locality || fallback.locality,
            city: rp.city || fallback.city,
            image: rp.image || rp.images?.[0] || fallback.image,
          };
        });
        setAds(merged);
      }
    });

    return () => { active = false; };
  }, []);

  // Automatic swipe one by one
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, AUTO_SWIPE_INTERVAL);

    return () => clearInterval(timer);
  }, [ads.length, isPaused]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  }, [ads.length]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  // Navigate to property view page
  const handleViewDetails = useCallback((ad) => {
    if (ad._id && !String(ad._id).startsWith('default-')) {
      trackAdClick(ad._id).catch(() => {});
    }

    if (ad.propertyId) {
      navigate(`/property/${ad.propertyId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(ad.locality || ad.city || ad.title)}`);
    }
  }, [navigate]);

  // Direct Enquiry modal opener
  const handleEnquire = useCallback((ad) => {
    if (onEnquire) {
      onEnquire({
        id: ad.propertyId,
        _id: ad.propertyId,
        title: ad.title,
        price: ad.price,
        location: `${ad.locality}, ${ad.city}`,
        image: ad.image,
      });
    }
  }, [onEnquire]);

  if (!ads || ads.length === 0) return null;

  return (
    <div
      className={styles.carouselContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Slide Viewport ── */}
      <div className={styles.sliderViewport}>
        <div
          className={styles.sliderTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {ads.map((ad, idx) => (
            <div key={ad._id || idx} className={styles.slideCard}>

              {/* ── 1. Image with correct banner width (Left Column) ── */}
              <div
                className={styles.imageCol}
                onClick={() => handleViewDetails(ad)}
                title="Click to view property page"
              >
                <img
                  src={ad.image}
                  alt={ad.title}
                  className={styles.bannerImg}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Subtle soft gradient overlay for image badge contrast */}
                <div className={styles.imageOverlay} />

                {/* Top-left Sponsored Badge */}
                <div className={styles.sponsoredBadge}>
                  <Sparkles size={12} className={styles.sparkleIcon} />
                  <span>SPONSORED</span>
                </div>

                {/* Top-right Counter Badge */}
                <div className={styles.counterBadge}>
                  <ImageIcon size={12} />
                  <span>{idx + 1} / {ads.length}</span>
                </div>

                {/* Bottom-left Price Tag on image banner */}
                <div className={styles.imagePriceTag}>
                  <span className={styles.imagePriceVal}>{ad.price}</span>
                  {ad.priceNote && (
                    <span className={styles.imagePriceSub}>{ad.priceNote}</span>
                  )}
                </div>
              </div>

              {/* ── 2. Extra Space: Full Property Details (Right Column) ── */}
              <div className={styles.detailsCol}>
                {/* Eyebrow Status */}
                <div className={styles.eyebrowRow}>
                  <div className={styles.exclusivePill}>
                    <ShieldCheck size={13} className={styles.shieldIcon} />
                    <span>PROBRIDGE EXCLUSIVE &bull; VERIFIED</span>
                  </div>
                  <span className={styles.possessionBadge}>
                    <Clock size={12} />
                    <span>{ad.possession || 'Ready to Move'}</span>
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={styles.adTitle}
                  onClick={() => handleViewDetails(ad)}
                  title="Click to view property page"
                >
                  {ad.title}
                </h3>

                {/* Location */}
                <div className={styles.locationRow}>
                  <MapPin size={15} className={styles.pinIcon} />
                  <span>{ad.locality}{ad.city ? `, ${ad.city}` : ''}</span>
                </div>

                {/* 4-Box Specs Grid */}
                <div className={styles.specsGrid}>
                  <div className={styles.specBox}>
                    <Bed size={17} className={styles.specIcon} />
                    <div>
                      <span className={styles.specLabel}>Configuration</span>
                      <strong className={styles.specVal}>{ad.bedroom}</strong>
                    </div>
                  </div>

                  <div className={styles.specBox}>
                    <Maximize2 size={16} className={styles.specIcon} />
                    <div>
                      <span className={styles.specLabel}>Super Area</span>
                      <strong className={styles.specVal}>{ad.area}</strong>
                    </div>
                  </div>

                  <div className={styles.specBox}>
                    <Building size={16} className={styles.specIcon} />
                    <div>
                      <span className={styles.specLabel}>Property Type</span>
                      <strong className={styles.specVal}>{ad.propertyType || ad.buildingType}</strong>
                    </div>
                  </div>

                  <div className={styles.specBox}>
                    <Clock size={16} className={styles.specIcon} />
                    <div>
                      <span className={styles.specLabel}>Possession</span>
                      <strong className={styles.specVal}>{ad.possession}</strong>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <p className={styles.descriptionText}>
                  {ad.description}
                </p>

                {/* Highlights / Amenities Chips */}
                {ad.amenities && ad.amenities.length > 0 && (
                  <div className={styles.amenitiesRow}>
                    {ad.amenities.slice(0, 4).map((a, i) => (
                      <span key={i} className={styles.amenityChip}>
                        <CheckCircle2 size={13} className={styles.checkIcon} />
                        <span>{a}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Price & Action Buttons */}
                <div className={styles.actionRow}>
                  <div className={styles.bottomPriceBlock}>
                    <span className={styles.priceHeading}>Starting From</span>
                    <div className={styles.priceValueWrap}>
                      <span className={styles.bottomPriceVal}>{ad.price}</span>
                      {ad.priceNote && (
                        <span className={styles.bottomPriceNote}>{ad.priceNote}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.enquireBtn}
                      onClick={() => handleEnquire(ad)}
                      type="button"
                    >
                      Enquire Now
                    </button>

                    <button
                      className={styles.viewDetailsBtn}
                      onClick={() => handleViewDetails(ad)}
                      type="button"
                    >
                      <span>View Details</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* ── Prev / Next Navigation Arrows ── */}
        <button
          className={`${styles.navArrow} ${styles.navArrowPrev}`}
          onClick={handlePrev}
          aria-label="Previous ad"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className={`${styles.navArrow} ${styles.navArrowNext}`}
          onClick={handleNext}
          aria-label="Next ad"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Dot Indicators ── */}
      <div className={styles.dotsRow}>
        {ads.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to ad ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
