import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProperty, getProperties, sendEnquiry } from '../services/api';
import { useSaved } from '../context/SavedContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import {
  Heart, MapPin, CheckCircle, ArrowLeft, ArrowRight,
  Dumbbell, Waves, Trees, Zap, Car, ArrowUpDown, Footprints,
  Trophy, CloudRain, Flame, Wifi, Bath, BookOpen, Wrench,
  Armchair, PhoneCall, Baby, Train, Activity, GraduationCap,
  ShoppingBag, Plane, Map, List, Navigation, Info, Plus,
  ChevronDown, ChevronUp, Phone, Check,
  Camera, Video, Compass, Share2,
  Calculator, FileText, Layers, Building2,
  ExternalLink, MessageCircle, HelpCircle, X,
  ShieldCheck, Film, ChevronRight, Sparkles
} from 'lucide-react';
import styles from './PropertyDetailPage.module.css';
import { BUILDERS } from '../data/builders';
import EnquiryModal from '../components/EnquiryModal';


/* ─€─€ Contextual Amenity Icon Resolver ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function getAmenityIcon(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('gym') || n.includes('fitness') || n.includes('workout')) return <Dumbbell size={18} />;
  if (n.includes('pool') || n.includes('swim')) return <Waves size={18} />;
  if (n.includes('club') || n.includes('community') || n.includes('hall')) return <Building2 size={18} />;
  if (n.includes('garden') || n.includes('park') || n.includes('lawn') || n.includes('green') || n.includes('tree')) return <Trees size={18} />;
  if (n.includes('play') || n.includes('kid') || n.includes('child') || n.includes('creche')) return <Baby size={18} />;
  if (n.includes('power') || n.includes('backup') || n.includes('generator') || n.includes('electric')) return <Zap size={18} />;
  if (n.includes('secur') || n.includes('cctv') || n.includes('guard') || n.includes('gated')) return <ShieldCheck size={18} />;
  if (n.includes('park') || n.includes('car') || n.includes('garage')) return <Car size={18} />;
  if (n.includes('lift') || n.includes('elevator')) return <ArrowUpDown size={18} />;
  if (n.includes('jog') || n.includes('walk') || n.includes('track')) return <Footprints size={18} />;
  if (n.includes('game') || n.includes('indoor') || n.includes('tennis') || n.includes('badminton') || n.includes('court')) return <Trophy size={18} />;
  if (n.includes('water') || n.includes('harvest') || n.includes('rain')) return <CloudRain size={18} />;
  if (n.includes('gas') || n.includes('pipe') || n.includes('fire')) return <Flame size={18} />;
  if (n.includes('wifi') || n.includes('internet') || n.includes('broadband')) return <Wifi size={18} />;
  if (n.includes('spa') || n.includes('sauna') || n.includes('jacuzzi')) return <Bath size={18} />;
  if (n.includes('library') || n.includes('read') || n.includes('book')) return <BookOpen size={18} />;
  if (n.includes('maint') || n.includes('waste') || n.includes('clean') || n.includes('staff')) return <Wrench size={18} />;
  if (n.includes('senior') || n.includes('sit') || n.includes('gazebo')) return <Armchair size={18} />;
  if (n.includes('intercom') || n.includes('phone')) return <PhoneCall size={18} />;
  if (n.includes('vastu') || n.includes('vaastu')) return <Compass size={18} />;
  return <Sparkles size={18} />;
}

/* ─€─€ Section navigation tabs with dedicated icons ─€─€─€─€─€─€─€─€─€─€─€─€─€ */
const TABS = [
  { id: 'overview', label: 'Overview', Icon: FileText },
  { id: 'floor-plans', label: 'Floor Plan', Icon: Layers },
  { id: 'amenities', label: 'Amenities', Icon: Sparkles },
  { id: 'gallery', label: 'Gallery', Icon: Camera },
  { id: 'home-loan', label: 'Home Loan', Icon: Calculator },
  { id: 'payment-plans', label: 'Payment Plans', Icon: FileText },
  { id: 'neighbourhood', label: 'Neighbourhood', Icon: Compass },
  { id: 'brochure', label: 'Brochure', Icon: MessageCircle },
  { id: 'builder', label: 'Builder', Icon: Building2 },
  { id: 'faq', label: 'FAQ', Icon: HelpCircle },
];

