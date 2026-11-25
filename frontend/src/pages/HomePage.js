import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import EnquiryModal from '../components/EnquiryModal';
import AdCarousel from '../components/AdCarousel';
import { useAuth } from '../context/AuthContext';
import { getProperties, getCategoryCounts, getBuilderCounts, getBuilders, getLocalityCounts, getYoutubeLinks } from '../services/api';
import { BUILDERS } from '../data/builders';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import {
  ShieldCheck, UserCheck, Percent, PhoneCall,
  Building2,
  ArrowRight, Sparkles, ChevronLeft, ChevronRight,
  Play, ExternalLink, Youtube
} from 'lucide-react';
import styles from './HomePage.module.css';



const INITIAL_YOUTUBE_LINKS = [
  {
    _id: 'yt-1',
    title: 'Touring Luxury Seaside Villas in ECR Chennai',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Explore breathtaking private seaside villas with Italian marble finish, private pool, landscaped gardens and ocean views along East Coast Road.',
    category: 'Virtual Tours',
    status: 'active',
  },
  {
    _id: 'yt-2',
    title: 'Top 5 Real Estate Investment Hubs in Bengaluru',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    description: 'Comprehensive market analysis covering upcoming metro extensions, commercial corridors, and high appreciation residential micro-markets.',
    category: 'Market Trends',
    status: 'active',
  },
  {
    _id: 'yt-3',
    title: 'Modern High-Rise Duplex Penthouse Walkthrough',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    description: 'Walk through an ultra-spacious 4 BHK duplex penthouse featuring smart home automation, open terrace garden, and panoramic city skyline views.',
    category: 'Walkthrough',
    status: 'active',
  },
  {
    _id: 'yt-4',
    title: 'Pre-Leased Commercial Assets: 9% Rental Yield Guide',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    description: 'Understand how institutional investors lock in 9-year corporate leases with multinational banks and tech giants for reliable monthly returns.',
    category: 'Investment Advice',
    status: 'active',
  },
  {
    _id: 'yt-5',
    title: 'Understanding RERA & Legal Due Diligence in 2026',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    description: 'A masterclass on title verification, encumbrance certificates, layout sanctions, and protecting your capital with verified documentation.',
    category: 'Legal Guide',
    status: 'active',
  },
];

/* ── Value Propositions ───────────────────────────────────────── */
const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: '100% Verified',
    subtitle: 'Properties',
    desc: 'Every home physically verified & documentation checked.',
    color: '#134E3A',
    bg: 'linear-gradient(135deg, #E8F5F0 0%, #D0EBE0 100%)',
    iconBg: '#134E3A',
  },
  {
    icon: UserCheck,
    title: 'Direct Owner',
    subtitle: 'Connect',
    desc: 'Talk directly with genuine owners and trusted builders.',
    color: '#1E40AF',
    bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    iconBg: '#1E40AF',
  },
  {
    icon: Percent,
    title: 'Zero Brokerage',
    subtitle: 'Options',
    desc: 'Thousands of verified listings with 0% brokerage fees.',
    color: '#92400E',
    bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    iconBg: '#D97706',
  },
  {
    icon: PhoneCall,
    title: 'Instant Support',
    subtitle: '& Site Visit',
    desc: 'Schedule on-site visits and get free expert assistance.',
    color: '#6B21A8',
    bg: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)',
    iconBg: '#7C3AED',
  },
];

