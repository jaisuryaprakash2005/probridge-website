import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import EnquiryModal from '../components/EnquiryModal';
import { getProperties, getSaved } from '../services/api';
import { useSaved } from '../context/SavedContext';
import { useAuth } from '../context/AuthContext';
import { getLocalitiesByCity } from '../data/localities';
import {
  SlidersHorizontal, ChevronRight,
  X, Heart, MapPin, Camera, Share2,
  CheckCircle, Home, Building2, Landmark, TreePine, Store, Loader2,
  Filter } from 'lucide-react';
import styles from './SearchResultsPage.module.css';

/* ─€─€ Parse formatted price into pure number ─€─€─€─€─€─€─€─€─€─€─€─€─€ */
export function parseNumericPrice(p) {
  if (p.priceRaw && Number(p.priceRaw) > 0) return Number(p.priceRaw);
  if (!p.price) return 0;
  const str = String(p.price).replace(/,/g, '');
  const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  if (/cr/i.test(str)) return Math.round(num * 10000000);
  if (/lac|lakh/i.test(str)) return Math.round(num * 100000);
  if (/k/i.test(str)) return Math.round(num * 1000);
  return Math.round(num);
}

/* ─€─€ Parse square feet / area into pure number ─€─€─€─€─€─€─€─€─€ */
export function parseNumericSqft(p) {
  if (!p) return 0;
  const candidates = [
    p.area,
    p.plotSize,
    p.plotDimension,
    p.customPlotSize,
    p.builtUpArea,
    p.superBuiltUpArea,
    p.size,
  ];
  if (Array.isArray(p.specs)) {
    const areaSpec = p.specs.find(s => /area|size|sqft|dimension|plot/i.test(s.label || ''));
    if (areaSpec?.value) candidates.push(areaSpec.value);
  }
  for (const c of candidates) {
    if (typeof c === 'number' && c > 0) return c;
    if (typeof c === 'string') {
      const num = parseFloat(c.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return 0;
}

/* ─€─€ Property type icon cards ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
const PROP_TYPE_CARDS = [
  { id: 'apartment',    label: 'Apartment',         Icon: Building2  },
  { id: 'villa',        label: 'Villa',              Icon: Home       },
  { id: 'plot',         label: 'Plot',               Icon: TreePine   },
  { id: 'independent',  label: 'Independent House',  Icon: Landmark   },
  { id: 'commercial',   label: 'Commercial',         Icon: Store      },
  { id: 'pg',           label: 'PG / Hostel',        Icon: Home       },
];

const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5+'];

const AVAILABILITY_OPTIONS = [
  'Ready to Move', 'Under Construction', 'New Launch', 'Upcoming',
];

const STATUS_OPTIONS = [
  'New', 'Resale',
];

const AMENITY_OPTIONS = [
  'Parking', 'Swimming Pool', 'Gym', 'Lift', 'Security', 'Garden',
  'Clubhouse', 'Power Backup',
];

/* ─€─€ Expandable section ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordion}>
      <button className={styles.accordionHeader} onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <ChevronRight size={16} className={`${styles.accordionIcon} ${open ? styles.accordionIconOpen : ''}`} />
      </button>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}

const DEFAULT_PROPERTY_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';

export function getPropertyImageUrl(p) {
  if (!p) return DEFAULT_PROPERTY_IMG;
  const candidate = p.image || p.images?.[0] || p.photos?.[0] || '';
  if (!candidate || typeof candidate !== 'string') return DEFAULT_PROPERTY_IMG;
  const trimmed = candidate.trim();
  if (trimmed.startsWith('file://') || trimmed.startsWith('ph://') || trimmed.length < 5) {
    return DEFAULT_PROPERTY_IMG;
  }
  return trimmed;
}

/* ─€─€ Horizontal Property List Card (Premium Style) ─€─€─€─€ */
function PropertyListCard({ property: p, onEnquire }) {
  const { user } = useAuth();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(p.id || p._id);
  const [imgSrc, setImgSrc] = useState(() => getPropertyImageUrl(p));

  useEffect(() => {
    setImgSrc(getPropertyImageUrl(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.image, p.images]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!user) { alert('Please log in to save properties.'); return; }
    toggle(p);
  };

  // Derive display area
  const displayArea = p.plotSize === 'Other'
    ? (p.customPlotSize || p.area || 'Custom Size')
    : (p.plotSize || p.area);

  // Build BHK config list (supports comma-separated bedroom values or single)
  const bedroomList = p.bedroom
    ? p.bedroom.split(',').map(b => b.trim()).filter(Boolean)
    : [];

  // Amenities to display (up to 5)
  const amenityList = Array.isArray(p.amenities)
    ? p.amenities.slice(0, 5)
    : typeof p.amenities === 'string'
      ? p.amenities.split(',').map(a => a.trim()).filter(Boolean).slice(0, 5)
      : [];

  // Image count
  const imgCount = Array.isArray(p.images) ? p.images.length : (p.image ? 1 : 0);

  // Status chip
  const availStatus = p.availability || '';
  const isUnderConstruction = /under.construction|uc/i.test(availStatus);
  const isReadyToMove = /ready/i.test(availStatus);

  return (
    <Link to={`/property/${p.id || p._id}`} className={styles.listCard}>
      {/* ─€─€ Image Column ─€─€ */}
      <div className={styles.listCardImg}>
        <img
          src={imgSrc}
          alt={p.title || 'Property'}
          className={styles.listImg}
          onError={() => setImgSrc(DEFAULT_PROPERTY_IMG)}
          loading="lazy"
        />
        {/* Exclusive badge top-left */}
        <div className={styles.listBadgeRow}>
          {(p.badges || []).slice(0, 1).map((b, i) => (
            <span key={i} className={styles.listBadge}>{b.label}</span>
          ))}
          {!(p.badges?.length) && <span className={styles.listBadge}>Exclusive</span>}
        </div>
        {/* Heart + Share icons top-right */}
        <div className={styles.listImgActions}>
          <button
            type="button"
            className={`${styles.listImgBtn} ${saved ? styles.listImgBtnSaved : ''}`}
            onClick={handleSave}
            aria-label="Save"
          >
            <Heart size={14} fill={saved ? '#e11d48' : 'none'} color={saved ? '#e11d48' : '#fff'} />
          </button>
          <button
            type="button"
            className={styles.listImgBtn}
            onClick={(e) => {
              e.preventDefault();
              if (navigator.share) {
                navigator.share({ title: p.title, url: window.location.href });
              }
            }}
            aria-label="Share"
          >
            <Share2 size={14} color="#fff" />
          </button>
        </div>
        {/* Photo count badge bottom-left */}
        {imgCount > 0 && (
          <div className={styles.listImgCount}>
            <Camera size={12} />
            <span>{imgCount}</span>
          </div>
        )}
      </div>

      {/* ─€─€ Info Column ─€─€ */}
      <div className={styles.listCardInfo}>

        {/* Status chips row */}
        <div className={styles.listStatusRow}>
          {availStatus && (
            <span className={isUnderConstruction ? styles.chipAmber : isReadyToMove ? styles.chipGreen : styles.chipBlue}>
              {availStatus}
            </span>
          )}
          {p.possession && (
            <span className={styles.chipGreen}>
              <CheckCircle size={11} /> Possession: {p.possession}
            </span>
          )}
        </div>

        {/* Title + Price row */}
        <div className={styles.listCardTop}>
          <div className={styles.listCardMeta}>
            <h3 className={styles.listCardTitle}>{p.title}</h3>
            <div className={styles.listCardLoc}>
              <MapPin size={12} />
              <span>{p.location || p.city}</span>
            </div>
            {p.builderName && (
              <div className={styles.listBuilderRow}>
                <Building2 size={12} />
                <span>{p.builderName}</span>
              </div>
            )}
          </div>
          <div className={styles.listCardPriceWrap}>
            <div className={styles.listCardPrice}>{p.price}</div>
            {p.reraNumber && (
              <div className={styles.listReraId}>RERA ID: {p.reraNumber}</div>
            )}
          </div>
        </div>

        {/* BHK Config grid */}
        {bedroomList.length > 0 ? (
          <div className={styles.listBhkGrid}>
            {bedroomList.slice(0, 4).map((bhk, i) => (
              <div key={i} className={styles.listBhkCell}>
                <span className={styles.listBhkLabel}>{bhk.includes('BHK') ? bhk : `${bhk} BHK`}</span>
                <span className={styles.listBhkSub}>On Request</span>
                <span className={styles.listBhkPrice}>{p.price}</span>
              </div>
            ))}
          </div>
        ) : displayArea ? (
          <div className={styles.listAreaRow}>
            <span className={styles.listAreaLabel}>Area:</span>
            <span className={styles.listAreaVal}>{displayArea}</span>
          </div>
        ) : null}

        {/* Amenity chips */}
        {amenityList.length > 0 && (
          <div className={styles.listAmenityRow}>
            {amenityList.map((a, i) => (
              <span key={i} className={styles.listAmenityChip}>{a}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.listCardActions}>
          <span className={styles.listDetailsBtn}>View Details</span>
          <button
            className={styles.listCallbackBtn}
            onClick={(e) => { e.preventDefault(); onEnquire?.(p); }}
          >
            Get Callback
          </button>
        </div>
      </div>
    </Link>
  );
}


/* ─€─€ Main Page ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */
export default function SearchResultsPage({ isSavedView: isSavedProp = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isSavedView = Boolean(isSavedProp || location.pathname === '/saved' || searchParams.get('saved') === 'true');

  const [properties,  setProperties]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [enquiryProp, setEnquiryProp] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ─€─€ URL params ─€─€ */
  const q            = searchParams.get('q')            || '';
  const builder      = searchParams.get('builder')      || '';
  const localities   = searchParams.get('localities')   || ''; // comma-separated multi-locality
  const city         = searchParams.get('city')         || '';
  const listingType  = searchParams.get('listingType')  || '';
  const propertyType = searchParams.get('propertyType') || '';
  const budget       = searchParams.get('budget')       || '';
  const buildingType = searchParams.get('buildingType') || '';
  const bedroom      = searchParams.get('bedroom')      || '';
  const availability = searchParams.get('availability') || '';
  const amenity      = searchParams.get('amenity')      || '';
  const statusFilter = searchParams.get('status')       || '';

  // Parse selected localities into an array
  const selectedLocalities = localities ? localities.split(',').map(l => l.trim()).filter(Boolean) : [];

  // Toggle a locality in/out of the multi-select list
  const toggleLocality = useCallback((loc) => {
    const next = new URLSearchParams(searchParams);
    const current = next.get('localities') || '';
    const arr = current ? current.split(',').map(l => l.trim()).filter(Boolean) : [];
    const idx = arr.findIndex(l => l.toLowerCase() === loc.toLowerCase());
    if (idx >= 0) arr.splice(idx, 1); else arr.push(loc);
    if (arr.length > 0) next.set('localities', arr.join(',')); else next.delete('localities');
    setPage(1);
    setSearchParams(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams]);

  const [locSearch, setLocSearch] = useState('');

  /* ─€─€ Category tabs state ─€─€ */
  const [activeTab, setActiveTab] = useState('all');

  /* ─€─€ Budget slider (local state, applied on change) ─€─€ */
  const BUDGET_MAX = 100000000; // 10 Cr
  const BUDGET_MIN = 0;
  const [budgetRange, setBudgetRange] = useState([BUDGET_MIN, BUDGET_MAX]);

  /* ─€─€ Area slider ─€─€ */
  const AREA_MAX = 5000;
  const AREA_MIN = 0;
  const [areaRange, setAreaRange] = useState([AREA_MIN, AREA_MAX]);

  /* ─€─€ 1-second Blur Refresh State ─€─€ */
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);
  const budgetDebounceRef = useRef(null);
  const areaDebounceRef = useRef(null);

  /* ─€─€ Area param ─€─€ */
  const areaParam = searchParams.get('area') || '';

  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setPage(1);
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  /* ─€─€ Commit functions for budget and area ─€─€ */
  const commitBudget = useCallback((range) => {
    clearTimeout(budgetDebounceRef.current);
    const min = range[0];
    const max = range[1];
    if (min <= BUDGET_MIN && max >= BUDGET_MAX) {
      setParam('budget', '');
    } else {
      setParam('budget', `${min}-${max}`);
    }
  }, [setParam, BUDGET_MIN, BUDGET_MAX]);

  const debouncedSetBudget = useCallback((range) => {
    clearTimeout(budgetDebounceRef.current);
    budgetDebounceRef.current = setTimeout(() => {
      commitBudget(range);
    }, 350);
  }, [commitBudget]);

  const commitArea = useCallback((range) => {
    clearTimeout(areaDebounceRef.current);
    const min = range[0];
    const max = range[1];
    if (min <= AREA_MIN && max >= AREA_MAX) {
      setParam('area', '');
    } else {
      setParam('area', `${min}-${max}`);
    }
  }, [setParam, AREA_MIN, AREA_MAX]);

  const debouncedSetArea = useCallback((range) => {
    clearTimeout(areaDebounceRef.current);
    areaDebounceRef.current = setTimeout(() => {
      commitArea(range);
    }, 350);
  }, [commitArea]);

  /* ─€─€ Click directly on track to jump nearest thumb ─€─€ */
  const handleTrackClick = (e, range, min, max, step, commitFn, setRangeFn) => {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'input') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;

    const dist0 = Math.abs(steppedVal - range[0]);
    const dist1 = Math.abs(steppedVal - range[1]);
    let next;
    if (dist0 < dist1) {
      next = [Math.min(steppedVal, range[1] - step), range[1]];
    } else {
      next = [range[0], Math.max(steppedVal, range[0] + step)];
    }
    setRangeFn(next);
    commitFn(next);
  };

  /* ─€─€ Sync budgetRange slider state when budget param changes ─€─€ */
  useEffect(() => {
    if (budget) {
      const parts = budget.split('-');
      const min = Number(parts[0]) || BUDGET_MIN;
      const max = Number(parts[1]) || BUDGET_MAX;
      setBudgetRange([min, max]);
    } else {
      setBudgetRange([BUDGET_MIN, BUDGET_MAX]);
    }
  }, [budget]);

  /* ─€─€ Sync areaRange slider state when area param changes ─€─€ */
  useEffect(() => {
    if (areaParam) {
      const parts = areaParam.split('-');
      const min = Number(parts[0]) || AREA_MIN;
      const max = Number(parts[1]) || AREA_MAX;
      setAreaRange([min, max]);
    } else {
      setAreaRange([AREA_MIN, AREA_MAX]);
    }
  }, [areaParam]);

  /* ─€─€ Clean up timers ─€─€ */
  useEffect(() => {
    return () => {
      clearTimeout(budgetDebounceRef.current);
      clearTimeout(areaDebounceRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  /* ─€─€ Switch Property Type ─€─€ */
  const handlePropertyTypeChange = (id) => {
    const next = new URLSearchParams(searchParams);
    if (propertyType === id) {
      next.delete('propertyType');
    } else {
      next.set('propertyType', id);
    }
    setPage(1);
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
    setPage(1);
    setBudgetRange([BUDGET_MIN, BUDGET_MAX]);
    setAreaRange([AREA_MIN, AREA_MAX]);
  };

  /* ─€─€ Fetch properties ─€─€ */
  const fetchProperties = useCallback(() => {
    setIsRefreshing(true);
    setLoading(true);
    const startTimestamp = Date.now();

    const params = { page, limit: 10 };
    if (city)              params.city         = city;
    if (q)                 params.q            = q;
    if (builder)           params.builder      = builder;
    if (localities)        params.localities   = localities;   // comma-separated
    if (listingType)       params.listingType  = listingType;
    if (propertyType)      params.propertyType = propertyType;
    if (buildingType)      params.buildingType = buildingType;
    if (bedroom)           params.bedroom      = bedroom;
    if (availability)      params.availability = availability;
    if (amenity)           params.amenity      = amenity;
    if (statusFilter)      params.status       = statusFilter;

    // Budget params for API
    if (budget) {
      const [minStr, maxStr] = budget.split('-');
      const min = Number(minStr) || 0;
      const max = Number(maxStr) || 0;
      if (min > 0) params.minPrice = min;
      if (max > 0 && max < BUDGET_MAX) params.maxPrice = max;
    }

    // Area params
    if (areaParam) {
      const [minA, maxA] = areaParam.split('-');
      if (minA) params.minArea = minA;
      if (maxA && Number(maxA) < AREA_MAX) params.maxArea = maxA;
    }

    const fetchPromise = isSavedView
      ? getSaved().then(({ data }) => ({ data: { properties: data.results || data.properties || [] } }))
      : getProperties(params);

    fetchPromise
      .then(({ data }) => {
        let list = data.properties || data.results || [];

        // Robust client-side price filter to guarantee budget works
        if (budget) {
          const [minStr, maxStr] = budget.split('-');
          const minNum = Number(minStr) || 0;
          const maxNum = (maxStr && Number(maxStr) > 0 && Number(maxStr) < BUDGET_MAX) ? Number(maxStr) : Infinity;
          list = list.filter((p) => {
            const price = parseNumericPrice(p);
            if (price <= 0) return true;
            return price >= minNum && price <= maxNum;
          });
        }

        // Robust client-side area / sqft filter for all property types
        if (areaParam) {
          const [minAStr, maxAStr] = areaParam.split('-');
          const minA = Number(minAStr) || 0;
          const maxA = (maxAStr && Number(maxAStr) > 0 && Number(maxAStr) < AREA_MAX) ? Number(maxAStr) : Infinity;
          list = list.filter((p) => {
            const sqft = parseNumericSqft(p);
            if (sqft <= 0) return true;
            return sqft >= minA && sqft <= maxA;
          });
        }

        // Client-side builder filter fallback
        if (builder) {
          const bLower = builder.toLowerCase();
          list = list.filter((p) => {
            const b = (p.builderName || '').toLowerCase();
            const t = (p.title || '').toLowerCase();
            const d = (p.description || '').toLowerCase();
            return b.includes(bLower) || t.includes(bLower) || d.includes(bLower);
          });
        }

        // Client-side propertyType filter fallback matching exact category definitions
        if (propertyType) {
          const pLower = propertyType.toLowerCase().trim();
          list = list.filter((p) => {
            const pt = (p.propertyType || '').toLowerCase();
            const bt = (p.buildingType || '').toLowerCase();
            const tt = (p.title || '').toLowerCase();
            if (pLower === 'apartment') return (pt.includes('apartment') || pt.includes('flat')) && bt !== 'commercial' && !pt.includes('pg') && !tt.includes('pg');
            if (pLower === 'villa') return pt.includes('villa') && bt !== 'commercial';
            if (pLower === 'independent') return (pt.includes('independent') || pt.includes('house')) && bt !== 'commercial';
            if (pLower === 'plot') return pt.includes('plot') || pt.includes('land') || Boolean(p.plotType);
            if (pLower === 'commercial') return bt === 'commercial' || pt.includes('commercial') || pt.includes('office') || pt.includes('shop');
            if (pLower === 'pg') return pt.includes('pg') || pt.includes('hostel') || pt.includes('co-living') || tt.includes('pg');
            return pt.includes(pLower);
          });
        }

        // Client-side sort by URL param
        const sortParam = searchParams.get('sort') || 'relevance';
        if (sortParam === 'price_asc') {
          list = [...list].sort((a, b) => parseNumericPrice(a) - parseNumericPrice(b));
        } else if (sortParam === 'price_desc') {
          list = [...list].sort((a, b) => parseNumericPrice(b) - parseNumericPrice(a));
        } else if (sortParam === 'area_asc') {
          list = [...list].sort((a, b) => parseNumericSqft(a) - parseNumericSqft(b));
        }
        setProperties(list);
        setTotal(list.length);
      })
      .catch(() => setProperties([]))
      .finally(() => {
        setLoading(false);
        // Ensure smooth 1-second (1000ms) blur refresh effect
        const elapsed = Date.now() - startTimestamp;
        const remaining = Math.max(0, 1000 - elapsed);
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => {
          setIsRefreshing(false);
        }, remaining);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, q, builder, localities, listingType, propertyType, budget, areaParam, buildingType, bedroom, availability, amenity, statusFilter, page, isSavedView, searchParams]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  /* ─€─€ Format budget for display ─€─€ */
  const formatBudget = (val) => {
    if (val >= 10000000) return 'Rs.' + (val / 10000000).toFixed(1) + ' Cr';
    if (val >= 100000)   return 'Rs.' + (val / 100000).toFixed(0)  + ' L';
    return 'Rs.' + val.toLocaleString();
  };

  /* ─€─€ Active filter count ─€─€ */
  const activeCount = [city, builder, listingType, propertyType, budget, areaParam, buildingType, bedroom, availability, amenity, statusFilter, localities].filter(Boolean).length;

  /* ─€─€ Quick suggestion chips (based on city) ─€─€ */
  const quickChips = city ? [
    `New Projects in ${city}`,
    `Ready to Move in ${city}`,
    `2 BHK in ${city}`,
    `3 BHK in ${city}`,
    `Villas in ${city}`,
  ] : ['Apartments', '2 BHK', 'Ready to Move', 'Villas', 'Plots'];

  /* ─€─€ Category Tabs ─€─€ */
  const categoryTabs = [
    { id: 'all',        label: 'All Properties', count: total },
    { id: 'Sell',       label: 'By Individuals',  count: null },
    { id: 'Rent',       label: 'Rental',          count: null },
    { id: 'Commercial', label: 'Commercial',       count: null },
    { id: 'pg',         label: 'PG',              count: null },
  ];

  /* ─€─€ Slider Handlers ─€─€ */
  const handleMinBudgetChange = (e) => {
    const v = Number(e.target.value);
    const newMin = Math.min(v, budgetRange[1] - 500000);
    const next = [newMin, budgetRange[1]];
    setBudgetRange(next);
    debouncedSetBudget(next);
  };

  const handleMaxBudgetChange = (e) => {
    const v = Number(e.target.value);
    const newMax = Math.max(v, budgetRange[0] + 500000);
    const next = [budgetRange[0], newMax];
    setBudgetRange(next);
    debouncedSetBudget(next);
  };

  const handleMinAreaChange = (e) => {
    const v = Number(e.target.value);
    const newMin = Math.min(v, areaRange[1] - 50);
    const next = [newMin, areaRange[1]];
    setAreaRange(next);
    debouncedSetArea(next);
  };

  const handleMaxAreaChange = (e) => {
    const v = Number(e.target.value);
    const newMax = Math.max(v, areaRange[0] + 50);
    const next = [areaRange[0], newMax];
    setAreaRange(next);
    debouncedSetArea(next);
  };

  /* ─€─€ Filter Panel Content ─€─€ */
  const renderFilterContent = () => {
    const minBudgetPct = Math.max(0, Math.min(100, ((budgetRange[0] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100));
    const maxBudgetPct = Math.max(0, Math.min(100, ((budgetRange[1] - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100));

    const minAreaPct = Math.max(0, Math.min(100, ((areaRange[0] - AREA_MIN) / (AREA_MAX - AREA_MIN)) * 100));
    const maxAreaPct = Math.max(0, Math.min(100, ((areaRange[1] - AREA_MIN) / (AREA_MAX - AREA_MIN)) * 100));

    return (
      <>
        {/* Header */}
        <div className={styles.filterHeader}>
          <div className={styles.filterHeaderLeft}>
            <div className={styles.filterIconWrap}>
              <Filter size={14} color="#fff" />
            </div>
            <span className={styles.filterTitle}>Filters</span>
            {activeCount > 0 && (
              <span className={styles.filterCount}>{activeCount}</span>
            )}
          </div>
          {activeCount > 0 && (
            <button className={styles.clearAllBtn} onClick={clearAll}>Clear All</button>
          )}
        </div>

        {/* Locality multi-select */}
        <AccordionSection title={`Locality${selectedLocalities.length > 0 ? ` (${selectedLocalities.length})` : ''}`} defaultOpen={true}>
          {/* Selected locality tags */}
          {selectedLocalities.length > 0 && (
            <div className={styles.localityChips}>
              {selectedLocalities.map(loc => (
                <span key={loc} className={styles.localityChip} style={{ background: '#E0F2FE', color: '#0369A1', borderColor: 'rgba(3,105,161,0.3)', fontWeight: 700 }}>
                  {loc}
                  <button onClick={() => toggleLocality(loc)} className={styles.chipX}>x</button>
                </span>
              ))}
              <button
                className={styles.clearLocalityBtn}
                onClick={() => { const n = new URLSearchParams(searchParams); n.delete('localities'); setSearchParams(n); }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Search box */}
          <div className={styles.localityEmpty}>
            <input
              className={styles.localityInput}
              placeholder={city ? `Search localities in ${city}...` : 'Search locality...'}
              value={locSearch}
              onChange={(e) => setLocSearch(e.target.value)}
            />
          </div>

          {/* Locality grid — multi-select */}
          <div className={styles.localityChipsGrid}>
            {getLocalitiesByCity(city || 'Chennai')
              .filter(loc => !locSearch || loc.toLowerCase().includes(locSearch.toLowerCase()))
              .slice(0, locSearch ? 20 : 14)
              .map(loc => {
                const isSelected = selectedLocalities.some(l => l.toLowerCase() === loc.toLowerCase());
                return (
                  <button
                    key={loc}
                    type="button"
                    className={`${styles.localityChipBtn} ${isSelected ? styles.localityChipBtnActive : ''}`}
                    onClick={() => toggleLocality(loc)}
                    title={loc}
                  >
                    <span>{loc}</span>
                    <span className={styles.chipPlus}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })
            }
          </div>
        </AccordionSection>

        {/* Budget slider with interactive line & track click */}
        <AccordionSection title="Budget" defaultOpen={true}>
          <div className={styles.rangeDisplay}>
            <div className={styles.rangeValBox}>
              <span className={styles.rangeValLabel}>Min</span>
              <span className={styles.rangeVal}>{formatBudget(budgetRange[0])}</span>
            </div>
            <span className={styles.rangeSep}>to</span>
            <div className={styles.rangeValBox}>
              <span className={styles.rangeValLabel}>Max</span>
              <span className={styles.rangeVal}>{formatBudget(budgetRange[1])}</span>
            </div>
          </div>
          <div
            className={styles.sliderWrap}
            onClick={(e) => handleTrackClick(e, budgetRange, BUDGET_MIN, BUDGET_MAX, 500000, commitBudget, setBudgetRange)}
            title="Click or drag to change budget"
          >
            {/* Visual active filter line */}
            <div className={styles.sliderTrack}>
              <div
                className={styles.sliderHighlight}
                style={{
                  left: `${minBudgetPct}%`,
                  width: `${maxBudgetPct - minBudgetPct}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={500000}
              value={budgetRange[0]}
              className={styles.rangeSlider}
              style={{ zIndex: budgetRange[0] > (BUDGET_MAX * 0.5) ? 4 : 2 }}
              onChange={handleMinBudgetChange}
              onMouseUp={() => commitBudget(budgetRange)}
              onTouchEnd={() => commitBudget(budgetRange)}
              aria-label="Minimum Budget"
            />
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={500000}
              value={budgetRange[1]}
              className={`${styles.rangeSlider} ${styles.rangeSliderTop}`}
              style={{ zIndex: 3 }}
              onChange={handleMaxBudgetChange}
              onMouseUp={() => commitBudget(budgetRange)}
              onTouchEnd={() => commitBudget(budgetRange)}
              aria-label="Maximum Budget"
            />
          </div>
          {/* Budget quick-select */}
          <div className={styles.budgetQuick}>
            {[
              { label: 'Under 25L',   val: '0-2500000'        },
              { label: '25L - 50L',   val: '2500000-5000000'  },
              { label: '50L - 1Cr',   val: '5000000-10000000' },
              { label: '1Cr - 2Cr',   val: '10000000-20000000'},
              { label: '2Cr+',         val: '20000000-100000000'},
            ].map(b => (
              <button
                key={b.val}
                type="button"
                className={`${styles.budgetChip} ${budget === b.val ? styles.budgetChipActive : ''}`}
                onClick={() => setParam('budget', budget === b.val ? '' : b.val)}
              >{b.label}</button>
            ))}
          </div>
        </AccordionSection>

        {/* Area / Square Feet slider */}
        <AccordionSection
          title={propertyType?.toLowerCase() === 'plot' ? 'Plot Area (sq.ft)' : 'Area / Square Feet (sq.ft)'}
          defaultOpen={true}
        >
          <div className={styles.rangeDisplay}>
            <div className={styles.rangeValBox}>
              <span className={styles.rangeValLabel}>Min</span>
              <span className={styles.rangeVal}>{areaRange[0].toLocaleString()} sqft</span>
            </div>
            <span className={styles.rangeSep}>to</span>
            <div className={styles.rangeValBox}>
              <span className={styles.rangeValLabel}>Max</span>
              <span className={styles.rangeVal}>{areaRange[1].toLocaleString()} sqft</span>
            </div>
          </div>
          <div
            className={styles.sliderWrap}
            onClick={(e) => handleTrackClick(e, areaRange, AREA_MIN, AREA_MAX, 50, commitArea, setAreaRange)}
            title="Click or drag to change square feet"
          >
            {/* Visual active filter line */}
            <div className={styles.sliderTrack}>
              <div
                className={styles.sliderHighlight}
                style={{
                  left: `${minAreaPct}%`,
                  width: `${maxAreaPct - minAreaPct}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={AREA_MIN}
              max={AREA_MAX}
              step={50}
              value={areaRange[0]}
              className={styles.rangeSlider}
              style={{ zIndex: areaRange[0] > (AREA_MAX * 0.5) ? 4 : 2 }}
              onChange={handleMinAreaChange}
              onMouseUp={() => commitArea(areaRange)}
              onTouchEnd={() => commitArea(areaRange)}
              aria-label="Minimum Square Feet"
            />
            <input
              type="range"
              min={AREA_MIN}
              max={AREA_MAX}
              step={50}
              value={areaRange[1]}
              className={`${styles.rangeSlider} ${styles.rangeSliderTop}`}
              style={{ zIndex: 3 }}
              onChange={handleMaxAreaChange}
              onMouseUp={() => commitArea(areaRange)}
              onTouchEnd={() => commitArea(areaRange)}
              aria-label="Maximum Square Feet"
            />
          </div>
          {/* Quick select sqft chips */}
          <div className={styles.budgetQuick}>
            {[
              { label: '< 1000', val: '0-1000' },
              { label: '1000 - 1500', val: '1000-1500' },
              { label: '1500 - 2500', val: '1500-2500' },
              { label: '2500 - 4000', val: '2500-4000' },
              { label: '4000+', val: '4000-5000' },
            ].map((sq) => (
              <button
                key={sq.val}
                type="button"
                className={`${styles.budgetChip} ${areaParam === sq.val ? styles.budgetChipActive : ''}`}
                onClick={() => setParam('area', areaParam === sq.val ? '' : sq.val)}
              >
                {sq.label} sqft
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* Property Type icon cards */}
        <AccordionSection title="Property Type" defaultOpen={true}>
          <div className={styles.propTypeGrid}>
            {PROP_TYPE_CARDS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.propTypeCard} ${propertyType === id ? styles.propTypeCardActive : ''}`}
                onClick={() => handlePropertyTypeChange(id)}
              >
                <Icon size={22} className={styles.propTypeIcon} />
                <span className={styles.propTypeLabel}>{label}</span>
              </button>
            ))}
          </div>
        </AccordionSection>

        {/* No. of Bedrooms */}
        <AccordionSection title="No. of Bedroom">
          <div className={styles.bedroomRow}>
            {BEDROOM_OPTIONS.map(b => (
              <button
                key={b}
                className={`${styles.bedroomBtn} ${bedroom === b ? styles.bedroomBtnActive : ''}`}
                onClick={() => setParam('bedroom', bedroom === b ? '' : b)}
              >{b} BHK</button>
            ))}
          </div>
        </AccordionSection>

        {/* Availability */}
        <AccordionSection title="Availability">
          <div className={styles.checkList}>
            {AVAILABILITY_OPTIONS.map(a => (
              <label key={a} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={availability === a}
                  onChange={() => setParam('availability', availability === a ? '' : a)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                {a}
              </label>
            ))}
          </div>
        </AccordionSection>

        {/* Property Status */}
        <AccordionSection title="Property Status">
          <div className={styles.checkList}>
            {STATUS_OPTIONS.map(s => (
              <label key={s} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={statusFilter === s}
                  onChange={() => setParam('status', statusFilter === s ? '' : s)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                {s}
              </label>
            ))}
          </div>
        </AccordionSection>

        {/* Amenities */}
        <AccordionSection title="Amenities">
          <div className={styles.amenityGrid}>
            {AMENITY_OPTIONS.map(a => (
              <button
                key={a}
                className={`${styles.amenityChip} ${amenity === a ? styles.amenityChipActive : ''}`}
                onClick={() => setParam('amenity', amenity === a ? '' : a)}
              >{a}</button>
            ))}
          </div>
        </AccordionSection>
      </>
    );
  };

  return (
    <div className={styles.wrap}>
      {/* ─€─€ Breadcrumb ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */}
      <div className={`container ${styles.breadcrumb}`}>
        <Link to="/" className={styles.breadLink}>Home</Link>
        <span className={styles.breadSep}>></span>
        {isSavedView ? (
          <span className={styles.breadCurrent}>Liked Properties</span>
        ) : city ? (
          <><span className={styles.breadLink}>Properties in {city}</span><span className={styles.breadSep}>></span></>
        ) : null}
        {!isSavedView && (
          builder ? (
            <span className={styles.breadCurrent}>Projects by {builder}</span>
          ) : propertyType ? (
            <span className={styles.breadCurrent}>
              {PROP_TYPE_CARDS.find((c) => c.id === propertyType.toLowerCase())?.label || propertyType}
            </span>
          ) : (
            <span className={styles.breadCurrent}>
              {listingType === 'Sell' ? 'For Sale' : listingType === 'Rent' ? 'For Rent' : 'All Properties'}
            </span>
          )
        )}
      </div>

      {/* ─€─€ Search Hero Banner ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */}
      <div className={styles.searchHero}>
        <div className={styles.searchHeroInner}>
          <div className={styles.searchHeroTitle}>
            {isSavedView ? (
              <>Your <span>Liked &amp; Shortlisted Properties</span></>
            ) : builder ? (
              <>Projects &amp; Properties by <span>{builder}</span></>
            ) : q ? (
              <>Results for "<span>{q}</span>"</>
            ) : propertyType ? (
              <>Verified Properties for <span>{PROP_TYPE_CARDS.find((c) => c.id === propertyType.toLowerCase())?.label || propertyType}</span></>
            ) : city ? (
              <>Properties in <span>{city}</span></>
            ) : (
              <>Discover Your <span>Dream Property</span></>
            )}
          </div>
          {/* Quick Chip Suggestions */}
          <div className={styles.quickChips}>
            {quickChips.map(c => (
              <button key={c} className={styles.quickChip}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─€─€ Category Tabs ─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */}
      <div className={styles.tabRow}>
        {categoryTabs.map(t => (
          <button
            key={t.id}
            className={`${styles.catTab} ${activeTab === t.id ? styles.catTabActive : ''}`}
            onClick={() => {
              setActiveTab(t.id);
              if (t.id !== 'all') setParam('listingType', t.id);
              else setParam('listingType', '');
            }}
          >
            {t.label}
            {t.count !== null && <span className={styles.catTabCount}> ({t.count})</span>}
          </button>
        ))}
      </div>

      {/* ─€─€ Main Content + Filter Panel ─€─€─€─€─€─€─€─€─€─€─€─€─€─€ */}
      <div className={`container ${styles.bodyRow}`}>

        {/* Left: results */}
        <div className={styles.results}>
          {/* Title + count + mobile filter toggle */}
          <div className={styles.resultsHeader}>
            <div>
              <h1 className={styles.heading}>
                {builder ? (
                  <>{total} {total === 1 ? 'Project' : 'Projects'} by {builder}</>
                ) : (
                  <>
                    {total} {total === 1 ? 'Property' : 'Properties'}
                    {listingType === 'Sell' ? ' For Sale' : listingType === 'Rent' ? ' For Rent' : ''}
                    {city ? ` in ${city}` : ''}
                  </>
                )}
              </h1>
            </div>
            <button
              className={styles.mobileFilterBtn}
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={15} />
              Filters {activeCount > 0 && <span className={styles.filterBadge}>{activeCount}</span>}
            </button>
          </div>

          {/* Active filter chips row */}
          {activeCount > 0 && (
            <div className={styles.activeChips}>
              {builder      && <span className={styles.activeChip}>Builder: {builder} <button onClick={() => setParam('builder', '')}>x</button></span>}
              {city         && <span className={styles.activeChip}>{city}         <button onClick={() => setParam('city', '')}>x</button></span>}
              {selectedLocalities.map(loc => (
                <span key={loc} className={styles.activeChip}>{loc} <button onClick={() => toggleLocality(loc)}>x</button></span>
              ))}
              {listingType  && <span className={styles.activeChip}>{listingType === 'Sell' ? 'For Sale' : 'For Rent'} <button onClick={() => setParam('listingType', '')}>x</button></span>}
              {propertyType && <span className={styles.activeChip}>{propertyType} <button onClick={() => setParam('propertyType', '')}>x</button></span>}
              {bedroom      && <span className={styles.activeChip}>{bedroom} BHK  <button onClick={() => setParam('bedroom', '')}>x</button></span>}
              {budget       && <span className={styles.activeChip}>Budget: {formatBudget(budgetRange[0])} to {formatBudget(budgetRange[1])} <button onClick={() => setParam('budget', '')}>x</button></span>}
              {areaParam    && <span className={styles.activeChip}>Area: {areaRange[0].toLocaleString()} to {areaRange[1].toLocaleString()} sqft <button onClick={() => setParam('area', '')}>x</button></span>}
              {availability && <span className={styles.activeChip}>{availability} <button onClick={() => setParam('availability', '')}>x</button></span>}
              {amenity      && <span className={styles.activeChip}>{amenity}      <button onClick={() => setParam('amenity', '')}>x</button></span>}
              {statusFilter && <span className={styles.activeChip}>{statusFilter} <button onClick={() => setParam('status', '')}>x</button></span>}
              <button className={styles.clearChipAll} onClick={clearAll}>Clear all x</button>
            </div>
          )}


          {/* Sort bar */}
          {!loading && properties.length > 0 && (
            <div className={styles.sortBar}>
              <span className={styles.sortLabel}>Sort by:</span>
              <select
                className={styles.sortSelect}
                value={searchParams.get('sort') || 'relevance'}
                onChange={(e) => setParam('sort', e.target.value === 'relevance' ? '' : e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="area_asc">Area: Small to Large</option>
              </select>
            </div>
          )}
          {/* Property list with 1-second blur refresh effect */}
          <div className={styles.listContainer}>
            {isRefreshing && (
              <div className={styles.refreshBadge}>
                <Loader2 size={15} className={styles.spin} />
                <span>Updating properties...</span>
              </div>
            )}

            {loading && !properties.length ? (
              <div className={styles.loading}>
                {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyTitle}>No properties found</div>
                <div className={styles.emptySub}>Try adjusting or clearing your filters</div>
                <button className={styles.clearAllBtn2} onClick={clearAll}>Clear All Filters</button>
              </div>
            ) : (
              <div className={`${styles.list} ${isRefreshing ? styles.listBlur : styles.listNormal}`}>
                {properties.map(p => (
                  <PropertyListCard key={p.id || p._id} property={p} onEnquire={setEnquiryProp} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {Math.ceil(total / 10)}</span>
              <button disabled={properties.length < 10} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
            </div>
          )}
        </div>

        {/* Right: Filter Panel (desktop) */}
        <aside className={styles.filterPanel}>
          {renderFilterContent()}
        </aside>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setMobileFiltersOpen(false)}>
          <div className={styles.mobileDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.filterTitle}>Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className={styles.drawerClose}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.mobileDrawerBody}>
              {renderFilterContent()}
            </div>
            <div className={styles.mobileDrawerFooter}>
              <button className={styles.applyBtn} onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {enquiryProp && <EnquiryModal property={enquiryProp} onClose={() => setEnquiryProp(null)} />}
    </div>
  );
}





