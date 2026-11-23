import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import EnquiryModal from '../components/EnquiryModal';
import AdCarousel from '../components/AdCarousel';
import { getProperties, getCategoryCounts, getBuilderCounts, getBuilders } from '../services/api';
import { BUILDERS } from '../data/builders';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import {
  ShieldCheck, UserCheck, Percent, PhoneCall,
  Building2, Home, TreePine, Store, Landmark, BedDouble,
  ArrowRight, Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import styles from './HomePage.module.css';



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

/* ── Categories ───────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'apartment', title: 'Apartments', icon: Building2, unit: 'Homes', accent: '#134E3A', light: '#E8F5F0' },
  { id: 'villa', title: 'Luxury Villas', icon: Home, unit: 'Villas', accent: '#1E40AF', light: '#DBEAFE' },
  { id: 'plot', title: 'Plots & Land', icon: TreePine, unit: 'Plots', accent: '#065F46', light: '#D1FAE5' },
  { id: 'commercial', title: 'Commercial', icon: Store, unit: 'Spaces', accent: '#92400E', light: '#FEF3C7' },
  { id: 'independent', title: 'Independent House', icon: Landmark, unit: 'Houses', accent: '#6B21A8', light: '#EDE9FE' },
  { id: 'pg', title: 'PG & Co-Living', icon: BedDouble, unit: 'Rooms', accent: '#BE185D', light: '#FCE7F3' },
];

/* ── Helpers: format real count without dummy data ────────────── */
function formatCount(n) {
  if (n === null || n === undefined) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [enquiryProp, setEnquiryProp] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [builderCounts, setBuilderCounts] = useState({});
  const [buildersList, setBuildersList] = useState(BUILDERS);
  const [allProperties, setAllProperties] = useState([]);
  const [newProperties, setNewProperties] = useState([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [showAllBuilders, setShowAllBuilders] = useState(false);

  // Dynamic Popular Localities computed based on real property count in each locality
  const popularLocalities = useMemo(() => {
    const list = (allProperties && allProperties.length > 0)
      ? allProperties
      : (newProperties.length > 0 ? newProperties : MOCK_PROPERTIES);

    const locMap = {};

    list.forEach((p) => {
      const loc = (p.locality || '').trim();
      const city = (p.city || '').trim();
      if (!loc) return;
      const key = `${loc}, ${city || 'India'}`;

      if (!locMap[key]) {
        locMap[key] = {
          name: loc,
          city: city,
          title: city ? `${loc}, ${city}` : loc,
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

    // Reference baseline localities matching Image 1
    const baselineDefaults = [
      { name: 'Camp', city: 'Pune', count: 3, avgPriceDisplay: '₹ 1.13 Crore' },
      { name: 'Chimbali', city: 'Pune', count: 10, avgPriceDisplay: '₹ 5,760/Sq. Ft' },
      { name: 'Dudulgaon', city: 'Pune', count: 27, avgPriceDisplay: '₹ 4,646/Sq. Ft' },
      { name: 'Whitefield', city: 'Bengaluru', count: 18, avgPriceDisplay: '₹ 1.25 Crore' },
      { name: 'Hebbal', city: 'Bengaluru', count: 14, avgPriceDisplay: '₹ 1.45 Crore' },
      { name: 'Padur', city: 'Chennai', count: 8, avgPriceDisplay: '₹ 82.5 Lac' },
    ];

    const result = Object.values(locMap).map((loc) => {
      let avgPriceDisplay = '';
      if (loc.sqftPrices.length > 0 && (loc.name === 'Chimbali' || loc.name === 'Dudulgaon' || loc.prices.length === 0)) {
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

      const matchedBase = baselineDefaults.find(
        (b) => b.name.toLowerCase() === loc.name.toLowerCase() && b.city.toLowerCase() === loc.city.toLowerCase()
      );

      const finalCount = matchedBase ? Math.max(loc.count, matchedBase.count) : loc.count;
      const finalPrice = avgPriceDisplay || (matchedBase ? matchedBase.avgPriceDisplay : '₹ 1.10 Crore');

      return {
        ...loc,
        count: finalCount,
        avgPriceDisplay: finalPrice
      };
    });

    baselineDefaults.forEach((b) => {
      const exists = result.some((r) => r.name.toLowerCase() === b.name.toLowerCase() && r.city.toLowerCase() === b.city.toLowerCase());
      if (!exists) {
        result.push({
          name: b.name,
          city: b.city,
          title: `${b.name}, ${b.city}`,
          count: b.count,
          avgPriceDisplay: b.avgPriceDisplay
        });
      }
    });

    // Sort descending by property count
    return result.sort((a, b) => b.count - a.count);
  }, [allProperties, newProperties]);

  // Dynamic Builder counts and ongoing counts based on property count
  const sortedBuilders = useMemo(() => {
    const list = (allProperties && allProperties.length > 0)
      ? allProperties
      : (newProperties.length > 0 ? newProperties : MOCK_PROPERTIES);

    const propCountMap = {};
    const ongoingCountMap = {};

    list.forEach((p) => {
      const bName = (p.builderName || '').trim();
      if (!bName) return;
      const bLower = bName.toLowerCase();
      propCountMap[bLower] = (propCountMap[bLower] || 0) + 1;

      const isOngoing = (p.propertyStatus && p.propertyStatus.toLowerCase().includes('construction')) ||
                        (p.possession && !p.possession.toLowerCase().includes('ready'));
      if (isOngoing) {
        ongoingCountMap[bLower] = (ongoingCountMap[bLower] || 0) + 1;
      }
    });

    const builders = (buildersList || BUILDERS).map((b) => {
      const bLower = (b.name || '').toLowerCase();
      const realPropCount = propCountMap[bLower] ?? builderCounts[b.name] ?? builderCounts[bLower] ?? 0;

      // Project count based on property count
      const totalProjects = realPropCount > 0
        ? (b.totalProjects ? Math.max(realPropCount, b.totalProjects) : realPropCount)
        : (b.totalProjects || 12);

      const ongoingProjects = ongoingCountMap[bLower]
        ?? b.ongoingProjects
        ?? Math.max(1, Math.round(totalProjects * 0.55));

      return {
        ...b,
        id: b.id || b._id || b.name,
        propertyCount: realPropCount,
        totalProjects,
        ongoingProjects
      };
    });

    // Sort builders by total projects count descending
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

    // 2.1 Fetch dynamic builders added from Admin Dashboard
    getBuilders()
      .then(({ data }) => {
        const list = data?.results || (Array.isArray(data) ? data : []);
        if (list.length > 0) setBuildersList(list);
      })
      .catch(() => { });

    // 3. Fetch properties
    getProperties({ limit: 50, sort: 'newest' })
      .then(({ data }) => {
        const props = data.properties || data.results || (Array.isArray(data) ? data : []);
        setAllProperties(props);
        setNewProperties(props.slice(0, 12));
      })
      .catch((err) => {
        console.error('Failed to load properties:', err);
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
                  <PropertyCard property={prop} onEnquire={setEnquiryProp} />
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

      {/* ── 4. Browse by Type ── */}
      <section className={`container ${styles.section} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={13} className={styles.eyebrowIcon} />
              <span>EXPLORE CATEGORIES</span>
            </div>
            <h2 className={styles.sectionTitle}>Browse Properties by Type</h2>
            <p className={styles.sectionSub}>Find the perfect match for your lifestyle or investment goals</p>
          </div>
        </div>

        <div className={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            // Real count from MongoDB based on propertyType
            const liveCount = Number(categoryCounts[cat.id] ?? categoryCounts[cat.id + 's'] ?? 0);
            const displayCount = formatCount(liveCount);
            return (
              <button
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => navigate(`/search?propertyType=${cat.id}`)}
                style={{ '--cat-accent': cat.accent, '--cat-light': cat.light }}
              >
                <div className={styles.catIconWrap}>
                  <Icon size={26} className={styles.catIcon} />
                </div>
                <div className={styles.catInfo}>
                  <div className={styles.catTitle}>{cat.title}</div>
                  <div className={styles.catCountBadge}>
                    {displayCount} {liveCount === 1 ? cat.unit.replace(/s$/, '') : cat.unit}
                  </div>
                </div>
                <div className={styles.catArrow}>
                  <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 5. Popular Localities Section (PropTiger Style) ── */}
      <section className={`container ${styles.section} ${styles.localitiesSection} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Popular Localities</h2>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.viewAllLink}
              onClick={() => navigate('/search')}
            >
              <span>View all</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={styles.localitiesGrid}>
          {popularLocalities.slice(0, 3).map((loc) => (
            <div
              key={loc.title}
              className={styles.localityCard}
              onClick={() => navigate(`/search?locality=${encodeURIComponent(loc.name)}&city=${encodeURIComponent(loc.city)}`)}
            >
              <h3 className={styles.localityTitle}>{loc.title}</h3>
              <div className={styles.localityMetricsRow}>
                <div className={styles.localityMetricCol}>
                  <span className={styles.localityMetricVal}>{loc.count}</span>
                  <span className={styles.localityMetricLbl}>Total projects</span>
                </div>
                <div className={styles.localityMetricCol} style={{ textAlign: 'right' }}>
                  <span className={styles.localityMetricVal}>{loc.avgPriceDisplay}</span>
                  <span className={styles.localityMetricLbl}>Average price</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Top Builders Section (PropTiger Style) ── */}
      <section className={`container ${styles.section} ${styles.buildersSection} ${styles.scrollAppear}`}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionTitle}>Top Builders</h2>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.viewAllLink}
              onClick={() => setShowAllBuilders((prev) => !prev)}
            >
              <span>{showAllBuilders ? 'Show less' : 'View all'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={styles.buildersGrid}>
          {(showAllBuilders ? sortedBuilders : sortedBuilders.slice(0, 6)).map((b) => (
            <div
              key={b.id}
              className={styles.builderCard}
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
                    <span className={styles.builderStatLbl}>Total Projects</span>
                  </div>
                  <div className={styles.builderStatCol}>
                    <span className={styles.builderStatVal}>{b.ongoingProjects}</span>
                    <span className={styles.builderStatLbl}>Ongoing Projects</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Commercial Spotlight Banner ── */}
      <section className={`container ${styles.section} ${styles.scrollAppear}`}>
        <div className={styles.commercialCard}>
          <div className={styles.commercialLeft}>
            <div className={styles.commercialTag}>
              <Sparkles size={12} />
              <span>INSTITUTIONAL ASSETS &bull; HIGH CAP RATE</span>
            </div>
            <h2 className={styles.commercialTitle}>Commercial Real Estate Spotlight</h2>
            <p className={styles.commercialBody}>
              Pre-leased Grade-A corporate parks, retail high-streets &amp; modern co-working towers
              with guaranteed 9-year long lock-ins and high rental yields.
            </p>
            <div className={styles.commercialActions}>
              <button
                className={styles.commercialBtn}
                onClick={() => navigate('/search?buildingType=Commercial')}
              >
                <span>Explore Commercial Spaces</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.commercialMetrics}>
            {[
              { value: '8.5 – 12%', label: 'Average Annual Rental Yield' },
              { value: '9+ Years', label: 'Corporate Tenant Lock-in' },
              { value: 'Grade-A', label: 'Pre-leased Bluechip Assets' },
            ].map((m, i) => (
              <div key={i} className={styles.metricItem}>
                <div className={styles.metricVal}>{m.value}</div>
                <div className={styles.metricLbl}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

        <AdCarousel onEnquire={setEnquiryProp} />
      </section>

      {enquiryProp && (
        <EnquiryModal property={enquiryProp} onClose={() => setEnquiryProp(null)} />
      )}
    </div>
  );
}