/* ─€─€ Currency formatter helper ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function formatIndianCurrency(num) {
  if (!num || isNaN(num)) return '₹ 0';
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
  }
  return `₹ ${Math.round(num).toLocaleString('en-IN')}`;
}

/* ─€─€ Extract YouTube Embed URL helper ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggle } = useSaved();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState('photos'); // 'photos' | 'videos' | 'plans'
  const [similarProperties, setSimilarProperties] = useState([]);

  /* Enquiry Modal state */
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryModalMode, setEnquiryModalMode] = useState('enquire'); // 'enquire' | 'callback'
  const [enquiryUnitTitle, setEnquiryUnitTitle] = useState('');

  const handleOpenEnquiry = (unit = '', mode = 'enquire') => {
    setEnquiryModalMode(mode);
    setEnquiryUnitTitle(unit);
    setEnquiryModalOpen(true);
  };

  /* Callback / Enquiry Form state */
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* Interactive Home Loan Calculator state */
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanTenure, setLoanTenure] = useState(20);
  const [tenureUnit, setTenureUnit] = useState('years'); // 'years' | 'months'
  const [interestRate, setInterestRate] = useState(8.5);

  /* Neighbourhood category state */
  const [locationTab, setLocationTab] = useState('radar'); // 'radar' | 'map' | 'places'
  const [allPlacesCategory, setAllPlacesCategory] = useState('all');

  /* Payment plan modal state */
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bhkViewMode, setBhkViewMode] = useState('columns'); // 'columns' | 'table'

  /* FAQ Accordion state */
  const [openFaq, setOpenFaq] = useState(0);

  /* Sticky Header Scroll state */
  const [scrolled, setScrolled] = useState(false);

  /* Scroll-spy state & refs */
  const isClickScrollingRef = useRef(false);
  const clickScrollTimerRef = useRef(null);
  const tabListRef = useRef(null);

  useEffect(() => {
    let animationFrameId = null;

    const handleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        const scrollY = window.scrollY;
        setScrolled(scrollY > 280);

        // If the user clicked a tab to scroll, don't override until smooth scroll completes
        if (isClickScrollingRef.current) return;

        // Check if near bottom of page (activate last section e.g. FAQ)
        const isNearBottom =
          window.innerHeight + window.scrollY >= (document.documentElement.scrollHeight - 80);

        let currentActive = TABS[0].id;

        if (isNearBottom) {
          for (let i = TABS.length - 1; i >= 0; i--) {
            const el = document.getElementById(TABS[i].id);
            if (el) {
              currentActive = TABS[i].id;
              break;
            }
          }
        } else {
          // Section offset: dual sticky navbar height (~115px) + 35px threshold
          const offset = 150;
          for (let i = 0; i < TABS.length; i++) {
            const sectionId = TABS[i].id;
            const el = document.getElementById(sectionId);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= offset) {
                currentActive = sectionId;
              }
            }
          }
        }

        setActiveTab((prev) => {
          if (prev !== currentActive) {
            // Scroll active tab button into center view in the horizontal tab bar
            const activeTabBtn = document.getElementById(`tab-btn-${currentActive}`);
            if (activeTabBtn && tabListRef.current) {
              activeTabBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
              });
            }
            return currentActive;
          }
          return prev;
        });
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      clearTimeout(clickScrollTimerRef.current);
    };
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('callbackCard');
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setLoading(true);
    getProperty(id)
      .then(({ data }) => {
        const prop = data?.property || data?.result;
        setProperty(prop);
        if (prop) {
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Initialize loan calculator with 80% of property price
          let rawPrice = 0;
          if (typeof prop.priceRaw === 'number' && prop.priceRaw > 0) {
            rawPrice = prop.priceRaw;
          } else if (prop.price) {
            const str = String(prop.price);
            if (/cr/i.test(str)) {
              rawPrice = (parseFloat(str.replace(/[^0-9.]/g, '')) || 0) * 10000000;
            } else if (/lac|lakh/i.test(str)) {
              rawPrice = (parseFloat(str.replace(/[^0-9.]/g, '')) || 0) * 100000;
            } else {
              rawPrice = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
            }
          }
          if (rawPrice > 0) {
            setLoanAmount(Math.round(rawPrice * 0.8));
          }

          // Fetch other properties from same city for "More projects by seller" & "Similar Projects"
          if (prop.city) {
            getProperties({ city: prop.city })
              .then((res) => {
                const list = res.data?.results || res.data?.properties || [];
                setSimilarProperties(list.filter((item) => String(item.id || item._id) !== String(prop.id || prop._id)));
              })
              .catch(() => { });
          }
        }
      })
      .catch((err) => {
        console.warn('Property fetch error:', err?.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Pre-fill user contact info if logged in
  useEffect(() => {
    if (user) {
      setLeadName(user.name || '');
      setLeadPhone(user.phone || '');
      setLeadEmail(user.email || '');
    }
  }, [user]);

  /* ─€─€ Home Loan Calculations (IOB Bank Style) ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
  const loanStats = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const r = (Number(interestRate) || 8.5) / (12 * 100);
    const n = tenureUnit === 'months' ? (Number(loanTenure) || 240) : (Number(loanTenure) || 20) * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, principalRatio: 50, interestRatio: 50, monthsCount: 0 };
    }

    const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPayment = emi * n;
    const totalInterest = Math.max(0, totalPayment - P);
    const principalRatio = totalPayment > 0 ? (P / totalPayment) * 100 : 50;
    const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 50;

    return { emi, totalPayment, totalInterest, principalRatio, interestRatio, monthsCount: n };
  }, [loanAmount, loanTenure, tenureUnit, interestRate]);

  /* Matched builder from BUILDERS directory */
  const matchedBuilder = useMemo(() => {
    if (!property?.builderName) return null;
    const name = property.builderName.toLowerCase().trim();
    return (
      BUILDERS.find((b) => {
        const bName = b.name.toLowerCase();
        return bName.includes(name) || name.includes(bName) || b.id === name;
      }) || null
    );
  }, [property?.builderName]);

  /* Active BHK Configurations (Column-wise 1, 2, 3 BHK) */
  const activeUnitConfigs = useMemo(() => {
    if (property?.unitConfigurations && property.unitConfigurations.length > 0) {
      return property.unitConfigurations;
    }
    if (property?.propertyType === 'Plot') return [];
    // Fallback if property only has single residential configuration
    const bhk = property?.bedroom || '2 BHK';
    return [
      {
        bhk: bhk,
        area: property?.superBuiltUpArea ? `${property.superBuiltUpArea} sq.ft` : (property?.carpetArea ? `${property.carpetArea} sq.ft` : '1050 sq.ft'),
        carpetArea: property?.carpetArea ? `${property.carpetArea} sq.ft` : '',
        price: property?.price || 'Price on Request',
        bathrooms: property?.bathroom || '2',
        balconies: property?.balconies || '1',
        status: property?.propertyStatus || 'Ready to Move',
      }
    ];
  }, [property]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.loadingWrap}>
        <Building2 size={48} color="#94a3b8" />
        <h2 style={{ margin: '14px 0 6px', color: '#0f172a', fontSize: '22px' }}>Property Not Found</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>The requested property could not be found or may have been unlisted.</p>
        <Link to="/" className={styles.backBtn} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to Listings
        </Link>
      </div>
    );
  }

  const p = property;
  const isPlot = p.propertyType === 'Plot';

  const images = [p.image, ...(p.images || [])].filter(Boolean);
  const floorPlans = p.floorPlanImages || [];
  const saved = isSaved(p.id || p._id);

  const handleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggle(p);
  };

  /* Scroll to section on tab click with scroll-spy synchronization */
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    isClickScrollingRef.current = true;
    clearTimeout(clickScrollTimerRef.current);
    clickScrollTimerRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 750);

    // Center active tab in horizontal scroll list
    const activeTabBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeTabBtn && tabListRef.current) {
      activeTabBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }

    const el = document.getElementById(tabId);
    if (el) {
      const yOffset = -125;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  /* Contact Seller submission */
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!leadPhone.trim()) {
      setErrorMsg('Please enter your 10-digit mobile number.');
      return;
    }

    setSending(true);
    try {
      await sendEnquiry({
        propertyId: p.id || p._id,
        propertyTitle: p.title || '',
        propertyImage: p.image || (p.images && p.images[0]) || '',
        name: leadName.trim() || 'Interested Buyer',
        phone: leadPhone.trim(),
        mobile: leadPhone.trim(),
        email: leadEmail.trim() || '',
        message: `Callback request for ${p.title} (${p.location || p.city})`,
        isCallback: true,
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /* Share functionality */
  const shareUrl = window.location.href;
  const shareTitle = `${p.title} in ${p.location || p.city} | Probridge`;

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch { }
    } else {
      navigator.clipboard?.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    gmail: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent('Check out this property on Probridge: ' + shareUrl)}`,
  };

  /* Parse user highlights safely without mock data */
  const userHighlights = p.propertyHighlights
    ? p.propertyHighlights.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
    : [];

  /* Nearby places from admin dashboard — dynamic */
  const nearbyDefault = [
    { name: `${p.locality || p.city || 'City'} Railway Station`, category: 'Transit', distance: '500 m', icon: 'train' },
    { name: `${p.locality || 'City'} Multi-Speciality Hospital`, category: 'Healthcare', distance: '1.3 km', icon: 'hospital' },
    { name: `${p.locality || 'City'} World School`, category: 'Education', distance: '1.6 km', icon: 'school' },
    { name: `${p.locality || p.city || 'City'} Club`, category: 'Others', distance: '1.7 km', icon: 'map-pin' },
    { name: 'Airport', category: 'Airport', distance: '37.1 km', icon: 'plane' },
    { name: 'Home Needs & Market', category: 'Mall / Market', distance: '1.9 km', icon: 'shopping-bag' },
  ];
  const nearbyData = (p.nearbyPlaces && p.nearbyPlaces.length > 0) ? p.nearbyPlaces : nearbyDefault;

  /* Legacy neighbourhood lookup for "All Places" tab filters */
  const CAT_MAP = { 'transit': 'commute', 'commute': 'commute', 'healthcare': 'healthcare', 'education': 'education', 'mall / market': 'shopping', 'shopping': 'shopping', 'food': 'food', 'food & dining': 'food' };
  const neighbourhoodPoints = { commute: [], healthcare: [], education: [], shopping: [], food: [] };
  nearbyData.forEach(pl => {
    const bucket = CAT_MAP[(pl.category || '').toLowerCase()] || null;
    if (bucket) neighbourhoodPoints[bucket].push({ name: pl.name, dist: pl.distance });
  });

  /* Dynamic FAQs using real user values only */
  const faqs = [
    {
      q: `What is the possession date for ${p.title}?`,
      a: p.possessionDate
        ? `The scheduled possession date is ${p.possessionDate} (Status: ${p.propertyStatus || 'Under Construction'}).`
        : `The current construction status is ${p.propertyStatus || 'Ready to Move'}. Contact the seller for exact key handover timelines.`,
    },
    {
      q: `What is the RERA registration number for ${p.title}?`,
      a: p.reraNumber
        ? `The official RERA registration number for this property is ${p.reraNumber}.`
        : `RERA compliance documents and statutory approvals are available directly upon requesting seller details.`,
    },
    {
      q: `What is the expected price and maintenance charges?`,
      a: `The expected price is ${p.price}${p.maintenanceCharge ? ` with maintenance charges of ₹${p.maintenanceCharge}/month` : ''}.`,
    },
    {
      q: `What configuration and area details apply to ${p.title}?`,
      a: isPlot
        ? `This is a ${p.plotType || 'Plot'} property with plot size ${p.plotSize === 'Other' ? p.customPlotSize : p.plotSize || 'standard'}${p.roadFacing ? ` and road facing ${p.roadFacing}` : ''}.`
        : `This unit is a ${p.bedroom || 'residential'} configuration with ${p.bathroom || '2'} bathrooms, ${p.balconies || '1'} balconies${p.doorFacing ? `, facing ${p.doorFacing}` : ''}${p.furnishingStatus ? `, and is ${p.furnishingStatus}` : ''}.`,
    },
    {
      q: `What amenities are available at ${p.title}?`,
      a: p.amenities?.length > 0
        ? `Verified amenities include: ${p.amenities.join(', ')}.`
        : `Please enquire directly with the seller for the full community amenities breakdown.`,
    },
    {
      q: `Where is ${p.title} located?`,
      a: `The property is located at ${[p.address, p.locality, p.city, p.postalCode].filter(Boolean).join(', ')}.`,
    },
  ];

  const embedVideoUrl = getYouTubeEmbedUrl(p.propertyVideo);

  return (
    <div className={styles.pageWrap}>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY TOP DUAL NAVBAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`${styles.stickyHeaderWrapper} ${scrolled ? styles.stickyHeaderScrolled : ''}`}>
        <div className={styles.topBackNav}>
          <div className={styles.topBackInner}>
            {/* Left Nav Group: Logo & Breadcrumb (Logo on Left Corner, No Back button) */}
            <div className={styles.leftNavGroup}>
              <Link to="/" className={styles.brandLink} title="ProBridge Home">
                <Logo size="sm" showTagline={false} theme="forest" />
              </Link>

              <span className={styles.navDivider}>|</span>

              {/* Dynamic Left: Breadcrumb at top, Compact Property Summary when scrolled */}
              {scrolled ? (
                <div className={styles.scrolledPropertyPill}>
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt={p.title}
                      className={styles.scrolledThumb}
                    />
                  )}
                  <div className={styles.scrolledMeta}>
                    <span className={styles.scrolledTitle} title={p.title}>
                      {p.title}
                    </span>
                    <span className={styles.scrolledLocation}>
                      <MapPin size={11} />
                      <span>{p.locality || p.city || p.location}</span>
                    </span>
                  </div>
                  {p.price && (
                    <span className={styles.scrolledPrice}>{p.price}</span>
                  )}
                </div>
              ) : (
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                  <Link to="/">Home</Link>
                  <ChevronRight size={13} className={styles.breadSep} />
                  {p.city && (
                    <>
                      <Link to={`/search?city=${encodeURIComponent(p.city)}`}>Properties in {p.city}</Link>
                      <ChevronRight size={13} className={styles.breadSep} />
                    </>
                  )}
                  {p.locality && (
                    <>
                      <Link to={`/search?city=${encodeURIComponent(p.city)}&q=${encodeURIComponent(p.locality)}`}>{p.locality}</Link>
                      <ChevronRight size={13} className={styles.breadSep} />
                    </>
                  )}
                  <span className={styles.currentCrumb} title={p.title}>{p.title}</span>
                </nav>
              )}
            </div>

            {/* Right Nav Group: Action Buttons Only */}
            <div className={styles.rightNavGroup}>
              {/* Quick Save button */}
              <button
                type="button"
                className={`${styles.navActionBtn} ${saved ? styles.navActionBtnSaved : ''}`}
                onClick={handleSave}
                title={saved ? 'Shortlisted' : 'Save Property'}
              >
                <Heart size={15} fill={saved ? '#E11D48' : 'none'} color={saved ? '#E11D48' : '#475569'} />
                <span className={styles.navActionLabel}>{saved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Quick Share button */}
              <button
                type="button"
                className={styles.navActionBtn}
                onClick={handleShareClick}
                title="Share Property"
              >
                <Share2 size={15} color="#475569" />
                <span className={styles.navActionLabel}>Share</span>
              </button>

              {/* Contact Seller CTA */}
              <button
                type="button"
                className={styles.navContactBtn}
                onClick={scrollToContact}
                title="Contact Seller / Schedule My Callback"
              >
                <Phone size={14} />
                <span>Contact Seller</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Tabs Navbar matching video */}
        <nav className={styles.subTabsNav}>
          <div className={styles.tabList}>
            {TABS.map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {TabIcon && <TabIcon size={14} className={styles.tabIcon} />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN 2-COLUMN CONTAINER (CONTENT ON LEFT, CALLBACK ON RIGHT)
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`container ${styles.mainContent}`}>
        <div className={styles.twoColLayout}>

          {/* ══════════════════════════════════════════════════════════════
              LEFT / CENTER MAIN COLUMN
          ══════════════════════════════════════════════════════════════ */}
          <main className={styles.rightMainCol}>

            {/* 1. HERO IMAGE WITH FULLVIEW, HEART & PILL BUTTONS */}
            <div className={styles.heroImageSection}>
              <div className={styles.imageCard}>
                <img
                  src={images[activeImg] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80'}
                  alt=""
                  className={styles.heroImgBlurBg}
                  aria-hidden="true"
                />
                <img
                  src={images[activeImg] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80'}
                  alt={p.title}
                  className={styles.heroImg}
                  onClick={() => setLightboxOpen(true)}
                  style={{ cursor: 'pointer' }}
                />

                {/* Top actions: Save Heart & Share */}
                <div className={styles.imageTopActions}>
                  <button
                    type="button"
                    className={`${styles.imageHeartBtn} ${saved ? styles.imageHeartBtnActive : ''}`}
                    onClick={handleSave}
                    title={saved ? 'Saved' : 'Save Property'}
                  >
                    <Heart size={16} fill={saved ? '#FFFFFF' : 'none'} color="#FFFFFF" />
                  </button>
                  <button
                    type="button"
                    className={styles.imageShareBtn}
                    onClick={handleShareClick}
                    title="Share Property"
                  >
                    <Share2 size={16} color="#0F172A" />
                  </button>
                </div>

                {/* Bottom floating pills matching video */}
                <div className={styles.imageBottomPills}>
                  <button type="button" className={styles.pillBtn} onClick={() => handleTabClick('gallery')}>
                    <Camera size={14} />
                    <span>{images.length || 1} Photos</span>
                  </button>
                  {p.propertyVideo && (
                    <button
                      type="button"
                      className={styles.pillBtn}
                      onClick={() => {
                        handleTabClick('gallery');
                        setGalleryTab('videos');
                      }}
                    >
                      <Video size={14} />
                      <span>Video Tour</span>
                    </button>
                  )}
                  <button type="button" className={styles.pillBtn} onClick={() => handleTabClick('neighbourhood')}>
                    <Compass size={14} />
                    <span>Map</span>
                  </button>
                  <button
                    type="button"
                    className={styles.pillBtn}
                    onClick={() => {
                      const waText = encodeURIComponent(`Hi ProBridge, I would like to receive the official brochure and price sheet for ${p.title} (${shareUrl})`);
                      window.open(`https://wa.me/919176663200?text=${waText}`, '_blank', 'noopener,noreferrer');
                    }}
                    title="Request Brochure on WhatsApp"
                  >
                    <MessageCircle size={14} />
                    <span>Brochure</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. TITLE, PRICE & KEY HEADER CARD */}
            <div className={styles.propertyHeaderCard}>
              <div className={styles.headerLeft}>
                <h1 className={styles.propertyTitle}>{p.title}</h1>
                <div className={styles.propertyLoc}>
                  <MapPin size={16} className={styles.locPin} />
                  <span>{[p.address, p.locality, p.city].filter(Boolean).join(', ') || p.location}</span>
                </div>
                <div className={styles.propertyMeta}>
                  {p.builderName && (
                    <>
                      <span>By: <strong>{p.builderName}</strong></span>
                      <span className={styles.metaDot}>•</span>
                    </>
                  )}
                  <span>Status: <strong className={styles.statusVal}>{p.propertyStatus || p.possessionDate || 'Available'}</strong></span>
                  {p.possessionDate && (
                    <>
                      <span className={styles.metaDot}>•</span>
                      <span>Possession: <strong>{p.possessionDate}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.headerRight}>
                <div className={styles.priceRow}>
                  <span className={styles.priceValue}>{p.price}</span>
                </div>
                {p.maintenanceCharge && (
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    + Maint. ₹{p.maintenanceCharge}/mo
                  </div>
                )}
                {p.reraNumber && (
                  <div className={styles.reraBadge}>
                    <ShieldCheck size={14} color="#15803d" />
                    <span>RERA: {p.reraNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                SECTION 1: OVERVIEW & SPECIFICATIONS
            ══════════════════════════════════════════════════════════ */}
            <section id="overview" className={styles.card}>
              <h2 className={styles.cardTitle}>Project Specifications</h2>

              <div className={styles.overviewGrid}>
                <div className={styles.overviewItem}>
                  <span className={styles.itemLabel}>Property Type</span>
                  <span className={styles.itemValue}>{p.propertyType || 'Residential'}</span>
                </div>

                <div className={styles.overviewItem}>
                  <span className={styles.itemLabel}>Building Type</span>
                  <span className={styles.itemValue}>{p.buildingType || 'Residential'}</span>
                </div>

                {isPlot ? (
                  <>
                    <div className={styles.overviewItem}>
                      <span className={styles.itemLabel}>Plot Type</span>
                      <span className={styles.itemValue}>{p.plotType || 'Independent Plot'}</span>
                    </div>
                    <div className={styles.overviewItem}>
                      <span className={styles.itemLabel}>Plot Size</span>
                      <span className={styles.itemValue}>{p.plotSize === 'Other' ? p.customPlotSize : p.plotSize || 'Standard'}</span>
                    </div>
                    {p.roadFacing && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Road Facing</span>
                        <span className={styles.itemValue}>{p.roadFacing}</span>
                      </div>
                    )}
                    {p.plotDimension && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Dimensions</span>
                        <span className={styles.itemValue}>{p.plotDimension} {p.plotDimensionUnit || 'Sq. Feet'}</span>
                      </div>
                    )}
                    {p.plotAge && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Plot Age</span>
                        <span className={styles.itemValue}>{p.plotAge}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {p.bedroom && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Bedrooms</span>
                        <span className={styles.itemValue}>{p.bedroom}</span>
                      </div>
                    )}
                    {p.bathroom && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Bathrooms</span>
                        <span className={styles.itemValue}>{p.bathroom} Baths</span>
                      </div>
                    )}
                    {p.balconies && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Balconies</span>
                        <span className={styles.itemValue}>{p.balconies}</span>
                      </div>
                    )}
                    {p.doorFacing && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Door Facing</span>
                        <span className={styles.itemValue}>{p.doorFacing}</span>
                      </div>
                    )}
                    {p.furnishingStatus && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Furnishing Status</span>
                        <span className={styles.itemValue}>{p.furnishingStatus}</span>
                      </div>
                    )}
                    {p.selectedFloor && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Property Floor</span>
                        <span className={styles.itemValue}>Floor {p.selectedFloor} {p.totalFloors ? `of ${p.totalFloors}` : ''}</span>
                      </div>
                    )}
                    {p.totalProjectFloors && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Total Project Floors</span>
                        <span className={styles.itemValue}>{p.totalProjectFloors} Floors</span>
                      </div>
                    )}
                    {p.propertyAge && (
                      <div className={styles.overviewItem}>
                        <span className={styles.itemLabel}>Property Age</span>
                        <span className={styles.itemValue}>{p.propertyAge} Years</span>
                      </div>
                    )}
                  </>
                )}

                {p.possessionDate && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Possession Date</span>
                    <span className={styles.itemValue}>{p.possessionDate}</span>
                  </div>
                )}
                {p.reraNumber && (
                  <div className={styles.overviewItemWide}>
                    <span className={styles.itemLabel}>RERA Registration Number</span>
                    <span className={styles.itemValue}>{p.reraNumber}</span>
                  </div>
                )}

                {/* ─€─€ New Project Specification Fields ─€─€ */}
                {p.superBuiltUpArea && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Super Built-Up Area</span>
                    <span className={styles.itemValue}>{p.superBuiltUpArea} sq.ft.</span>
                  </div>
                )}
                {p.carpetArea && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Carpet Area</span>
                    <span className={styles.itemValue}>{p.carpetArea} sq.ft.</span>
                  </div>
                )}
                {p.projectArea && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Project Area</span>
                    <span className={styles.itemValue}>{p.projectArea}</span>
                  </div>
                )}
                {p.totalUnits && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Total Units</span>
                    <span className={styles.itemValue}>{p.totalUnits} Units</span>
                  </div>
                )}
                {p.towers && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Towers / Blocks</span>
                    <span className={styles.itemValue}>{p.towers} Towers</span>
                  </div>
                )}
                {p.noOfLifts && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Lifts per Tower</span>
                    <span className={styles.itemValue}>{p.noOfLifts} Lifts</span>
                  </div>
                )}
                {p.parkingType && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Parking</span>
                    <span className={styles.itemValue}>{p.parkingType}</span>
                  </div>
                )}
                {p.pricePerSqft && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Price Per Sq.ft.</span>
                    <span className={styles.itemValue}>₹{Number(p.pricePerSqft).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {p.launchDate && (
                  <div className={styles.overviewItem}>
                    <span className={styles.itemLabel}>Launch Date</span>
                    <span className={styles.itemValue}>{p.launchDate}</span>
                  </div>
                )}
                {p.approvals && (
                  <div className={styles.overviewItemWide}>
                    <span className={styles.itemLabel}>Approvals</span>
                    <span className={styles.itemValue}>{p.approvals}</span>
                  </div>
                )}
              </div>

              {/* User Highlights (only if provided by user) */}
              {userHighlights.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    Property Highlights
                  </h3>
                  <ul className={styles.highlightsList}>
                    {userHighlights.map((h, i) => (
                      <li key={i} className={styles.highlightItem}>
                        <span className={styles.bulletPoint}>•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* User Description */}
              {p.description && (
                <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    About {p.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                    {p.description}
                  </p>
                </div>
              )}

              {/* Available BHK Unit Configurations (Column-wise 1, 2, 3 BHK) */}
              {!isPlot && activeUnitConfigs.length > 0 && (
                <div className={styles.unitConfigSection}>
                  <div className={styles.unitConfigSectionHeader}>
                    <div>
                      <h3 className={styles.unitConfigTitle}>Available BHK Unit Configurations</h3>
                      <p className={styles.unitConfigSubtitle}>
                        Compare sizes, prices, and possession timeline across available {activeUnitConfigs.map(c => c.bhk).filter(Boolean).join(', ')} options.
                      </p>
                    </div>

                    {activeUnitConfigs.length > 1 && (
                      <div className={styles.bhkViewToggleWrap}>
                        <button
                          type="button"
                          className={`${styles.bhkViewToggleBtn} ${bhkViewMode === 'columns' ? styles.bhkViewToggleActive : ''}`}
                          onClick={() => setBhkViewMode('columns')}
                        >
                          Columns View
                        </button>
                        <button
                          type="button"
                          className={`${styles.bhkViewToggleBtn} ${bhkViewMode === 'table' ? styles.bhkViewToggleActive : ''}`}
                          onClick={() => setBhkViewMode('table')}
                        >
                          Comparison Table
                        </button>
                      </div>
                    )}
                  </div>

                  {bhkViewMode === 'columns' ? (
                    <div className={styles.unitConfigColumnsScrollWrap}>
                      <div
                        className={styles.unitConfigGrid}
                        style={{
                          gridTemplateColumns: activeUnitConfigs.length <= 3
                            ? `repeat(${activeUnitConfigs.length}, minmax(260px, 1fr))`
                            : `repeat(${activeUnitConfigs.length}, 280px)`
                        }}
                      >
                        {activeUnitConfigs.map((cfg, idx) => (
                          <div key={idx} className={styles.unitConfigCard}>
                            <div className={styles.unitConfigHeader}>
                              <span className={styles.unitConfigBhkBadge}>{cfg.bhk}</span>
                              <span className={styles.unitConfigStatus}>{cfg.status || 'Ready to Move'}</span>
                            </div>

                            <div className={styles.unitConfigPriceRow}>
                              <span className={styles.unitConfigPrice}>{cfg.price || 'Price on Request'}</span>
                              <span className={styles.unitConfigPriceNote}>Estimated Price</span>
                            </div>

                            <div className={styles.unitConfigSpecsList}>
                              <div className={styles.unitConfigSpecRow}>
                                <span className={styles.unitSpecLabel}>Super Built-up Area</span>
                                <strong className={styles.unitSpecValue}>{cfg.area || p.superBuiltUpArea || 'Custom Size'}</strong>
                              </div>
                              {cfg.carpetArea && (
                                <div className={styles.unitConfigSpecRow}>
                                  <span className={styles.unitSpecLabel}>Carpet Area</span>
                                  <strong className={styles.unitSpecValue}>{cfg.carpetArea}</strong>
                                </div>
                              )}
                              <div className={styles.unitConfigSpecRow}>
                                <span className={styles.unitSpecLabel}>Bathrooms</span>
                                <strong className={styles.unitSpecValue}>{cfg.bathrooms || '2'} Baths</strong>
                              </div>
                              <div className={styles.unitConfigSpecRow}>
                                <span className={styles.unitSpecLabel}>Balconies</span>
                                <strong className={styles.unitSpecValue}>{cfg.balconies !== undefined && cfg.balconies !== '' ? `${cfg.balconies} Balcony` : '1 Balcony'}</strong>
                              </div>
                              <div className={styles.unitConfigSpecRow}>
                                <span className={styles.unitSpecLabel}>Possession</span>
                                <strong className={styles.unitSpecValue}>{cfg.status || p.possessionDate || 'Immediate'}</strong>
                              </div>
                            </div>

                            <div className={styles.unitConfigActionRow}>
                              <button
                                type="button"
                                className={styles.unitConfigCtaBtn} onClick={() => handleOpenEnquiry(cfg.bhk ? `${cfg.bhk}${cfg.price ? ` (${cfg.price})` : ''}` : 'Unit Configuration', 'enquire')}
                              >
                                Enquire for {cfg.bhk}
                              </button>
                              <a
                                href={`https://wa.me/919176663200?text=${encodeURIComponent(`Hi, I would like to know more about the ${cfg.bhk} unit (${cfg.price || ''}) at ${p.title} (${shareUrl})`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.unitConfigWaBtn}
                                title={`WhatsApp enquiry for ${cfg.bhk}`}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.unitConfigTableWrapper}>
                      <table className={styles.unitConfigTable}>
                        <thead>
                          <tr>
                            <th>Specification</th>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <th key={idx} className={styles.tableBhkColHeader}>
                                <div className={styles.tableBhkBadge}>{cfg.bhk}</div>
                                <div className={styles.tableBhkStatus}>{cfg.status || 'Available'}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={styles.tableSpecLabel}>Estimated Price</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx} className={styles.tablePriceCell}>
                                <strong>{cfg.price || 'Price on Request'}</strong>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Super Built-Up Area</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>{cfg.area || p.superBuiltUpArea || 'Custom Size'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Carpet Area</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>{cfg.carpetArea || '—'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Bathrooms</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>{cfg.bathrooms || '2'} Baths</td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Balconies</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>{cfg.balconies !== undefined && cfg.balconies !== '' ? `${cfg.balconies} Balcony` : '1 Balcony'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Possession</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>{cfg.status || p.possessionDate || 'Immediate'}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className={styles.tableSpecLabel}>Action</td>
                            {activeUnitConfigs.map((cfg, idx) => (
                              <td key={idx}>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    className={styles.tableEnquireBtn} onClick={() => handleOpenEnquiry(cfg.bhk ? `${cfg.bhk}${cfg.price ? ` (${cfg.price})` : ''}` : 'Unit Configuration', 'enquire')}
                                  >
                                    Enquire
                                  </button>
                                  <a
                                    href={`https://wa.me/919176663200?text=${encodeURIComponent(`Hi, I would like to know more about the ${cfg.bhk} unit (${cfg.price || ''}) at ${p.title} (${shareUrl})`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.unitConfigWaBtn}
                                    title={`WhatsApp enquiry for ${cfg.bhk}`}
                                  >
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                  </a>
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 2: FLOOR PLANS
            ══════════════════════════════════════════════════════════ */}
            <section id="floor-plans" className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>{p.title} Floor Plans</h2>
                <div className={styles.unitPills}>
                  <span className={styles.unitPillActive}>
                    {isPlot ? (p.plotSize === 'Other' ? (p.customPlotSize || 'Custom Size') : (p.plotSize || 'Plot Area')) : (p.bedroom || 'Standard Unit')}
                  </span>
                </div>
              </div>

              <div className={styles.floorPlanBox}>
                <div className={styles.floorPlanTopRow}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
                      {p.price}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      {isPlot ? `${p.plotType || 'Plot'} • ${p.plotSize === 'Other' ? (p.customPlotSize || 'Custom Size') : (p.plotSize || '')}` : `${p.bedroom || 'Residential'} • ${p.doorFacing ? p.doorFacing + ' Facing' : 'Verified Plan'}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.enquireSmallBtn} onClick={() => handleOpenEnquiry(`Floor Plan (${isPlot ? (p.plotSize || 'Plot') : (p.bedroom || 'Residential')})`, 'enquire')}
                  >
                    Enquire Now
                  </button>
                </div>

                {floorPlans.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {floorPlans.map((planUrl, idx) => (
                      <div key={idx} className={styles.blueprintCard} onClick={() => setLightboxOpen(true)}>
                        <img src={planUrl} alt={`Floor plan ${idx + 1}`} className={styles.blueprintImg} />
                        <div className={styles.blueprintMeta}>
                          <span>Floor Plan {idx + 1}</span>
                          <span style={{ fontSize: '11px', color: '#134E3A' }}>Click to zoom</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.blueprintPlaceholder}>
                    <Layers size={40} color="#94a3b8" />
                    <p style={{ margin: '10px 0 4px', fontWeight: 600, color: '#334155' }}>
                      {p.bedroom || 'Standard'} Layout Architecture
                    </p>
                    <small style={{ color: '#64748b' }}>
                      Detailed blueprint available upon enquiry with the property seller.
                    </small>
                  </div>
                )}

                {/* Specs row underneath floor plan matching video */}
                {!isPlot && (
                  <div className={styles.floorRoomRow}>
                    {p.bedroom && <div>🛏️ {p.bedroom}</div>}
                    {p.bathroom && <div>🚿 {p.bathroom} Bathrooms</div>}
                    {p.balconies && <div>🪟 {p.balconies} Balconies</div>}
                    {p.doorFacing && <div>🧭 {p.doorFacing} Facing</div>}
                  </div>
                )}
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 3: AMENITIES
            ══════════════════════════════════════════════════════════ */}
            <section id="amenities" className={styles.card}>
              <h2 className={styles.cardTitle}>{p.title} Amenities</h2>
              {p.amenities && p.amenities.length > 0 ? (
                <div className={styles.amenitiesGrid}>
                  {p.amenities.map((amenity, idx) => (
                    <div key={idx} className={styles.amenityCard}>
                      <div className={styles.amenityIconCircle}>
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className={styles.amenityText}>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Contact the seller for the complete list of verified community amenities.
                </p>
              )}
              {p.amenitiesText && (
                <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#334155' }}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>Amenities Overview & Features:</strong>
                  {p.amenitiesText}
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 4: GALLERY & WALKTHROUGH VIDEO
            ══════════════════════════════════════════════════════════ */}
            <section id="gallery" className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>{p.title} Gallery</h2>
                <div className={styles.gallerySubTabs}>
                  <button
                    type="button"
                    className={`${styles.gallerySubBtn} ${galleryTab === 'photos' ? styles.gallerySubBtnActive : ''}`}
                    onClick={() => setGalleryTab('photos')}
                  >
                    Photos ({images.length})
                  </button>
                  {p.propertyVideo && (
                    <button
                      type="button"
                      className={`${styles.gallerySubBtn} ${galleryTab === 'videos' ? styles.gallerySubBtnActive : ''}`}
                      onClick={() => setGalleryTab('videos')}
                    >
                      Video Tour
                    </button>
                  )}
                  {floorPlans.length > 0 && (
                    <button
                      type="button"
                      className={`${styles.gallerySubBtn} ${galleryTab === 'plans' ? styles.gallerySubBtnActive : ''}`}
                      onClick={() => setGalleryTab('plans')}
                    >
                      Floor Plans ({floorPlans.length})
                    </button>
                  )}
                </div>
              </div>

              {galleryTab === 'photos' && (
                <div className={styles.galleryGrid}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={styles.galleryItem}
                      onClick={() => {
                        setActiveImg(idx);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={img} alt={`Property view ${idx + 1}`} />
                      {idx === 0 && <span className={styles.coverBadge}>Cover</span>}
                      {idx === 2 && images.length > 3 && (
                        <div className={styles.moreOverlay}>
                          +{images.length - 3} More Photos
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {galleryTab === 'videos' && p.propertyVideo && (
                <div className={styles.videoPlayerWrap}>
                  {embedVideoUrl ? (
                    <iframe
                      src={embedVideoUrl}
                      title="Property Walkthrough Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className={styles.videoIframe}
                    />
                  ) : (
                    <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
                      <Film size={40} color="#134E3A" />
                      <h4 style={{ margin: '12px 0 6px' }}>Virtual Video Walkthrough Available</h4>
                      <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '14px' }}>
                        Click below to view the external video tour in a new tab.
                      </p>
                      <a
                        href={p.propertyVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactSellerBtn}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '10px 20px', width: 'auto' }}
                      >
                        Watch Video <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {galleryTab === 'plans' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {floorPlans.map((planUrl, idx) => (
                    <div key={idx} className={styles.blueprintCard}>
                      <img src={planUrl} alt={`Floor plan ${idx + 1}`} className={styles.blueprintImg} />
                      <div className={styles.blueprintMeta}>
                        <span>Floor Plan {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 5: INTERACTIVE HOME LOAN CALCULATOR
            ══════════════════════════════════════════════════════════ */}
            <section id="home-loan" className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Home Loan EMI Calculator</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f766e', background: '#ccfbf1', padding: '4px 10px', borderRadius: '6px' }}>
                  IOB Bank Reference Standard
                </span>
              </div>

              <div className={styles.calculatorLayout}>
                {/* Sliders & Inputs on Left */}
                <div className={styles.calcInputs}>
                  {/* 1. Loan Amount */}
                  <div className={styles.calcField}>
                    <div className={styles.calcLabelRow}>
                      <label>Loan Amount (₹)</label>
                      <div className={styles.calcInputWrap} style={{ maxWidth: '180px' }}>
                        <span className={styles.calcInputPrefix}>₹</span>
                        <input
                          type="number"
                          min={100000}
                          max={100000000}
                          step={50000}
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                          className={styles.calcInputField}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={Math.max(loanAmount * 1.5, 30000000)}
                      step={50000}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className={styles.calcSlider}
                    />
                    <div className={styles.sliderMinMax}>
                      <span>₹ 1 Lac</span>
                      <span>₹ 10 Cr</span>
                    </div>
                  </div>

                  {/* 2. Loan Tenure with Years / Months Toggle */}
                  <div className={styles.calcField}>
                    <div className={styles.calcLabelRow}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label>Tenure</label>
                        <div className={styles.tenureToggleGroup}>
                          <button
                            type="button"
                            className={`${styles.tenureToggleBtn} ${tenureUnit === 'years' ? styles.tenureToggleBtnActive : ''}`}
                            onClick={() => {
                              if (tenureUnit !== 'years') {
                                setTenureUnit('years');
                                setLoanTenure(Math.min(30, Math.max(1, Math.round(loanTenure / 12))));
                              }
                            }}
                          >
                            Yr
                          </button>
                          <button
                            type="button"
                            className={`${styles.tenureToggleBtn} ${tenureUnit === 'months' ? styles.tenureToggleBtnActive : ''}`}
                            onClick={() => {
                              if (tenureUnit !== 'months') {
                                setTenureUnit('months');
                                setLoanTenure(Math.min(360, Math.max(12, loanTenure * 12)));
                              }
                            }}
                          >
                            Mo
                          </button>
                        </div>
                      </div>

                      <div className={styles.calcInputWrap} style={{ maxWidth: '140px' }}>
                        <input
                          type="number"
                          min={tenureUnit === 'years' ? 1 : 12}
                          max={tenureUnit === 'years' ? 30 : 360}
                          step={1}
                          value={loanTenure}
                          onChange={(e) => setLoanTenure(Math.max(1, Number(e.target.value)))}
                          className={styles.calcInputField}
                        />
                        <span className={styles.calcInputPrefix} style={{ borderRight: 'none', borderLeft: '1px solid #e2e8f0' }}>
                          {tenureUnit === 'years' ? 'Yrs' : 'Mos'}
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={tenureUnit === 'years' ? 1 : 12}
                      max={tenureUnit === 'years' ? 30 : 360}
                      step={1}
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className={styles.calcSlider}
                    />
                    <div className={styles.sliderMinMax}>
                      <span>{tenureUnit === 'years' ? '1 Year' : '12 Months'}</span>
                      <span>{tenureUnit === 'years' ? '30 Years' : '360 Months'}</span>
                    </div>
                  </div>

                  {/* 3. Interest Rate */}
                  <div className={styles.calcField}>
                    <div className={styles.calcLabelRow}>
                      <label>Interest Rate (% P.A.)</label>
                      <div className={styles.calcInputWrap} style={{ maxWidth: '140px' }}>
                        <input
                          type="number"
                          min={5.0}
                          max={15.0}
                          step={0.05}
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className={styles.calcInputField}
                        />
                        <span className={styles.calcInputPrefix} style={{ borderRight: 'none', borderLeft: '1px solid #e2e8f0' }}>
                          %
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={15.0}
                      step={0.05}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className={styles.calcSlider}
                    />
                    <div className={styles.sliderMinMax}>
                      <span>5.0 %</span>
                      <span>15.0 %</span>
                    </div>
                  </div>
                </div>

                {/* Donut Chart & EMI Display on Right matching IOB style */}
                <div className={styles.calcResultBox}>
                  {/* Hero Highlight EMI Amount */}
                  <div className={styles.iobEmiHero}>
                    <div className={styles.iobEmiLabel}>Monthly Loan EMI</div>
                    <div className={styles.iobEmiAmount}>{formatIndianCurrency(loanStats.emi)}</div>
                    <div className={styles.iobEmiTenureText}>
                      for {tenureUnit === 'years' ? `${loanTenure} Years` : `${loanTenure} Months`} @ {interestRate}% p.a.
                    </div>
                  </div>

                  {/* SVG Donut Ring Chart */}
                  <div className={styles.donutWrap}>
                    <svg width="130" height="130" viewBox="0 0 130 130">
                      {/* Interest Ratio Ring (Amber) */}
                      <circle
                        cx="65"
                        cy="65"
                        r="52"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="14"
                      />
                      {/* Principal Ratio Ring (Teal) */}
                      <circle
                        cx="65"
                        cy="65"
                        r="52"
                        fill="transparent"
                        stroke="#0f766e"
                        strokeWidth="14"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={(2 * Math.PI * 52) * (1 - loanStats.principalRatio / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 65 65)"
                      />
                    </svg>
                    <div className={styles.donutCenterText}>
                      <span className={styles.emiFigure} style={{ fontSize: '14px', color: '#0f766e' }}>
                        {Math.round(loanStats.principalRatio)}%
                      </span>
                      <span className={styles.emiSub} style={{ fontSize: '10px' }}>Principal</span>
                    </div>
                  </div>

                  {/* Breakdown Legend */}
                  <div className={styles.calcLegend}>
                    <div className={styles.legendRow}>
                      <span className={styles.dotGreen} style={{ background: '#0f766e' }} />
                      <span>Principal Amount</span>
                      <strong>{formatIndianCurrency(loanAmount)}</strong>
                    </div>
                    <div className={styles.legendRow}>
                      <span className={styles.dotRed} style={{ background: '#f59e0b' }} />
                      <span>Total Interest</span>
                      <strong>{formatIndianCurrency(loanStats.totalInterest)}</strong>
                    </div>
                    <div className={`${styles.legendRow} ${styles.legendTotal}`}>
                      <span>Total Amount Payable</span>
                      <strong>{formatIndianCurrency(loanStats.totalPayment)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.applyLoanBtn}
                    onClick={() => {
                      const sidebar = document.getElementById('callbackCard');
                      if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Apply Home Loan
                  </button>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 6: PAYMENT PLANS
            ══════════════════════════════════════════════════════════ */}
            <section id="payment-plans" className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>Payment Plans</h2>
                <button
                  type="button"
                  className={styles.viewPlanBtn}
                  onClick={() => setShowPaymentModal(true)}
                >
                  View Detailed Payment Plan
                </button>
              </div>

              {((p.paymentPlanImages && p.paymentPlanImages.length > 0) || p.paymentPlanImage) && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {(p.paymentPlanImages && p.paymentPlanImages.length > 0 ? p.paymentPlanImages : [p.paymentPlanImage]).filter(Boolean).map((planImg, idx) => (
                      <a
                        key={idx}
                        href={planImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', textDecoration: 'none' }}
                      >
                        <img
                          src={planImg}
                          alt={`Payment Plan ${idx + 1}`}
                          style={{ width: '100%', height: '220px', objectFit: 'contain', background: '#ffffff', display: 'block' }}
                        />
                        <div style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 600, color: '#2563eb', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                          Payment Plan Blueprint #{idx + 1} (Click to open full view)
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Plan Text breakdown entered in Admin Dashboard */}
              {p.paymentPlanText && (
                <div className={styles.paymentPlanTextCard}>
                  <div className={styles.paymentPlanTextHeader}>
                    <FileText size={18} color="#0D5F4E" />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Payment Milestones & Breakdown</span>
                  </div>
                  <div className={styles.paymentPlanTextBody}>
                    {p.paymentPlanText}
                  </div>
                </div>
              )}

              <div className={styles.paymentScheduleGrid}>
                <div className={styles.milestoneCard}>
                  <div className={styles.milestonePercent}>10%</div>
                  <div className={styles.milestoneLabel}>Booking Amount</div>
                  <div className={styles.milestoneDesc}>At the time of booking / reservation</div>
                </div>
                <div className={styles.milestoneCard}>
                  <div className={styles.milestonePercent}>20%</div>
                  <div className={styles.milestoneLabel}>Foundation Stage</div>
                  <div className={styles.milestoneDesc}>On execution of sale agreement & groundwork</div>
                </div>
                <div className={styles.milestoneCard}>
                  <div className={styles.milestonePercent}>40%</div>
                  <div className={styles.milestoneLabel}>Superstructure</div>
                  <div className={styles.milestoneDesc}>Linked to floor slab casting completions</div>
                </div>
                <div className={styles.milestoneCard}>
                  <div className={styles.milestonePercent}>20%</div>
                  <div className={styles.milestoneLabel}>Finishing & Interior</div>
                  <div className={styles.milestoneDesc}>Plastering, electrical, plumbing & tiling</div>
                </div>
                <div className={styles.milestoneCard}>
                  <div className={styles.milestonePercent}>10%</div>
                  <div className={styles.milestoneLabel}>Key Handover</div>
                  <div className={styles.milestoneDesc}>On intimation of possession & registration</div>
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 7: GETTING AROUND & LOCATION (RADAR & ESSENTIALS)
            ══════════════════════════════════════════════════════════ */}
            <section id="neighbourhood" className={styles.card}>
              <div className={styles.locSectionHeader}>
                <div className={styles.locTabNav}>
                  <button
                    type="button"
                    className={`${styles.locTabBtn} ${locationTab === 'radar' ? styles.locTabBtnActive : ''}`}
                    onClick={() => setLocationTab('radar')}
                  >
                    <Navigation size={15} />
                    <span>Getting around</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.locTabBtn} ${locationTab === 'map' ? styles.locTabBtnActive : ''}`}
                    onClick={() => setLocationTab('map')}
                  >
                    <Map size={15} />
                    <span>Map</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.locTabBtn} ${locationTab === 'places' ? styles.locTabBtnActive : ''}`}
                    onClick={() => setLocationTab('places')}>
                    <List size={15} />
                    <span>All places</span>
                  </button>
                </div>
              </div>

              {locationTab === 'radar' && (
                <div className={styles.gettingAroundGrid}>
                  {/* LEFT: Radar Box with Concentric Circles & Connected Spokes */}
                  <div className={styles.radarBox}>
                    <div className={styles.radarStage}>
                      {/* Concentric Dashed Rings */}
                      <div className={`${styles.radarRing} ${styles.ringOuter}`}>
                        <span className={styles.ringPill}>within 40 km</span>
                      </div>
                      <div className={`${styles.radarRing} ${styles.ringMiddle}`}>
                        <span className={styles.ringPill}>within 2 km</span>
                      </div>
                      <div className={`${styles.radarRing} ${styles.ringInner}`}>
                        <span className={styles.ringPill}>within 1.5 km</span>
                      </div>

                      {/* Center Property Pin */}
                      <div className={styles.radarCenterPin}>
                        <div className={styles.radarPinIconWrap}>
                          <MapPin size={22} fill="#2563EB" color="#FFFFFF" />
                        </div>
                        <span className={styles.radarPinTitleBadge} title={p.title}>
                          {p.title}
                        </span>
                      </div>

                      {/* Radial Spoke Connecting Lines & Dots */}
                      <svg className={styles.radarSvgOverlay} viewBox="0 0 520 380" preserveAspectRatio="none">
                        {/* Top Left spoke (Hospital) */}
                        <line x1="140" y1="50" x2="200" y2="120" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="200" cy="120" r="4" fill="#2563EB" />

                        {/* Top Right spoke (Transit) */}
                        <line x1="380" y1="50" x2="320" y2="120" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="320" cy="120" r="4" fill="#2563EB" />

                        {/* Mid Left spoke (Club/Others) */}
                        <line x1="135" y1="190" x2="195" y2="190" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="195" cy="190" r="4" fill="#2563EB" />

                        {/* Mid Right spoke (School) */}
                        <line x1="385" y1="190" x2="325" y2="190" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="325" cy="190" r="4" fill="#2563EB" />

                        {/* Bottom Left spoke (Airport) */}
                        <line x1="140" y1="330" x2="185" y2="280" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="185" cy="280" r="4" fill="#2563EB" />

                        {/* Bottom Right spoke (Mall) */}
                        <line x1="380" y1="330" x2="335" y2="280" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />
                        <circle cx="335" cy="280" r="4" fill="#2563EB" />
                      </svg>

                      {/* 6 Floating Cards matching layout */}
                      {/* Dynamic radar cards from admin nearbyPlaces data */}
                      {nearbyData.map((place, idx) => {
                        const CARD_POSITIONS = ['cardTopLeft', 'cardTopRight', 'cardMidLeft', 'cardMidRight', 'cardBottomLeft', 'cardBottomRight'];
                        const NEARBY_ICON_MAP = {
                          'train': Train, 'transit': Train,
                          'hospital': Plus, 'healthcare': Activity,
                          'school': GraduationCap, 'education': GraduationCap,
                          'shopping-bag': ShoppingBag, 'mall': ShoppingBag,
                          'plane': Plane, 'airport': Plane,
                          'map-pin': MapPin, 'others': MapPin,
                          'utensils': MapPin, 'bank': MapPin, 'leaf': MapPin, 'temple': MapPin,
                        };
                        const IconComp = NEARBY_ICON_MAP[place.icon] || NEARBY_ICON_MAP[place.category?.toLowerCase()] || MapPin;
                        return (
                          <div key={idx} className={`${styles.radarCard} ${styles[CARD_POSITIONS[idx] || 'cardTopLeft']}`}>
                            <div className={styles.radarCardIconBox}><IconComp size={16} /></div>
                            <div className={styles.radarCardInfo}>
                              <span className={styles.radarCardName}>{place.name}</span>
                              <span className={styles.radarCardCat}>{place.category}</span>
                              <span className={styles.radarCardDist}>{place.distance}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.radarBottomNote}>
                      <Info size={13} color="#2563EB" />
                      <span>Approximate distances from the project</span>
                    </div>
                  </div>

                  {/* RIGHT: Nearby essentials Box matching screenshot */}
                  <div className={styles.essentialsBox}>
                    <h3 className={styles.essentialsTitle}>Nearby essentials</h3>
                    <p className={styles.essentialsSub}>Key places recorded around the project</p>

                    <div className={styles.essentialList}>
                      {nearbyData.map((place, idx) => {
                        const NEARBY_ICON_MAP_E = {
                          'train': Train, 'transit': Train,
                          'hospital': Plus, 'healthcare': Activity,
                          'school': GraduationCap, 'education': GraduationCap,
                          'shopping-bag': ShoppingBag, 'mall': ShoppingBag,
                          'plane': Plane, 'airport': Plane,
                          'map-pin': MapPin, 'others': MapPin,
                          'utensils': MapPin, 'bank': MapPin, 'leaf': MapPin, 'temple': MapPin,
                        };
                        const EIconComp = NEARBY_ICON_MAP_E[place.icon] || NEARBY_ICON_MAP_E[place.category?.toLowerCase()] || MapPin;
                        return (
                          <div key={idx} className={styles.essentialRow}>
                            <div className={styles.essentialLeft}>
                              <div className={styles.essentialAvatar}><EIconComp size={17} /></div>
                              <div className={styles.essentialMeta}>
                                <span className={styles.essentialName}>{place.name}</span>
                                <span className={styles.essentialCat}>{place.category}</span>
                              </div>
                            </div>
                            <span className={styles.essentialDist}>{place.distance}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.essentialsFootnote}>
                      As recorded by the builder &mdash; approximate.
                    </div>

                    <button
                      type="button"
                      className={styles.viewNearbyBtn}
                      onClick={() => setLocationTab('places')}
                    >
                      <span>View all nearby places</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {locationTab === 'map' && (
                <div className={styles.cleanMapCard}>
                  <div className={styles.cleanMapHeader}>
                    <div className={styles.cleanMapMeta}>
                      <MapPin size={16} color="#134E3A" />
                      <span>{[p.address, p.landmark, p.locality, p.city, p.pincode].filter(Boolean).join(', ') || p.location}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.address, p.landmark, p.locality, p.city, p.state, p.pincode].filter(Boolean).join(', ') || [p.title, p.locality, p.city].filter(Boolean).join(', '))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cleanMapBtn}
                      title="Open address in Google Maps"
                    >
                      <Map size={14} />
                      <span>Open Map</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className={styles.cleanMapContainer}>
                    <iframe
                      title="Property Location Map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${(p.lng || 80.27) - 0.015}%2C${(p.lat || 13.08) - 0.015}%2C${(p.lng || 80.27) + 0.015}%2C${(p.lat || 13.08) + 0.015}&layer=mapnik`}
                      className={styles.cleanMapIframe}
                      loading="lazy"
                    />

                    {/* Rounded Area Marker (Approximate Location Circle - No Pin) */}
                    <div className={styles.mapRoundedAreaWrap}>
                      <div className={styles.mapAreaCircle}>
                        <div className={styles.mapAreaInnerGlow} />
                        <div className={styles.mapAreaBadge}>
                          <span className={styles.mapAreaBadgeDot} />
                          <span>{p.locality || p.city || 'Neighborhood Area'}</span>
                        </div>
                      </div>
                      <div className={styles.mapAreaNote}>
                        Approximate location for privacy
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {locationTab === 'places' && (
                <div className={styles.allPlacesContainer}>
                  <div className={styles.allPlacesFilterRow}>
                    {[
                      { id: 'all', label: 'All Places' },
                      { id: 'commute', label: 'Commute' },
                      { id: 'healthcare', label: 'Healthcare' },
                      { id: 'education', label: 'Education' },
                      { id: 'shopping', label: 'Shopping' },
                      { id: 'food', label: 'Food & Dining' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.allPlacesFilterBtn} ${allPlacesCategory === cat.id ? styles.allPlacesFilterBtnActive : ''}`}
                        onClick={() => setAllPlacesCategory(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.allPlacesGrid}>
                    {((allPlacesCategory === 'all'
                      ? Object.values(neighbourhoodPoints).flat()
                      : (neighbourhoodPoints[allPlacesCategory] || [])
                    ) || []).map((pt, i) => (
                      <div key={i} className={styles.allPlaceCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className={styles.essentialAvatar} style={{ width: 32, height: 32 }}>
                            <MapPin size={15} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{pt.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>Verified Landmark</div>
                          </div>
                        </div>
                        <span className={styles.essentialDist}>{pt.dist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            


                        {/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
                SECTION: BROCHURE (WHATSAPP REQUEST)
            ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */}
            <section id="brochure" className={styles.card}>
              <h2 className={styles.cardTitle}>Project Brochure</h2>
              <div className={styles.brochureCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className={styles.pdfIconWrap} style={{ background: '#ecfdf5', color: '#0D5F4E' }}>
                    <FileText size={26} color="#0D5F4E" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                      {p.title} Official Brochure
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Request the verified master plan, unit layouts, exact pricing & payment schedule sent directly to your WhatsApp.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const waText = encodeURIComponent(`Hi ProBridge, I would like to receive the official brochure and price sheet for ${p.title} (${shareUrl})`);
                      window.open(`https://wa.me/919176663200?text=${waText}`, '_blank', 'noopener,noreferrer');
                    }}
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 22px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.25)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Request Brochure on WhatsApp</span>
                  </button>
                  <span style={{ fontSize: '12.5px', color: '#0D5F4E', fontWeight: 600 }}>
                    ⚡ Instant delivery via WhatsApp
                  </span>
                </div>
              </div>
            </section>

{/* ══════════════════════════════════════════════════════════
                SECTION 9: ABOUT BUILDER / SELLER
            ══════════════════════════════════════════════════════════ */}
            <section id="builder" className={styles.card}>
              <h2 className={styles.cardTitle}>About {p.builderName || p.ownerName || 'Developer'}</h2>
              <div
                className={styles.builderProfileCard}
                onClick={() => {
                  if (p.builderName) {
                    navigate(`/search?builder=${encodeURIComponent(p.builderName)}`);
                  }
                }}
                style={{ cursor: p.builderName ? 'pointer' : 'default' }}
                title={p.builderName ? `View all properties by ${p.builderName}` : ''}
              >
                {matchedBuilder?.logo ? (
                  <div className={styles.builderLogoWrapper}>
                    <img
                      src={matchedBuilder.logo}
                      alt={p.builderName}
                      className={styles.builderOfficialLogo}
                    />
                  </div>
                ) : (
                  <div className={styles.builderAvatar}>
                    {(p.builderName || p.ownerName || 'P')[0]?.toUpperCase()}
                  </div>
                )}
                <div className={styles.builderInfo}>
                  <div className={styles.builderNameBadgeRow}>
                    <h3 className={styles.builderName}>{p.builderName || p.ownerName || 'Property Developer'}</h3>
                    <span className={styles.builderRole}>
                      {p.builderName ? 'Verified Developer' : (p.userType ? `${p.userType} Listed` : 'Verified Partner')}
                    </span>
                  </div>

                  {matchedBuilder && (
                    <div className={styles.builderMetaChips}>
                      {matchedBuilder.experience && (
                        <span className={styles.builderChip}>🏆 {matchedBuilder.experience} Exp</span>
                      )}
                      {matchedBuilder.established && (
                        <span className={styles.builderChip}>📅 Est. {matchedBuilder.established}</span>
                      )}
                      {matchedBuilder.headquarters && (
                        <span className={styles.builderChip}>📍 HQ: {matchedBuilder.headquarters}</span>
                      )}
                    </div>
                  )}

                  {p.phone && (
                    <p className={styles.builderPhone}>
                      <Phone size={14} /> {p.phone}
                    </p>
                  )}

                  {p.builderName && (
                    <div className={styles.builderExploreLink}>
                      <span>Explore all properties by <strong>{p.builderName}</strong></span>
                      <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </div>

              {/* More projects by Builder / in this City */}
              {similarProperties.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                    More Projects in {p.city || 'this area'}
                  </h3>
                  <div className={styles.moreProjectsGrid}>
                    {similarProperties.slice(0, 3).map((item) => (
                      <div key={item.id || item._id} className={styles.miniProjectCard}>
                        <div className={styles.miniCardImgWrap}>
                          <img
                            src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'}
                            alt={item.title}
                          />
                          <span className={styles.miniCardBadge}>
                            {item.propertyStatus || 'Available'}
                          </span>
                        </div>
                        <div className={styles.miniCardBody}>
                          <h4 className={styles.miniCardTitle}>{item.title}</h4>
                          <p className={styles.miniCardLoc}>
                            <MapPin size={13} /> {item.locality ? `${item.locality}, ` : ''}{item.city}
                          </p>
                          <div className={styles.miniCardPriceRow}>
                            <strong>{item.price}</strong>
                            <Link
                              to={`/property/${item.id || item._id}`}
                              className={styles.viewDetailsBtn}
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ══════════════════════════════════════════════════════════
                SECTION 10: FREQUENTLY ASKED QUESTIONS (FAQ)
            ══════════════════════════════════════════════════════════ */}
            <section id="faq" className={styles.card}>
              <h2 className={styles.cardTitle}>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {faqs.map((f, idx) => (
                  <div key={idx} className={styles.faqItem}>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    >
                      <span>{f.q}</span>
                      {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openFaq === idx && (
                      <div className={styles.faqAnswer}>
                        <p>{f.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: FIXED STICKY "Want to know more?" CALLBACK CARD
          ══════════════════════════════════════════════════════════════ */}
          <aside className={styles.leftSidebarCol}>
            <div id="callbackCard" className={styles.interestCard}>
              <h3 className={styles.interestTitle}>
                We'll reach out only at your convenience, without disturbing you.
                Want to know more about<br />
                <span style={{ color: '#134E3A' }}>{p.title}</span>?
              </h3>
              <p className={styles.interestSub}>Request an Assured Callback</p>

              {submitted ? (
                <div className={styles.successBox}>
                  <CheckCircle size={36} color="#134E3A" />
                  <h4>Callback Requested!</h4>
                  <p>Our property representative will get in touch with you shortly.</p>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => setSubmitted(false)}
                  >
                    Request Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className={styles.callbackForm}>
                  {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="Enter your name"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="tel"
                      className={styles.textInput}
                      placeholder="Enter your mobile number"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className={styles.contactSellerBtn}
                  >
                    {sending ? 'Requesting...' : 'Schedule My Callback'}
                  </button>

                  <div className={styles.guaranteeList}>
                    <div className={styles.guaranteeRow}>
                      <Check size={14} color="#16a34a" />
                      <span>Assured Callback in Your Free time</span>
                    </div>
                    <div className={styles.guaranteeRow}>
                      <Check size={14} color="#16a34a" />
                      <span>Authorised Channel Partner for this project</span>
                    </div>
                  </div>

                  {/* WhatsApp Helpdesk */}
                  <a
                    href={`https://wa.me/919176663200?text=${encodeURIComponent(`Hi, I would like to know more about ${p.title} (${shareUrl})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappHelpdeskBtn}
                  >
                    <MessageCircle size={18} color="#16a34a" />
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block' }}>+91 9176663200</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Contact Helpdesk (Chat only)</span>
                    </div>
                  </a>
                </form>
              )}
            </div>

            {/* SHARE THIS PROPERTY */}
            <div className={styles.shareCard}>
              <h4 className={styles.shareTitle}>Share This Property</h4>
              <div className={styles.socialRow}>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.socialWhatsapp}`} title="Share on WhatsApp">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.socialTwitter}`} title="Share on X">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.socialFacebook}`} title="Share on Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.socialLinkedin}`} title="Share on LinkedIn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href={shareLinks.gmail} className={`${styles.socialBtn} ${styles.socialGmail}`} title="Share via Email">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" /></svg>
                </a>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAILED PAYMENT PLAN MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Detailed Milestone Payment Plan</h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {p.paymentPlanText && (
                <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-line', fontSize: '14px', lineHeight: 1.7, color: '#1e293b' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#0f172a' }}>Milestone Terms & Schedule:</strong>
                  {p.paymentPlanText}
                </div>
              )}
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>Milestone Stage</th>
                    <th>Percent</th>
                    <th>Payable Amount (Approx)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>On Booking Token</td><td>10%</td><td>{formatIndianCurrency(loanStats.totalPayment * 0.1)}</td></tr>
                  <tr><td>Sale Agreement & Foundation</td><td>20%</td><td>{formatIndianCurrency(loanStats.totalPayment * 0.2)}</td></tr>
                  <tr><td>Structure & Slabs Completion</td><td>40%</td><td>{formatIndianCurrency(loanStats.totalPayment * 0.4)}</td></tr>
                  <tr><td>Flooring & Internal Finishing</td><td>20%</td><td>{formatIndianCurrency(loanStats.totalPayment * 0.2)}</td></tr>
                  <tr><td>Possession & Key Handover</td><td>10%</td><td>{formatIndianCurrency(loanStats.totalPayment * 0.1)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          LIGHTBOX MODAL FOR FULLSCREEN PHOTO VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {lightboxOpen && images[activeImg] && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.lightboxCloseBtn} onClick={() => setLightboxOpen(false)}>
              <X size={20} />
            </button>
            <img src={images[activeImg]} alt={p.title} className={styles.lightboxImg} />
            <div className={styles.lightboxBottomStrip}>
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`${styles.lightboxThumb} ${i === activeImg ? styles.lightboxThumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

    
      {/* ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ 
          ENQUIRY / CALLBACK MODAL
      ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═  */}
      {enquiryModalOpen && (
        <EnquiryModal
          property={p}
          initialMode={enquiryModalMode}
          unitTitle={enquiryUnitTitle}
          initialName={leadName}
          initialPhone={leadPhone}
          initialEmail={leadEmail}
          onClose={() => setEnquiryModalOpen(false)}
          onSuccess={(formData) => {
            if (formData.name) setLeadName(formData.name);
            if (formData.phone) setLeadPhone(formData.phone);
          }}
        />
      )}

    </div>
  );
}