/* ── Categories with Real Estate Images ──────────────────────── */
const CATEGORIES = [
  {
    id: 'apartment',
    title: 'Apartments',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    unit: 'Homes',
    tagline: 'High-rise & gated communities',
    accent: '#134E3A',
    light: '#E8F5F0',
  },
  {
    id: 'villa',
    title: 'Luxury Villas',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    unit: 'Villas',
    tagline: 'Private garden & pool estates',
    accent: '#1E40AF',
    light: '#DBEAFE',
  },
  {
    id: 'plot',
    title: 'Plots & Land',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    unit: 'Plots',
    tagline: 'RERA-approved layout plots',
    accent: '#065F46',
    light: '#D1FAE5',
  },
  {
    id: 'commercial',
    title: 'Commercial',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    unit: 'Spaces',
    tagline: 'Offices, retail & tech parks',
    accent: '#92400E',
    light: '#FEF3C7',
  },
  {
    id: 'independent',
    title: 'Independent House',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    unit: 'Houses',
    tagline: 'Standalone family bungalows',
    accent: '#6B21A8',
    light: '#EDE9FE',
  },
  {
    id: 'pg',
    title: 'PG & Co-Living',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    unit: 'Rooms',
    tagline: 'Fully managed shared living',
    accent: '#BE185D',
    light: '#FCE7F3',
  },
];

