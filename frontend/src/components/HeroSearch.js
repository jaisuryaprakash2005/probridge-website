import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Building, ChevronDown, Check,
  IndianRupee, Layers, X, Compass
} from 'lucide-react';
import { getLocalitiesByCity, CITY_NAMES } from '../data/localities';
import { getTopBanners } from '../services/api';
import styles from './HeroSearch.module.css';

/* ─€─€ Popular cities for quick selection ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
const POPULAR_CITIES = [
  'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi', 'Kolkata', 'Ahmedabad',
];

/* ─€─€ Filter Options matching PropTiger layout ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
const BUDGET_OPTIONS = [
  { label: 'Any Budget',       min: null,     max: null },
  { label: 'Under ₹50 Lac',    min: null,     max: 5000000 },
  { label: '₹50 Lac - ₹1 Cr',  min: 5000000,  max: 10000000 },
  { label: '₹1 Cr - ₹2 Cr',    min: 10000000, max: 20000000 },
  { label: '₹2 Cr - ₹5 Cr',    min: 20000000, max: 50000000 },
  { label: '₹5 Cr+',           min: 50000000, max: null },
];

const PROPERTY_TYPES = [
  { label: 'All Property Types', value: '' },
  { label: 'Apartments / Flats', value: 'Apartment' },
  { label: 'Independent Houses & Villas', value: 'Independent' },
  { label: 'Residential Plots',  value: 'Plot' },
  { label: 'Commercial Spaces',  value: 'Commercial' },
];

const PROJECT_STATUSES = [
  { label: 'All Project Status', value: '' },
  { label: 'Ready to Move',      value: 'Ready to Move' },
  { label: 'Under Construction', value: 'Under Construction' },
  { label: 'New Launch',         value: 'New Launch' },
];

/* ─€─€ High-resolution fallback panoramic banners ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
const DEFAULT_BANNERS = [
  {
    _id: 'default-chennai-sunset',
    title: 'Find Your Perfect Home With ProBridge',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1920&auto=format&fit=crop&q=85',
    aspectRatio: 2.79, // Exact matching ratio from user PropTiger screenshot (1024x367)
  },
  {
    _id: 'default-luxury-towers',
    title: 'Discover Premium Residential Communities',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=85',
    aspectRatio: 3.6,
  },
  {
    _id: 'default-skyline-villas',
    title: 'Signature Skyline Villas & Residences',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&auto=format&fit=crop&q=85',
    aspectRatio: 3.2,
  },
];

export default function HeroSearch() {
  const navigate = useNavigate();

  // Top banner background state
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerRatios, setBannerRatios] = useState({});

  // Search form state
  const [selectedCity,    setSelectedCity]    = useState('Chennai');
  const [cityInput,       setCityInput]       = useState('Chennai');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedBudget,  setSelectedBudget]  = useState(BUDGET_OPTIONS[0]);
  const [selectedType,    setSelectedType]    = useState(PROPERTY_TYPES[0]);
  const [selectedStatus,  setSelectedStatus]  = useState(PROJECT_STATUSES[0]);

  // Dropdown open states
  const [citySuggestOpen, setCitySuggestOpen] = useState(false);
  const [locSuggestOpen,  setLocSuggestOpen]  = useState(false);
  const [budgetOpen,      setBudgetOpen]      = useState(false);
  const [typeOpen,        setTypeOpen]        = useState(false);
  const [statusOpen,      setStatusOpen]      = useState(false);

  const cityRef   = useRef(null);
  const searchRef = useRef(null);
  const budgetRef = useRef(null);
  const typeRef   = useRef(null);
  const statusRef = useRef(null);

  // Load top banners uploaded by admin
  useEffect(() => {
    let isMounted = true;
    getTopBanners()
      .then(({ data }) => {
        if (!isMounted) return;
        const list = data?.results || [];
        const activeList = list.filter((b) => b.isActive !== false && (b.image || b.topBanner));
        if (activeList.length > 0) {
          setBanners(
            activeList.map((b) => ({
              ...b,
              image: b.image || b.topBanner,
              aspectRatio: b.aspectRatio || 4.0,
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Measure natural aspect ratio of loaded banner image
  const handleImageLoad = (idx, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const calculated = Number((naturalWidth / naturalHeight).toFixed(2));
      setBannerRatios((prev) => ({ ...prev, [idx]: calculated }));
    }
  };

  // Compute active banner's aspect ratio
  const activeBanner = banners[currentBannerIndex] || banners[0];
  const activeRatio =
    activeBanner?.aspectRatio ||
    bannerRatios[currentBannerIndex] ||
    (currentBannerIndex === 0 ? 2.79 : 4.0);

  // Automatic appear & disappear crossfade rotation (NO Zooming)
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000); // 6s per banner rotation

    return () => clearInterval(interval);
  }, [banners.length]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCitySuggestOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setLocSuggestOpen(false);
      if (budgetRef.current && !budgetRef.current.contains(e.target)) setBudgetOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Filtered cities based on what user is typing */
  const matchingCities = useMemo(() => {
    if (!cityInput.trim()) return POPULAR_CITIES;
    const lower = cityInput.toLowerCase();
    return CITY_NAMES.filter((c) => c.toLowerCase().includes(lower));
  }, [cityInput]);

  /* Localities for currently confirmed city */
  const activeCityLocalities = useMemo(() => {
    return getLocalitiesByCity(selectedCity || 'Chennai');
  }, [selectedCity]);

  /* Matching localities based on search query */
  const matchingLocalities = useMemo(() => {
    if (!searchQuery.trim()) return activeCityLocalities;
    const lower = searchQuery.toLowerCase();
    return activeCityLocalities.filter((l) => l.toLowerCase().includes(lower));
  }, [activeCityLocalities, searchQuery]);

  /* Popular quick localities for current confirmed city */
  const topLocalitiesForCity = useMemo(() => {
    return activeCityLocalities.slice(0, 8);
  }, [activeCityLocalities]);

  const handlePickCity = (c) => {
    setSelectedCity(c);
    setCityInput(c);
    setCitySuggestOpen(false);
    setSearchQuery('');
    setTimeout(() => setLocSuggestOpen(true), 100);
  };

  /* Search handler */
  const handleSearch = (e) => {
    e?.preventDefault();
    setLocSuggestOpen(false);
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedBudget.min) params.set('minPrice', selectedBudget.min);
    if (selectedBudget.max) params.set('maxPrice', selectedBudget.max);
    if (selectedType.value) params.set('propertyType', selectedType.value);
    if (selectedStatus.value) params.set('possession', selectedStatus.value);
    navigate('/search?' + params.toString());
  };

  const handleBannerClick = (b) => {
    if (b.link) {
      if (b.link.startsWith('http')) window.open(b.link, '_blank');
      else navigate(b.link);
    } else if (b.property) {
      navigate(`/property/${b.property._id || b.property}`);
    }
  };

  return (
    <div
      className={styles.heroSection}
      style={{
        '--banner-aspect-ratio': `${activeRatio}`,
      }}
    >
      {/* ─€─€ 1. Top Banner Container (Dynamically Set to Admin Uploaded Ratio, NO Zooming) ─€─€ */}
      <div className={styles.bannerContainer}>
        {banners.map((b, idx) => (
          <div
            key={b._id || idx}
            className={`${styles.bgSlide} ${idx === currentBannerIndex ? styles.bgSlideActive : ''}`}
            onClick={() => handleBannerClick(b)}
            style={{ cursor: b.link || b.property ? 'pointer' : 'default' }}
            title={b.title || ''}
          >
            <img
              src={b.image}
              alt={b.title || "ProBridge"}
              className={styles.bannerImg}
              onLoad={(e) => handleImageLoad(idx, e)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_BANNERS[0].image;
              }}
            />
          </div>
        ))}

        {/* Soft bottom dark gradient wash for crisp white title readability */}
        <div className={styles.bannerOverlay} />

        {/* ─€─€ 2. White Centered Heading (PropTiger Style) ─€─€ */}
        <div className={styles.titleWrap}>
          <h1 className={styles.heroHeading}>
            Find Your Perfect Home With ProBridge
          </h1>
        </div>
      </div>

      {/* ─€─€ 3. Search Bar Card (PropTiger Layout: Overlapping Bottom Edge) ─€─€ */}
      <div className={styles.searchCardWrapper}>
        <form className={styles.searchCard} onSubmit={handleSearch}>

          {/* Top Row: Search Input + City + Search Button */}
          <div className={styles.searchTopRow}>

            {/* City Selector Pill */}
            <div className={styles.cityPicker} ref={cityRef}>
              <button
                type="button"
                className={styles.cityPickerBtn}
                onClick={() => {
                  setCitySuggestOpen(!citySuggestOpen);
                  setLocSuggestOpen(false);
                }}
              >
                <MapPin size={15} className={styles.cityPinIcon} />
                <span className={styles.cityName}>{selectedCity}</span>
                <ChevronDown size={14} className={styles.chevronIcon} />
              </button>

              {citySuggestOpen && (
                <div className={styles.cityDropdown}>
                  <div className={styles.dropdownHeader}>Select City</div>
                  <input
                    type="text"
                    className={styles.citySearchInput}
                    placeholder="Type to search city..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    autoFocus
                  />
                  <ul className={styles.dropList}>
                    {matchingCities.map((c) => (
                      <li
                        key={c}
                        className={`${styles.dropOption} ${selectedCity === c ? styles.dropOptionActive : ''}`}
                        onClick={() => handlePickCity(c)}
                      >
                        <MapPin size={13} />
                        <span>{c}</span>
                        {selectedCity === c && <Check size={14} className={styles.checkIcon} />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.verticalDivider} />

            {/* Main Search Input: Locality / Projects / Developer with Locality Dropdown based on City */}
            <div className={styles.searchFieldWrap} ref={searchRef}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Search locality in ${selectedCity} (e.g. ${topLocalitiesForCity[0] || 'Adyar'}, ${topLocalitiesForCity[1] || 'Anna Nagar'})...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLocSuggestOpen(true);
                }}
                onClick={() => setLocSuggestOpen(true)}
                onFocus={() => setLocSuggestOpen(true)}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => {
                    setSearchQuery('');
                    setLocSuggestOpen(true);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              {/* Locality Autocomplete Dropdown based on Selected City */}
              {locSuggestOpen && (
                <div className={styles.locDropdown}>
                  <div className={styles.locDropHeader}>
                    <Compass size={13} color="#0D5F4E" />
                    <span>Popular Localities in <strong>{selectedCity}</strong> ({activeCityLocalities.length})</span>
                  </div>

                  {/* Quick pills inside dropdown */}
                  {topLocalitiesForCity.length > 0 && (
                    <div className={styles.locQuickPills}>
                      {topLocalitiesForCity.slice(0, 6).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className={styles.locQuickChip}
                          onMouseDown={() => {
                            setSearchQuery(loc);
                            setLocSuggestOpen(false);
                          }}
                        >
                          + {loc}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* List of matching localities */}
                  <ul className={styles.locList}>
                    {matchingLocalities.length > 0 ? (
                      matchingLocalities.slice(0, 25).map((loc) => (
                        <li
                          key={loc}
                          className={`${styles.dropOption} ${searchQuery.toLowerCase() === loc.toLowerCase() ? styles.dropOptionActive : ''}`}
                          onMouseDown={() => {
                            setSearchQuery(loc);
                            setLocSuggestOpen(false);
                          }}
                        >
                          <MapPin size={13} className={styles.cityPinIcon} />
                          <span className={styles.locItemText}>{loc}</span>
                          <span className={styles.locCityTag}>{selectedCity}</span>
                          {searchQuery.toLowerCase() === loc.toLowerCase() && (
                            <Check size={14} className={styles.checkIcon} />
                          )}
                        </li>
                      ))
                    ) : (
                      <li className={styles.dropEmpty}>
                        No locality matching "{searchQuery}" in {selectedCity}. Press Search to explore all properties.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Dark Navy / Forest Search Button */}
            <button type="submit" className={styles.searchSubmitBtn}>
              <span>Search</span>
            </button>
          </div>

          {/* Bottom Row: Filter Pills (Budget, Property Type, Project Status) */}
          <div className={styles.filterPillsRow}>

            {/* 1. Budget Pill */}
            <div className={styles.pillContainer} ref={budgetRef}>
              <button
                type="button"
                className={`${styles.filterPill} ${selectedBudget.min || selectedBudget.max ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setBudgetOpen(!budgetOpen);
                  setLocSuggestOpen(false);
                  setTypeOpen(false);
                  setStatusOpen(false);
                }}
              >
                <IndianRupee size={13} className={styles.pillIcon} />
                <span>{selectedBudget.label === 'Any Budget' ? 'Budget' : selectedBudget.label}</span>
                <ChevronDown size={13} className={styles.pillChevron} />
              </button>

              {budgetOpen && (
                <div className={styles.popoverMenu}>
                  <div className={styles.popoverHeader}>Select Budget Range</div>
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`${styles.popoverItem} ${selectedBudget.label === opt.label ? styles.popoverItemActive : ''}`}
                      onClick={() => {
                        setSelectedBudget(opt);
                        setBudgetOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                      {selectedBudget.label === opt.label && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Property Type Pill */}
            <div className={styles.pillContainer} ref={typeRef}>
              <button
                type="button"
                className={`${styles.filterPill} ${selectedType.value ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setTypeOpen(!typeOpen);
                  setLocSuggestOpen(false);
                  setBudgetOpen(false);
                  setStatusOpen(false);
                }}
              >
                <Building size={13} className={styles.pillIcon} />
                <span>{selectedType.value ? selectedType.label.split(' / ')[0] : 'Property Type'}</span>
                <ChevronDown size={13} className={styles.pillChevron} />
              </button>

              {typeOpen && (
                <div className={styles.popoverMenu}>
                  <div className={styles.popoverHeader}>Select Property Type</div>
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt.label}
                      type="button"
                      className={`${styles.popoverItem} ${selectedType.value === pt.value ? styles.popoverItemActive : ''}`}
                      onClick={() => {
                        setSelectedType(pt);
                        setTypeOpen(false);
                      }}
                    >
                      <span>{pt.label}</span>
                      {selectedType.value === pt.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Project Status Pill */}
            <div className={styles.pillContainer} ref={statusRef}>
              <button
                type="button"
                className={`${styles.filterPill} ${selectedStatus.value ? styles.filterPillActive : ''}`}
                onClick={() => {
                  setStatusOpen(!statusOpen);
                  setLocSuggestOpen(false);
                  setBudgetOpen(false);
                  setTypeOpen(false);
                }}
              >
                <Layers size={13} className={styles.pillIcon} />
                <span>{selectedStatus.value || 'Project Status'}</span>
                <ChevronDown size={13} className={styles.pillChevron} />
              </button>

              {statusOpen && (
                <div className={styles.popoverMenu}>
                  <div className={styles.popoverHeader}>Select Construction Status</div>
                  {PROJECT_STATUSES.map((ps) => (
                    <button
                      key={ps.label}
                      type="button"
                      className={`${styles.popoverItem} ${selectedStatus.value === ps.value ? styles.popoverItemActive : ''}`}
                      onClick={() => {
                        setSelectedStatus(ps);
                        setStatusOpen(false);
                      }}
                    >
                      <span>{ps.label}</span>
                      {selectedStatus.value === ps.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick reset if any filter is active */}
            {(selectedBudget.min || selectedBudget.max || selectedType.value || selectedStatus.value) && (
              <button
                type="button"
                className={styles.resetFilterBtn}
                onClick={() => {
                  setSelectedBudget(BUDGET_OPTIONS[0]);
                  setSelectedType(PROPERTY_TYPES[0]);
                  setSelectedStatus(PROJECT_STATUSES[0]);
                }}
              >
                Reset Filters
              </button>
            )}

          </div>
        </form>

        {/* Quick Localities in Selected City */}
        {topLocalitiesForCity.length > 0 && (
          <div className={styles.quickLocRow}>
            <span className={styles.quickLocLabel}>Trending in {selectedCity}:</span>
            {topLocalitiesForCity.map((loc) => (
              <button
                key={loc}
                type="button"
                className={styles.quickLocChip}
                onClick={() => {
                  setSearchQuery(loc);
                  const params = new URLSearchParams();
                  if (selectedCity) params.set('city', selectedCity);
                  params.set('q', loc);
                  navigate('/search?' + params.toString());
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