/* ── Helpers: format real count without dummy data ────────────── */
function formatCount(n) {
  if (n === null || n === undefined) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  const [enquiryProp, setEnquiryProp] = useState(null);

  const handleEnquire = (prop) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setEnquiryProp(prop);
  };
  const [categoryCounts, setCategoryCounts] = useState({});
  const [builderCounts, setBuilderCounts] = useState({});
  const [buildersList, setBuildersList] = useState([]);
  const [serverLocalities, setServerLocalities] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [newProperties, setNewProperties] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYtIndex, setCurrentYtIndex] = useState(0);
  const [isYtPaused, setIsYtPaused] = useState(false);

  // Horizontal scroll refs for categories, localities, and builders
  const categoriesScrollRef = useRef(null);
  const localitiesScrollRef = useRef(null);
  const buildersScrollRef = useRef(null);

  const scrollContainer = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Dynamic Popular Localities computed strictly based on existing property listings
  const popularLocalities = useMemo(() => {
    if (serverLocalities && serverLocalities.length > 0) {
      return serverLocalities;
    }

    const list = (allProperties && allProperties.length > 0)
      ? allProperties
      : (newProperties && newProperties.length > 0 ? newProperties : []);

    const locMap = {};

    list.forEach((p) => {
      const loc = (p.locality || '').trim();
      if (!loc) return;
      const city = (p.city || '').trim();
      const key = city ? `${loc}, ${city}` : loc;

      if (!locMap[key]) {
        locMap[key] = {
          name: loc,
          city: city,
          title: key,
          count: 0,
          prices: [],
          sqftPrices: [],
        };
      }

      locMap[key].count += 1;

      const priceRaw = Number(p.priceRaw) || 0;
      if (priceRaw > 0) {
        locMap[key].prices.push(priceRaw);
      }

      if (p.perSqft) {
        const cleaned = String(p.perSqft).replace(/[^0-9]/g, '');
        const sqftNum = Number(cleaned);
        if (sqftNum > 0) {
          locMap[key].sqftPrices.push(sqftNum);
        }
      }
    });

    const result = Object.values(locMap).map((loc) => {
      let avgPriceDisplay = 'Price on Request';
      if (loc.sqftPrices.length > 0) {
        const avgSqft = Math.round(loc.sqftPrices.reduce((a, b) => a + b, 0) / loc.sqftPrices.length);
        avgPriceDisplay = `₹ ${avgSqft.toLocaleString('en-IN')}/Sq. Ft`;
      } else if (loc.prices.length > 0) {
        const avgPrice = loc.prices.reduce((a, b) => a + b, 0) / loc.prices.length;
        if (avgPrice >= 10000000) {
          avgPriceDisplay = `₹ ${(avgPrice / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
        } else {
          avgPriceDisplay = `₹ ${(avgPrice / 100000).toFixed(1).replace(/\.0$/, '')} Lac`;
        }
      }

      return {
        ...loc,
        avgPriceDisplay
      };
    });

    // Sort strictly by existing property count in that locality
    return result.sort((a, b) => b.count - a.count);
  }, [allProperties, newProperties, serverLocalities]);

  // Dynamic Builder counts and ongoing counts based strictly on existing property listings
  const sortedBuilders = useMemo(() => {
    const list = (allProperties && allProperties.length > 0)
      ? allProperties
      : (newProperties && newProperties.length > 0 ? newProperties : []);

    const propCountMap = {};
    const ongoingCountMap = {};

    list.forEach((p) => {
      const bName = (p.builderName || p.rawFormData?.builderName || '').trim();
      if (!bName) return;
      const bLower = bName.toLowerCase();
      propCountMap[bLower] = (propCountMap[bLower] || 0) + 1;

      const s = (p.propertyStatus || p.status || '').toLowerCase();
      const poss = (p.possession || '').toLowerCase();
      const isOngoing = s.includes('construction') || s.includes('ongoing') || (poss && !poss.includes('ready'));
      if (isOngoing) {
        ongoingCountMap[bLower] = (ongoingCountMap[bLower] || 0) + 1;
      }
    });

    const builders = (buildersList || BUILDERS).map((b) => {
      const bLower = (b.name || '').toLowerCase();
      const brandWord = bLower.split(' ')[0];

      // Exact count of properties belonging to this builder in existing listings
      let totalProjects = propCountMap[bLower] || 0;
      let ongoingProjects = ongoingCountMap[bLower] || 0;

      // Also match brand keyword (e.g. "Godrej" in "Godrej Properties")
      if (totalProjects === 0 && brandWord.length >= 4) {
        Object.keys(propCountMap).forEach((k) => {
          if (k.includes(brandWord) || brandWord.includes(k)) {
            totalProjects += propCountMap[k];
            ongoingProjects += (ongoingCountMap[k] || 0);
          }
        });
      }

      // If backend has DB counts, merge
      if (builderCounts[b.name] !== undefined) {
        totalProjects = Math.max(totalProjects, Number(builderCounts[b.name]) || 0);
      } else if (builderCounts[bLower] !== undefined) {
        totalProjects = Math.max(totalProjects, Number(builderCounts[bLower]) || 0);
      }

      return {
        ...b,
        id: b.id || b._id || b.name,
        totalProjects,
        ongoingProjects
      };
    });

    // Sort builders by actual existing property count (highest count first)
    return builders.sort((a, b) => b.totalProjects - a.totalProjects);
  }, [buildersList, allProperties, newProperties, builderCounts]);

  const [brokenLogos, setBrokenLogos] = useState({});
  const horizontalScrollRef = useRef(null);

  useEffect(() => {
    // 1. Fetch real property counts by category
    getCategoryCounts()
      .then(({ data }) => {
        if (data?.counts) setCategoryCounts(data.counts);
      })
      .catch(() => { });

    // 2. Fetch real project counts by builder name
    getBuilderCounts()
      .then(({ data }) => {
        if (data?.counts) setBuilderCounts(data.counts);
      })
      .catch(() => { });

    // 2.1 Fetch real locality counts from database
    getLocalityCounts()
      .then(({ data }) => {
        if (data?.localities && data.localities.length > 0) {
          setServerLocalities(data.localities);
        }
      })
      .catch(() => { });

    // 2.2 Fetch dynamic builders added from Admin Dashboard
    getBuilders()
      .then(({ data }) => {
        const list = data?.results || (Array.isArray(data) ? data : []);
        setBuildersList(list.length > 0 ? list : BUILDERS);
      })
      .catch(() => {
        setBuildersList(BUILDERS);
      });

    // 2.3 Fetch dynamic YouTube spotlight links from Admin Dashboard
    getYoutubeLinks()
      .then(({ data }) => {
        const list = data?.links || [];
        setYoutubeLinks(list.length > 0 ? list : INITIAL_YOUTUBE_LINKS);
      })
      .catch(() => {
        setYoutubeLinks(INITIAL_YOUTUBE_LINKS);
      });

    // 3. Fetch properties
    getProperties({ limit: 50, sort: 'newest' })
      .then(({ data }) => {
        const props = data.properties || data.results || (Array.isArray(data) ? data : []);
        setAllProperties(props);
        setNewProperties(props.slice(0, 12));
      })
      .catch((err) => {
        console.error('Failed to load properties, using dummy fallback:', err);
        setAllProperties(MOCK_PROPERTIES);
        setNewProperties(MOCK_PROPERTIES.slice(0, 12));
      })
      .finally(() => {
        setLoadingNew(false);
      });

    // IntersectionObserver for smooth scroll-appear animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.' + styles.scrollAppear);
      els.forEach((el) => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  const scrollHorizontal = (direction) => {
    if (horizontalScrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      horizontalScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Helper to extract YouTube video thumbnail or fallback
  const getYouTubeThumbnail = (url, customThumbnail) => {
    if (customThumbnail) return customThumbnail;
    if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
    const match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
  };

  // Auto-advance YouTube coverflow carousel every 3.8s (paused on mouse hover)
  useEffect(() => {
    if (!youtubeLinks || youtubeLinks.length <= 1 || isYtPaused) return;
    const interval = setInterval(() => {
      setCurrentYtIndex((prev) => (prev + 1) % youtubeLinks.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [youtubeLinks, isYtPaused]);

  const handlePrevYt = (e) => {
    if (e) e.stopPropagation();
    setCurrentYtIndex((prev) => (prev === 0 ? youtubeLinks.length - 1 : prev - 1));
  };

  const handleNextYt = (e) => {
    if (e) e.stopPropagation();
    setCurrentYtIndex((prev) => (prev + 1) % youtubeLinks.length);
  };

  const handleYtCardClick = (item) => {
    if (item?.youtubeUrl) {
      window.open(item.youtubeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={styles.homeWrap}>

      {/* ── 1. Hero Search ── */}
      <HeroSearch />

      {/* ── Social Media Bar Under Navbar ── */}
      {/* <div className={styles.socialBarWrap}>
        <div className={`container ${styles.socialBarInner}`}>
          <div className={styles.socialBarLeft}>
            <span className={styles.socialPulseDot} />
            <span className={styles.socialBarTitle}>Connect with ProBridge Official</span>
          </div>
          <div className={styles.socialIconsList}>
            <a
              href="https://www.facebook.com/profile.php?id=61594013548834"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIconBtn} ${styles.fbBtn}`}
              title="Facebook"
            >
              <Facebook size={15} />
              <span>Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/probridgeofficial/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIconBtn} ${styles.instaBtn}`}
              title="Instagram"
            >
              <Instagram size={15} />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/in/probridge-hr-714b19432/?isSelfProfile=true"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIconBtn} ${styles.linkedinBtn}`}
              title="LinkedIn"
            >
              <Linkedin size={15} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://x.com/Probbridge/status/2114328176268849582?s=20"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIconBtn} ${styles.xBtn}`}
              title="X (Twitter)"
            >
              <XIcon size={13} />
              <span>X</span>
            </a>
            <a
              href="https://wa.me/919176663200"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.socialIconBtn} ${styles.whatsappBtn}`}
              title="WhatsApp"
            >
              <WhatsAppIcon size={15} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div> */}


      {/* ── 2. New Properties (Horizontal Carousel) ── */}
      <section className={`container ${styles.section} ${styles.newPropertiesSection} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={13} className={styles.eyebrowIcon} />
              <span>FRESH LISTINGS &bull; JUST LAUNCHED</span>
            </div>
            <h2 className={styles.sectionTitle}>New Properties</h2>
            <p className={styles.sectionSub}>Explore newly added residential and commercial spaces across prime locations</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.browseAllBtn}
              onClick={() => navigate('/search?sort=newest')}
            >
              View All
            </button>
            <div className={styles.carouselNavBtns}>
              <button
                className={styles.scrollArrowBtn}
                onClick={() => scrollHorizontal('left')}
                aria-label="Scroll left"
                title="Scroll Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className={styles.scrollArrowBtn}
                onClick={() => scrollHorizontal('right')}
                aria-label="Scroll right"
                title="Scroll Right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.horizontalTrackWrapper}>
          <div className={styles.horizontalTrack} ref={horizontalScrollRef}>
            {loadingNew ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={styles.horizontalSkeletonCard} />
              ))
            ) : newProperties.length > 0 ? (
              newProperties.map((prop) => (
                <div key={prop._id || prop.id} className={styles.horizontalCardItem}>
                  <PropertyCard property={prop} onEnquire={handleEnquire} />
                </div>
              ))
            ) : (
              <div className={styles.emptyHorizontal}>
                <p>No new properties listed currently. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Trust Value Props ── */}
      <section className={`container ${styles.valuePropsSection} ${styles.scrollAppear}`}>
        <div className={styles.valuePropsGrid}>
          {VALUE_PROPS.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className={styles.valueCard} style={{ background: v.bg }}>
                <div className={styles.valueIconBox} style={{ background: v.iconBg }}>
                  <Icon size={24} color="#FFFFFF" />
                </div>
                <div className={styles.valueCardText}>
                  <div className={styles.valueTitleRow}>
                    <span className={styles.valueTitle} style={{ color: v.color }}>{v.title}</span>
                    <span className={styles.valueTitleSub} style={{ color: v.color }}>{v.subtitle}</span>
                  </div>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Browse by Type (Image & Horizontal Layout) ── */}
      <section className={`container ${styles.section} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={13} className={styles.eyebrowIcon} />
              <span>EXPLORE CATEGORIES</span>
            </div>
            <h2 className={styles.sectionTitle}>Browse Properties by Type</h2>
            <p className={styles.sectionSub}>Find the perfect match for your lifestyle or investment goals</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.scrollNavRow}>
              <button
                type="button"
                className={styles.scrollNavBtn}
                onClick={() => scrollContainer(categoriesScrollRef, -320)}
                aria-label="Previous categories"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className={styles.scrollNavBtn}
                onClick={() => scrollContainer(categoriesScrollRef, 320)}
                aria-label="Next categories"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.categoriesTrack} ref={categoriesScrollRef}>
          {CATEGORIES.map((cat) => {
            const liveCount = Number(categoryCounts[cat.id] ?? categoryCounts[cat.id + 's'] ?? 0);
            const displayCount = formatCount(liveCount);
            return (
              <div
                key={cat.id}
                className={styles.categoryCardBig}
                onClick={() => navigate(`/search?propertyType=${cat.id}`)}
                style={{ '--cat-accent': cat.accent, '--cat-light': cat.light }}
              >
                <div className={styles.catImgWrap}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={styles.catImg}
                    loading="lazy"
                  />
                  <div className={styles.catImgScrim} />
                  <span className={styles.catCountBadgeOverlay}>
                    {displayCount} {liveCount === 1 ? cat.unit.replace(/s$/, '') : cat.unit}
                  </span>
                </div>
                <div className={styles.catInfoBig}>
                  <h3 className={styles.catTitleBig}>{cat.title}</h3>
                  <p className={styles.catTagline}>{cat.tagline}</p>
                  <div className={styles.catExploreRow}>
                    <span>Explore properties</span>
                    <ArrowRight size={15} className={styles.catExploreArrow} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. Popular Localities Section (Horizontal Order) ── */}
      {popularLocalities.length > 0 && (
        <section className={`container ${styles.section} ${styles.localitiesSection} ${styles.scrollAppear}`}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <div className={styles.eyebrow}>
                <Sparkles size={13} className={styles.eyebrowIcon} />
                <span>TOP RESIDENTIAL HUBS</span>
              </div>
              <h2 className={styles.sectionTitle}>Popular Localities</h2>
              <p className={styles.sectionSub}>High-demand neighbourhoods with verified listing inventory</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.scrollNavRow}>
                <button
                  type="button"
                  className={styles.scrollNavBtn}
                  onClick={() => scrollContainer(localitiesScrollRef, -320)}
                  aria-label="Previous localities"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className={styles.scrollNavBtn}
                  onClick={() => scrollContainer(localitiesScrollRef, 320)}
                  aria-label="Next localities"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                className={styles.viewAllLink}
                onClick={() => navigate('/search')}
              >
                <span>View all</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.localitiesTrack} ref={localitiesScrollRef}>
            {popularLocalities.map((loc) => (
              <div
                key={loc.title}
                className={styles.localityCardHorizontal}
                onClick={() => navigate(`/search?locality=${encodeURIComponent(loc.name)}&city=${encodeURIComponent(loc.city)}`)}
              >
                <div className={styles.localityHeaderRow}>
                  <h3 className={styles.localityTitle}>{loc.title}</h3>
                  <span className={styles.localityCityPill}>{loc.city || 'Prime Area'}</span>
                </div>
                <div className={styles.localityMetricsRow}>
                  <div className={styles.localityMetricCol}>
                    <span className={styles.localityMetricVal}>{loc.count}</span>
                    <span className={styles.localityMetricLbl}>{loc.count === 1 ? 'Total project' : 'Total projects'}</span>
                  </div>
                  <div className={styles.localityMetricCol} style={{ textAlign: 'right' }}>
                    <span className={styles.localityMetricVal}>{loc.avgPriceDisplay}</span>
                    <span className={styles.localityMetricLbl}>Average price</span>
                  </div>
                </div>
                <div className={styles.localityCardFooter}>
                  <span>Explore locality listings</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Top Builders Section (Horizontal Order) ── */}
      <section className={`container ${styles.section} ${styles.buildersSection} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={13} className={styles.eyebrowIcon} />
              <span>REPUTED DEVELOPERS</span>
            </div>
            <h2 className={styles.sectionTitle}>Top Builders</h2>
            <p className={styles.sectionSub}>India&apos;s most trusted developers known for quality and timely delivery</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.scrollNavRow}>
              <button
                type="button"
                className={styles.scrollNavBtn}
                onClick={() => scrollContainer(buildersScrollRef, -300)}
                aria-label="Previous builders"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className={styles.scrollNavBtn}
                onClick={() => scrollContainer(buildersScrollRef, 300)}
                aria-label="Next builders"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              className={styles.viewAllLink}
              onClick={() => navigate('/search')}
            >
              <span>View all</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={styles.buildersTrack} ref={buildersScrollRef}>
          {sortedBuilders.map((b) => (
            <div
              key={b.id}
              className={styles.builderCardHorizontal}
              onClick={() => navigate(`/search?builder=${encodeURIComponent(b.name)}`)}
            >
              <div className={styles.builderLogoBox}>
                {brokenLogos[b.id] ? (
                  <div className={styles.builderFallbackLogo}>
                    <Building2 size={24} />
                    <span>{b.name.split(' ')[0]}</span>
                  </div>
                ) : (
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    className={styles.builderLogoImg}
                    loading="lazy"
                    onError={() => setBrokenLogos((prev) => ({ ...prev, [b.id]: true }))}
                  />
                )}
              </div>

              <div className={styles.builderBody}>
                <h3 className={styles.builderTitle} title={b.name}>{b.name}</h3>
                <div className={styles.builderStatsRow}>
                  <div className={styles.builderStatCol}>
                    <span className={styles.builderStatVal}>{b.totalProjects}</span>
                    <span className={styles.builderStatLbl}>{b.totalProjects === 1 ? 'Total Project' : 'Total Projects'}</span>
                  </div>
                  <div className={styles.builderStatCol}>
                    <span className={styles.builderStatVal}>{b.ongoingProjects}</span>
                    <span className={styles.builderStatLbl}>{b.ongoingProjects === 1 ? 'Ongoing' : 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Video & Commercial Spotlight 3D Coverflow Carousel (Image 2 format) ── */}
      {youtubeLinks && youtubeLinks.length > 0 && (
        <section
          className={`container ${styles.section} ${styles.scrollAppear}`}
          onMouseEnter={() => setIsYtPaused(true)}
          onMouseLeave={() => setIsYtPaused(false)}
        >
          {/* Section Header with Website Theme Dark Font Colors */}
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>
                <Sparkles size={13} className={styles.eyebrowIcon} />
                <span>VIDEO SPOTLIGHT &amp; VIRTUAL TOURS</span>
              </div>
              <h2 className={styles.sectionTitle}>Commercial &amp; Property Video Showcase</h2>
              <p className={styles.sectionSub}>
                Watch high-yield commercial investments, verified luxury walkthroughs &amp; market intelligence curated by ProBridge
              </p>
            </div>
          </div>

          <div className={styles.ytSpotlightWrap}>
            {/* 3D Coverflow Stage */}
            <div className={styles.ytStage}>
              {/* Left Arrow */}
              <button
                type="button"
                className={`${styles.ytNavArrow} ${styles.ytNavLeft}`}
                onClick={handlePrevYt}
                aria-label="Previous Spotlight"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Coverflow Cards */}
              <div className={styles.ytTrack}>
                {youtubeLinks.map((item, idx) => {
                  const n = youtubeLinks.length;
                  let diff = idx - currentYtIndex;
                  while (diff < -Math.floor(n / 2)) diff += n;
                  while (diff > Math.floor(n / 2)) diff -= n;

                  const isVisible = Math.abs(diff) <= 2;
                  if (!isVisible) return null;

                  const thumbUrl = getYouTubeThumbnail(item.youtubeUrl, item.thumbnail);

                  let cardClass = styles.ytCardCenter;
                  if (diff === -1) cardClass = styles.ytCardLeft;
                  else if (diff === 1) cardClass = styles.ytCardRight;
                  else if (diff === -2) cardClass = styles.ytCardFarLeft;
                  else if (diff === 2) cardClass = styles.ytCardFarRight;

                  return (
                    <div
                      key={item._id || item.id || idx}
                      className={`${styles.ytCard} ${cardClass}`}
                      onClick={() => handleYtCardClick(item)}
                      title="Click to watch on YouTube"
                    >
                      {/* Glowing Top Edge */}
                      <div className={styles.ytCardGlow} />

                      {/* Top Circular Badge / Play Icon */}
                      <div className={styles.ytCardIconRing}>
                        <Play size={20} fill="#F59E0B" color="#F59E0B" />
                      </div>

                      {/* Category Pill Tag */}
                      <div className={styles.ytCardCategoryBadge}>
                        <span>{item.category || 'COMMERCIAL SPOTLIGHT'}</span>
                      </div>

                      {/* Admin Given Title */}
                      <h3 className={styles.ytCardTitle}>{item.title}</h3>

                      {/* YouTube Thumbnail Preview */}
                      <div className={styles.ytThumbContainer}>
                        <img
                          src={thumbUrl}
                          alt={item.title}
                          className={styles.ytThumbImg}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
                          }}
                        />
                        <div className={styles.ytThumbOverlay}>
                          <div className={styles.ytYoutubeBadge}>
                            <Youtube size={15} color="#FF0000" />
                            <span>YouTube</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Given Description */}
                      <p className={styles.ytCardDesc}>{item.description}</p>

                      {/* Watch on YouTube Action */}
                      <div className={styles.ytCardAction}>
                        <span>Watch on YouTube</span>
                        <ExternalLink size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Arrow */}
              <button
                type="button"
                className={`${styles.ytNavArrow} ${styles.ytNavRight}`}
                onClick={handleNextYt}
                aria-label="Next Spotlight"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Slide Indicator Dots */}
            <div className={styles.ytDots}>
              {youtubeLinks.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  className={`${styles.ytDot} ${dotIdx === currentYtIndex ? styles.ytDotActive : ''}`}
                  onClick={() => setCurrentYtIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Sponsored & Featured Projects (Ads Carousel) ── */}
      <section className={`container ${styles.section} ${styles.featuredProjectsSection} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={13} className={styles.eyebrowIcon} />
              <span>SPONSORED &amp; FEATURED</span>
            </div>
            <h2 className={styles.sectionTitle}>Featured Projects &amp; Exclusive Residences</h2>
            <p className={styles.sectionSub}>Handpicked luxury developments, gated communities &amp; high-yield investment properties</p>
          </div>
        </div>

        <AdCarousel onEnquire={handleEnquire} />
      </section>

      {enquiryProp && (
        <EnquiryModal property={enquiryProp} onClose={() => setEnquiryProp(null)} />
      )}
    </div>
  );
}
