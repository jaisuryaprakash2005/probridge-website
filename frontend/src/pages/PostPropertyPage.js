import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProperty, uploadImage } from '../services/api';
import { CITY_NAMES, getLocalitiesByCity, matchCity, matchLocality } from '../data/localities';
import Logo from '../components/Logo';
import MapPickerModal from '../components/MapPickerModal';
import {
  Home, Layers, IndianRupee, Camera, CheckCircle2,
  AlertCircle, ChevronRight, ChevronLeft, Upload, X,
  Check, ShieldCheck, Loader2, MapPin, Crosshair, ArrowLeft
} from 'lucide-react';
import styles from './PostPropertyPage.module.css';

// ─── CONSTANTS (Exact match with mobile ListingFormScreen.js) ────────────────
const BUILDING_TYPES = ['Residential', 'Commercial'];
const LISTING_TYPES  = ['Sell', 'Rent', 'Lease', 'PG'];
const USER_TYPES     = ['Owner', 'Broker', 'Builder'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Independent House'];
const PROPERTY_STATUS = ['Ready to Move', 'Under Construction'];
const PLOT_TYPES     = ['Independent Plot', 'Layout', 'Gated Community'];
const PLOT_SIZES     = ['30×40', '30×50', '30×60', '60×90', 'Other'];
const DIRECTIONS     = ['East', 'West', 'North', 'South'];
const BEDROOMS       = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK'];
const BATHROOMS      = ['1', '2', '3', '4', '5'];
const BALCONIES      = ['0', '1', '2', '3', '4', '5'];
const FURNISHING     = ['Semi Furnished', 'Furnished', 'Unfurnished'];
const AMENITIES_LIST = [
  'Lift', 'Parking', 'Swimming Pool', 'Gym', 'Power Backup',
  'Security', 'Club House', 'Garden', 'Play Area', 'Intercom',
  'CCTV', 'Water Supply',
];
const DIM_UNITS      = ['Sq. Feet', 'Super Built Up Area', 'Built Up Area', 'Carpet Area'];
const MAX_PHOTOS     = 4;
const MAX_FLOOR_PLANS = 2;

const STEPS = [
  { num: 1, title: 'Basic Information',     icon: Home },
  { num: 2, title: 'Property Details',      icon: Layers },
  { num: 3, title: 'Pricing & Description', icon: IndianRupee },
  { num: 4, title: 'Photos & Documents',    icon: Camera },
  { num: 5, title: 'Review & Submit',       icon: CheckCircle2 },
];

export function formatPriceDisplay(amount, unit = 'Lac') {
  if (!amount && amount !== 0) return '';
  const str = String(amount).trim();
  if (!str) return '';

  if (/cr/i.test(str)) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num ? `₹ ${num} Cr` : str;
  }
  if (/lac|lakh/i.test(str)) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return num ? `₹ ${num} Lac` : str;
  }

  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) return str;

  if (unit === 'Cr') return `₹ ${num} Cr`;
  if (unit === 'Lac') return `₹ ${num} Lac`;

  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${cr} Cr`;
  }
  if (num >= 100000) {
    const lac = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹ ${lac} Lac`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

export default function PostPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const floorPlanInputRef = useRef(null);

  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    buildingType: 'Residential',
    listingType: 'Sell',
    userType: 'Owner',
    builderName: '',
    email: '',
    phone: '',
    propertyType: 'Apartment',
    propertyName: '',
    propertyAge: '',
    propertyStatus: 'Ready to Move',
    city: '',
    locality: '',
    address: '',
    postalCode: '',
    lat: null,
    lng: null,
    // Step 2
    plotType: '',
    plotSize: '',
    customPlotSize: '',
    roadFacing: 'East',
    plotAge: '',
    plotDimension: '',
    plotDimensionUnit: 'Sq. Feet',
    bedroom: '2 BHK',
    bathroom: '2',
    balconies: '1',
    doorFacing: 'East',
    furnishingStatus: 'Semi Furnished',
    amenities: [],
    totalProjectFloors: '',
    possessionDate: '',
    // Step 3
    totalFloors: '',
    selectedFloor: '',
    price: '',
    priceUnit: 'Lac',
    maintenanceCharge: '',
    description: '',
    propertyHighlights: '',
    reraNumber: '',
    // Step 4
    images: [],
    _imagePreviews: [],
    floorPlanImages: [],
    _floorPlanPreviews: [],
    propertyVideo: '',
    propertyBrochure: '',
  });

  // UI helpers
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAlert, setValidationAlert] = useState(null);
  const [submittedProperty, setSubmittedProperty] = useState(null);

  // ── Dirty / unsaved-changes tracking ──────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // ── Map Picker Modal & GPS State ──────────────────────────────────────────
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/post-property');
    } else {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user, navigate]);

  const update = (key) => (val) => {
    setValidationAlert(null);
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // ── Block browser tab-close / refresh when form is dirty ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // ── Intercept browser Back button (popstate) when form is dirty ────────────
  useEffect(() => {
    // Push dummy history entry so back button can be intercepted
    window.history.pushState({ postPropertyPage: true }, '');

    const handlePopState = () => {
      if (isDirty) {
        // Keep user on the page and show confirmation dialog
        window.history.pushState({ postPropertyPage: true }, '');
        setShowExitConfirm(true);
      } else {
        navigate('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty, navigate]);

  // ── Exit confirmation dialog handlers ─────────────────────────────────────
  const handleExitPress = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      navigate('/');
    }
  };

  const handleKeepEditing = () => {
    setShowExitConfirm(false);
  };

  const handleConfirmExit = () => {
    setIsDirty(false);
    setShowExitConfirm(false);
    navigate('/');
  };

  const handleBack = () => {
    setValidationAlert(null);
    if (step > 1) {
      setStep((s) => Math.max(s - 1, 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleExitPress();
    }
  };

  // ── Location Pin Confirm handler ──────────────────────────────────────────
  const handleMapConfirm = (loc) => {
    if (!loc) return;
    setIsDirty(true);
    setValidationAlert(null);

    const fullAddr = loc.displayName || loc.address || '';
    const matchedCity = matchCity(loc.city, fullAddr) || formData.city || '';
    const cityLocs = getLocalitiesByCity(matchedCity);
    const matchedLocality = matchLocality(loc.locality, fullAddr, cityLocs) || loc.locality || '';

    setFormData((prev) => ({
      ...prev,
      city: matchedCity || prev.city,
      locality: matchedLocality || prev.locality,
      address: loc.address || prev.address,
      postalCode: loc.postalCode || prev.postalCode,
      lat: loc.lat,
      lng: loc.lng,
    }));

    if (matchedLocality && !cityLocs.includes(matchedLocality)) {
      setCustomLocalityInput(matchedLocality);
    }
    setIsMapOpen(false);
  };

  // ── GPS Auto-detect handler ───────────────────────────────────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await res.json();
          const a = data.address || {};
          const rawCity = a.city || a.town || a.municipality || a.city_district || a.state_district || a.county || '';
          const cityClean = rawCity.replace(/\s+(District|Urban|Rural|Corporation)$/i, '').trim();
          let rawLocality = a.suburb || a.neighbourhood || a.residential || a.subdistrict || a.quarter || a.city_district || a.borough || a.village || a.hamlet || a.road || '';
          const postalCode = a.postcode || '';
          let fullAddress = data.display_name || '';

          if (!rawLocality && fullAddress) {
            const tokens = fullAddress.split(',').map((s) => s.trim());
            for (const t of tokens) {
              if (t && !/^\d+$/.test(t) && t.toLowerCase() !== cityClean.toLowerCase() && !/^(india|tamil nadu|karnataka|telangana|maharashtra|kerala|andhra pradesh|gujarat|delhi)$/i.test(t)) {
                rawLocality = t;
                break;
              }
            }
          }

          const parts = fullAddress.split(', ');
          if (parts.length > 2) fullAddress = parts.slice(0, 4).join(', ');

          const matchedCity = matchCity(cityClean, data.display_name || '') || cityClean;
          const cityLocs = getLocalitiesByCity(matchedCity);
          const matchedLocality = matchLocality(rawLocality, data.display_name || '', cityLocs) || rawLocality;

          setIsDirty(true);
          setValidationAlert(null);
          setFormData((prev) => ({
            ...prev,
            city: matchedCity || prev.city,
            locality: matchedLocality || prev.locality,
            address: fullAddress || prev.address,
            postalCode: postalCode || prev.postalCode,
            lat,
            lng,
          }));

          if (matchedLocality && !cityLocs.includes(matchedLocality)) {
            setCustomLocalityInput(matchedLocality);
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
        } finally {
          setFetchingGps(false);
        }
      },
      () => {
        setFetchingGps(false);
        alert('Could not retrieve your location. Please check browser location permissions or click "Open Map".');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getMissingFields = (currentStep) => {
    const d = formData;
    const missing = [];

    if (currentStep === 1) {
      if (!d.buildingType) missing.push('Building Type');
      if (!d.listingType) missing.push('Listing Type');
      if (!d.userType) missing.push('Are you an (Owner / Broker / Builder)');
      if (d.userType === 'Builder' && !d.builderName) missing.push('Builder / Developer Name');
      if (!d.email) missing.push('Email Address');
      if (!d.phone) missing.push('Contact Phone');
      if (!d.propertyType) missing.push('Property Type');
      if (!d.propertyName) missing.push('Property Name');
      if (d.listingType === 'Sell' && !d.propertyStatus) missing.push('Property Status');
      if (!d.city) missing.push('City');
      if (!d.locality) missing.push('Locality');
      if (!d.address) missing.push('Address');
      if (!d.postalCode) missing.push('Postal Code');
    } else if (currentStep === 2) {
      if (d.propertyType === 'Plot') {
        if (!d.plotType) missing.push('Plot Type');
        if (!d.plotSize || (d.plotSize === 'Other' && !d.customPlotSize)) missing.push('Plot Size');
        if (!d.roadFacing) missing.push('Road Facing Direction');
        if (!d.plotAge) missing.push('Plot Age');
        if (!d.plotDimension || !d.plotDimensionUnit) missing.push('Plot Dimension & Unit');
      } else {
        if (!d.bedroom) missing.push('Bedrooms');
        if (!d.bathroom) missing.push('Bathrooms');
        if (!d.balconies) missing.push('Balconies');
        if (!d.doorFacing) missing.push('Door Facing');
        if (!d.furnishingStatus) missing.push('Furnishing Status');
      }
    } else if (currentStep === 3) {
      if (d.propertyType !== 'Plot') {
        if (!d.totalFloors) missing.push('Total Floors');
        if (!d.selectedFloor) missing.push('Your Floor');
      }
      if (!d.price) missing.push('Expected Price');
    } else if (currentStep === 4) {
      if (!d.images || d.images.length === 0) missing.push('At least 1 Property Photo');
    }

    return missing;
  };

  const handleNext = () => {
    const missing = getMissingFields(step);
    if (missing.length > 0) {
      setValidationAlert({
        title: `Please complete all required fields for Step ${step}`,
        fields: missing,
      });
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setValidationAlert(null);
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Photo upload handling ───────────────────────────────────────────────────
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.images.length + files.length > MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos in total.`);
      return;
    }

    setUploading(true);
    setValidationAlert(null);

    try {
      const uploadedUrls = [];
      const localPreviews = [];

      for (const file of files) {
        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        localPreviews.push(objectUrl);

        // Upload to Cloudinary backend
        const { data } = await uploadImage(file);
        uploadedUrls.push(data.url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, MAX_PHOTOS),
        _imagePreviews: [...prev._imagePreviews, ...localPreviews].slice(0, MAX_PHOTOS),
      }));
      setIsDirty(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo. Please try a different image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      _imagePreviews: prev._imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // ── Floor Plan upload handling ──────────────────────────────────────────────
  const handleFloorPlanSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.floorPlanImages.length + files.length > MAX_FLOOR_PLANS) {
      alert(`You can only upload up to ${MAX_FLOOR_PLANS} floor plan images.`);
      return;
    }

    setUploadingFloorPlan(true);
    setValidationAlert(null);

    try {
      const uploadedUrls = [];
      const localPreviews = [];

      for (const file of files) {
        const objectUrl = URL.createObjectURL(file);
        localPreviews.push(objectUrl);
        const { data } = await uploadImage(file);
        uploadedUrls.push(data.url);
      }

      setFormData((prev) => ({
        ...prev,
        floorPlanImages: [...prev.floorPlanImages, ...uploadedUrls].slice(0, MAX_FLOOR_PLANS),
        _floorPlanPreviews: [...prev._floorPlanPreviews, ...localPreviews].slice(0, MAX_FLOOR_PLANS),
      }));
      setIsDirty(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload floor plan image.');
    } finally {
      setUploadingFloorPlan(false);
      if (floorPlanInputRef.current) floorPlanInputRef.current.value = '';
    }
  };

  const removeFloorPlan = (index) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      floorPlanImages: prev.floorPlanImages.filter((_, i) => i !== index),
      _floorPlanPreviews: prev._floorPlanPreviews.filter((_, i) => i !== index),
    }));
  };

  // ── Submit Listing ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting) return;

    const missing = getMissingFields(4);
    if (missing.length > 0) {
      setStep(4);
      setValidationAlert({ title: 'Photos Required', fields: missing });
      return;
    }

    setIsSubmitting(true);
    setValidationAlert(null);

    try {
      const unit = formData.priceUnit || 'Lac';
      const formattedPrice = formatPriceDisplay(formData.price, unit);

      let numericRaw = 0;
      const pNum = parseFloat(String(formData.price).replace(/[^0-9.]/g, '')) || 0;
      if (unit === 'Cr') numericRaw = Math.round(pNum * 10000000);
      else if (unit === 'Lac') numericRaw = Math.round(pNum * 100000);
      else numericRaw = Math.round(pNum);

      const customPlotVal = formData.customPlotSize?.trim();
      const resolvedPlotSize = (formData.propertyType === 'Plot' && formData.plotSize === 'Other' && customPlotVal)
        ? customPlotVal
        : formData.plotSize;

      const payload = {
        ...formData,
        plotSize: resolvedPlotSize,
        customPlotSize: customPlotVal || formData.customPlotSize,
        title: formData.propertyName,
        location: `${formData.locality}, ${formData.city}`,
        price: formattedPrice,
        priceRaw: numericRaw,
        image: formData.images[0] || '',
      };

      const { data } = await createProperty(payload);
      setSubmittedProperty(data.property || payload);
      setIsDirty(false); // form submitted – no unsaved changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setValidationAlert({
        title: 'Submission Error',
        fields: [err.response?.data?.message || 'Failed to submit property. Please check your network and try again.'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Localities for selected city
  const cityLocalities = getLocalitiesByCity(formData.city);

  // Success view
  if (submittedProperty) {
    return (
      <div className={styles.wrap}>
        <div className={`container ${styles.successContainer}`}>
          <div className={styles.successCard}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={54} color="#134E3A" />
            </div>
            <h1 className={styles.successHeading}>Property Submitted for Review!</h1>
            <p className={styles.successSub}>
              <strong>"{submittedProperty.propertyName || submittedProperty.title}"</strong> has been successfully submitted and is now under review by our property verification team.
            </p>
            <div className={styles.successStatusBanner}>
              <span className={styles.statusDot} />
              <span>Status: <strong>Under Review</strong> (Approval typically within 24–48 hours)</span>
            </div>
            <div className={styles.successActions}>
              <Link to="/search" className={styles.primaryBtn}>
                Browse Properties
              </Link>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setSubmittedProperty(null);
                  setStep(1);
                  setFormData((prev) => ({
                    ...prev,
                    propertyName: '',
                    price: '',
                    images: [],
                    _imagePreviews: [],
                  }));
                }}
              >
                Post Another Property
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* ── Top Header with Back, Title, and Exit Button (replacing hidden navbar) ── */}
      <header className={styles.topHeader}>
        <div className={styles.topHeaderInner}>
          <div className={styles.topHeaderLeft}>
            <button
              type="button"
              className={styles.backIconButton}
              onClick={handleBack}
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className={styles.headerLogoWrap} onClick={handleExitPress}>
              <Logo size="md" showTagline={true} theme="forest" />
            </div>
          </div>

          <div className={styles.topHeaderCenter}>
            <span className={styles.topHeaderTitle}>{STEPS[step - 1]?.title}</span>
            <span className={styles.topHeaderSub}>Step {step} of 5</span>
          </div>

          <button
            type="button"
            className={styles.exitHeaderBtn}
            onClick={handleExitPress}
            title="Exit listing"
          >
            <X size={15} color="#dc2626" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <button
              type="button"
              className={styles.breadcrumbLink}
              onClick={handleExitPress}
            >Home</button>
            <ChevronRight size={13} />
            <span>Post Property</span>
          </nav>
          <div className={styles.headerTitleRow}>
            <div>
              <h1 className={styles.title}>Post Your Property</h1>
              <p className={styles.subtitle}>
                List your residential or commercial property in 5 simple steps. Over 100,000+ verified buyers and tenants.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.contentContainer}`}>
        {/* ── Visual Stepper Bar ────────────────────────────────────────────── */}
        <div className={styles.stepperWrap}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isActive = step === s.num;

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  className={`${styles.stepPill} ${isActive ? styles.stepPillActive : ''} ${isCompleted ? styles.stepPillDone : ''}`}
                  onClick={() => {
                    if (isCompleted || s.num <= step) setStep(s.num);
                  }}
                  disabled={s.num > step}
                >
                  <div className={styles.stepNumIcon}>
                    {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  <div className={styles.stepLabelWrap}>
                    <span className={styles.stepIndex}>Step {s.num}</span>
                    <span className={styles.stepTitle}>{s.title}</span>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`${styles.stepLine} ${step > s.num ? styles.stepLineActive : ''}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Validation Warning Alert ──────────────────────────────────────── */}
        {validationAlert && (
          <div className={styles.alertBox}>
            <div className={styles.alertHeader}>
              <AlertCircle size={18} color="#B91C1C" />
              <strong>{validationAlert.title}</strong>
            </div>
            <ul className={styles.alertList}>
              {validationAlert.fields.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Step Form Container ───────────────────────────────────────────── */}
        <div className={styles.formCard}>
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: Basic Details
             ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className={styles.stepSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>Step 1 of 5</span>
                <h2 className={styles.sectionTitle}>Basic Property Details</h2>
                <p className={styles.sectionSubtitle}>
                  Specify the type of listing, property category, and primary location.
                </p>
              </div>

              {/* Building Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Building Type <span className={styles.required}>*</span>
                </label>
                <div className={styles.radioPillGroup}>
                  {BUILDING_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      className={`${styles.radioPill} ${formData.buildingType === bt ? styles.radioPillActive : ''}`}
                      onClick={() => update('buildingType')(bt)}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listing Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Would you like to? <span className={styles.required}>*</span>
                </label>
                <div className={styles.radioPillGroup}>
                  {LISTING_TYPES.map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      className={`${styles.radioPill} ${formData.listingType === lt ? styles.radioPillActive : ''}`}
                      onClick={() => {
                        update('listingType')(lt);
                        if (lt !== 'Sell') update('propertyStatus')('');
                        else update('propertyStatus')('Ready to Move');
                      }}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Are you an? <span className={styles.required}>*</span>
                </label>
                <div className={styles.radioPillGroup}>
                  {USER_TYPES.map((ut) => (
                    <button
                      key={ut}
                      type="button"
                      className={`${styles.radioPill} ${formData.userType === ut ? styles.radioPillActive : ''}`}
                      onClick={() => update('userType')(ut)}
                    >
                      {ut}
                    </button>
                  ))}
                </div>
              </div>

              {/* Builder / Developer Name (When user is Builder) */}
              {formData.userType === 'Builder' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Builder / Developer Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Prestige Group, Godrej Properties, Brigade"
                    value={formData.builderName}
                    onChange={(e) => update('builderName')(e.target.value)}
                  />
                </div>
              )}

              {/* Email & Phone */}
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={(e) => update('email')(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Contact Phone <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.verifiedPhoneBox}>
                    <ShieldCheck size={18} color="#15803d" />
                    <input
                      type="tel"
                      className={styles.verifiedInput}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => update('phone')(e.target.value)}
                    />
                    <span className={styles.verifiedTag}>Verified</span>
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Property Type <span className={styles.required}>*</span>
                </label>
                <div className={styles.radioPillGroup}>
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      className={`${styles.radioPill} ${formData.propertyType === pt ? styles.radioPillActive : ''}`}
                      onClick={() => {
                        update('propertyType')(pt);
                        if (pt === 'Plot') {
                          update('propertyAge')('');
                          update('bedroom')('');
                          update('bathroom')('');
                          update('balconies')('');
                          update('doorFacing')('');
                          update('furnishingStatus')('');
                          update('amenities')([]);
                          update('totalFloors')('');
                          update('selectedFloor')('');
                        } else {
                          update('plotType')('');
                          update('plotSize')('');
                          update('customPlotSize')('');
                          update('roadFacing')('');
                          update('plotAge')('');
                          update('plotDimension')('');
                        }
                      }}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Property Name / Project Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Prestige Silver Crest / Green Acres Villa"
                  value={formData.propertyName}
                  onChange={(e) => update('propertyName')(e.target.value)}
                />
              </div>

              {/* Property Age (If not Plot) */}
              {formData.propertyType !== 'Plot' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Property Age (Years) (Optional)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="e.g. 2"
                    value={formData.propertyAge}
                    onChange={(e) => update('propertyAge')(e.target.value)}
                  />
                </div>
              )}

              {/* Property Status (Only for Sell) */}
              {formData.listingType === 'Sell' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Property Status <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.radioPillGroup}>
                    {PROPERTY_STATUS.map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        className={`${styles.radioPill} ${formData.propertyStatus === ps ? styles.radioPillActive : ''}`}
                        onClick={() => update('propertyStatus')(ps)}
                      >
                        {ps}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Location Pin Field (like mobile app) ── */}
              <div className={styles.formGroup}>
                <div className={styles.locationHeaderRow}>
                  <label className={styles.label} style={{ marginBottom: 0 }}>
                    Location Pin <span className={styles.required}>*</span>
                  </label>
                  <button
                    type="button"
                    className={styles.quickGpsBtn}
                    onClick={handleUseCurrentLocation}
                    disabled={fetchingGps}
                  >
                    {fetchingGps ? (
                      <>
                        <Loader2 size={13} className={styles.spin} />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair size={13} color="#134E3A" />
                        <span>Use Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  className={`${styles.locationPickerCard} ${formData.lat && formData.lng ? styles.locationPickerCardActive : ''}`}
                  onClick={() => setIsMapOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.locationPickerLeft}>
                    <div className={`${styles.pinIconCircle} ${formData.lat && formData.lng ? styles.pinIconCircleActive : ''}`}>
                      <MapPin size={22} color={formData.lat && formData.lng ? '#15803d' : '#134E3A'} />
                    </div>
                    <div>
                      <div className={styles.locationPickerTitle}>
                        {formData.lat && formData.lng
                          ? `Pinned on Map (${Number(formData.lat).toFixed(4)}, ${Number(formData.lng).toFixed(4)})`
                          : 'Click to select Location on Map'}
                      </div>
                      <div className={styles.locationPickerSub}>
                        {formData.lat && formData.lng
                          ? 'Tap to change pin or select another spot'
                          : 'Pins property & auto-fills address below'}
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.locationBadge} ${formData.lat && formData.lng ? styles.locationBadgeActive : ''}`}>
                    {formData.lat && formData.lng ? 'Change Pin' : 'Open Map'}
                  </div>
                </div>
              </div>

              {/* City Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  City <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.select}
                    value={formData.city}
                    onChange={(e) => {
                      const c = e.target.value;
                      update('city')(c);
                      update('locality')('');
                    }}
                  >
                    <option value="">Select City</option>
                    {CITY_NAMES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Locality Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Locality / Neighborhood <span className={styles.required}>*</span>
                </label>
                {!formData.city ? (
                  <p className={styles.helperNotice}>Please select a city above to choose locality.</p>
                ) : (
                  <>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.select}
                        value={formData.locality}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__other__') {
                            setCustomLocalityInput('');
                          }
                          update('locality')(val);
                        }}
                      >
                        <option value="">Select Locality in {formData.city}</option>
                        {/* Auto-filled from map pin if not in predefined list */}
                        {formData.locality && !cityLocalities.includes(formData.locality) && formData.locality !== '__other__' && (
                          <option value={formData.locality}>📍 {formData.locality} (From Map Pin)</option>
                        )}
                        {cityLocalities.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                        <option value="__other__">+ Other / Enter Custom Locality</option>
                      </select>
                    </div>

                    {formData.locality && formData.lat != null && formData.lng != null && formData.locality !== '__other__' && (
                      <div style={{ marginTop: '6px', fontSize: '12.5px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={13} color="#15803d" />
                        <span>Locality auto-filled from map pin: <strong>{formData.locality}</strong></span>
                      </div>
                    )}

                    {formData.locality === '__other__' && (
                      <div className={styles.subInputRow} style={{ marginTop: '8px' }}>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder={`Enter custom locality in ${formData.city}`}
                          value={customLocalityInput}
                          onChange={(e) => setCustomLocalityInput(e.target.value)}
                          onBlur={() => {
                            if (customLocalityInput.trim()) {
                              update('locality')(customLocalityInput.trim());
                            }
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Address */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Street Address & Landmark <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="e.g. Near MG Road, Opposite Metro Station, Koramangala"
                  value={formData.address}
                  onChange={(e) => update('address')(e.target.value)}
                />
              </div>

              {/* Postal Code */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Postal Code (PIN) <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className={styles.input}
                  placeholder="e.g. 560034"
                  value={formData.postalCode}
                  onChange={(e) => update('postalCode')(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: Property Details
             ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className={styles.stepSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>Step 2 of 5</span>
                <h2 className={styles.sectionTitle}>Property Specifications</h2>
                <p className={styles.sectionSubtitle}>
                  Provide configuration details, dimensions, facing, and amenities.
                </p>
              </div>

              {formData.propertyType === 'Plot' ? (
                /* Plot Configuration */
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Plot Type <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {PLOT_TYPES.map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          className={`${styles.radioPill} ${formData.plotType === pt ? styles.radioPillActive : ''}`}
                          onClick={() => update('plotType')(pt)}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Plot Size <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {PLOT_SIZES.map((ps) => (
                        <button
                          key={ps}
                          type="button"
                          className={`${styles.radioPill} ${formData.plotSize === ps ? styles.radioPillActive : ''}`}
                          onClick={() => {
                            update('plotSize')(ps);
                            if (ps !== 'Other') update('customPlotSize')('');
                          }}
                        >
                          {ps}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.plotSize === 'Other' && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Custom Plot Size <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. 40×60 or 2400 sq.ft"
                        value={formData.customPlotSize}
                        onChange={(e) => update('customPlotSize')(e.target.value)}
                      />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Road Facing <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {DIRECTIONS.map((dir) => (
                        <button
                          key={dir}
                          type="button"
                          className={`${styles.radioPill} ${formData.roadFacing === dir ? styles.radioPillActive : ''}`}
                          onClick={() => update('roadFacing')(dir)}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Plot Age (Years) <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="e.g. 1"
                      value={formData.plotAge}
                      onChange={(e) => update('plotAge')(e.target.value)}
                    />
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Plot Dimension <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="e.g. 1200"
                        value={formData.plotDimension}
                        onChange={(e) => update('plotDimension')(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Dimension Unit <span className={styles.required}>*</span>
                      </label>
                      <select
                        className={styles.select}
                        value={formData.plotDimensionUnit}
                        onChange={(e) => update('plotDimensionUnit')(e.target.value)}
                      >
                        {DIM_UNITS.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Residential / Apartment Configuration */
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Bedrooms <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {BEDROOMS.map((bed) => (
                        <button
                          key={bed}
                          type="button"
                          className={`${styles.radioPill} ${formData.bedroom === bed ? styles.radioPillActive : ''}`}
                          onClick={() => update('bedroom')(bed)}
                        >
                          {bed}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Bathrooms <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {BATHROOMS.map((bath) => (
                        <button
                          key={bath}
                          type="button"
                          className={`${styles.radioPill} ${formData.bathroom === bath ? styles.radioPillActive : ''}`}
                          onClick={() => update('bathroom')(bath)}
                        >
                          {bath} Bath{Number(bath) > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Balconies <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {BALCONIES.map((balc) => (
                        <button
                          key={balc}
                          type="button"
                          className={`${styles.radioPill} ${formData.balconies === balc ? styles.radioPillActive : ''}`}
                          onClick={() => update('balconies')(balc)}
                        >
                          {balc} Balcon{Number(balc) === 1 ? 'y' : 'ies'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Door Facing <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {DIRECTIONS.map((dir) => (
                        <button
                          key={dir}
                          type="button"
                          className={`${styles.radioPill} ${formData.doorFacing === dir ? styles.radioPillActive : ''}`}
                          onClick={() => update('doorFacing')(dir)}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Furnishing Status <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.radioPillGroup}>
                      {FURNISHING.map((furn) => (
                        <button
                          key={furn}
                          type="button"
                          className={`${styles.radioPill} ${formData.furnishingStatus === furn ? styles.radioPillActive : ''}`}
                          onClick={() => update('furnishingStatus')(furn)}
                        >
                          {furn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Multi-Select */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Amenities Available ({formData.amenities.length} selected)
                    </label>
                    <div className={styles.amenityGrid}>
                      {AMENITIES_LIST.map((am) => {
                        const isSelected = formData.amenities.includes(am);
                        return (
                          <button
                            key={am}
                            type="button"
                            className={`${styles.amenityChip} ${isSelected ? styles.amenityChipActive : ''}`}
                            onClick={() => {
                              const next = isSelected
                                ? formData.amenities.filter((item) => item !== am)
                                : [...formData.amenities, am];
                              update('amenities')(next);
                            }}
                          >
                            {isSelected && <Check size={14} />}
                            <span>{am}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Project Floors & Possession Date */}
                  <div className={styles.grid2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Total Project Floors (Optional)
                      </label>
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="e.g. 14"
                        value={formData.totalProjectFloors}
                        onChange={(e) => update('totalProjectFloors')(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Possession Date (Optional)
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Ready to Move, or Dec 2026"
                        value={formData.possessionDate}
                        onChange={(e) => update('possessionDate')(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: Price & Details
             ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className={styles.stepSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>Step 3 of 5</span>
                <h2 className={styles.sectionTitle}>Pricing & Floor Details</h2>
                <p className={styles.sectionSubtitle}>
                  Set your expected price, recurring maintenance, and floor level.
                </p>
              </div>

              {formData.propertyType !== 'Plot' && (
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Total Floors in Building <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="e.g. 5"
                      value={formData.totalFloors}
                      onChange={(e) => update('totalFloors')(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Your Floor (Selected Floor) <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="e.g. 3"
                      value={formData.selectedFloor}
                      onChange={(e) => update('selectedFloor')(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Price with Unit selector and live preview */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Expected Price <span className={styles.required}>*</span>
                </label>
                <div className={styles.priceUnitPills}>
                  {['Lac', 'Cr', '₹ Total'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={`${styles.priceUnitPill} ${formData.priceUnit === u ? styles.priceUnitPillActive : ''}`}
                      onClick={() => update('priceUnit')(u)}
                    >
                      {u === 'Lac' ? '₹ Lac' : u === 'Cr' ? '₹ Cr' : '₹ Total'}
                    </button>
                  ))}
                </div>

                <div className={styles.priceInputBox}>
                  <span className={styles.currencySymbol}>₹</span>
                  <input
                    type="number"
                    step="any"
                    className={styles.priceInputControl}
                    placeholder={
                      formData.priceUnit === 'Cr'
                        ? 'e.g. 1.25'
                        : formData.priceUnit === '₹ Total'
                        ? 'e.g. 7500000'
                        : 'e.g. 75'
                    }
                    value={formData.price}
                    onChange={(e) => update('price')(e.target.value)}
                  />
                  <span className={styles.unitTag}>
                    {formData.priceUnit === '₹ Total' ? 'Total' : formData.priceUnit}
                  </span>
                </div>

                {formData.price && (
                  <div className={styles.pricePreviewCard}>
                    <span>Display Price:</span>
                    <strong className={styles.pricePreviewVal}>
                      {formatPriceDisplay(formData.price, formData.priceUnit)}
                    </strong>
                  </div>
                )}
              </div>

              {/* Maintenance Charge */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Maintenance Charge (₹ / month) (Optional)
                </label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="e.g. 2500"
                  value={formData.maintenanceCharge}
                  onChange={(e) => update('maintenanceCharge')(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>About Your Property (Optional)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Highlight key advantages, ventilation, nearby landmarks, schools, metro stations, etc."
                  value={formData.description}
                  onChange={(e) => update('description')(e.target.value)}
                />
              </div>

              {/* Property Highlights */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Property Highlights (Optional)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="e.g. 100% Vastu Compliant, Corner Flat, Near Metro, Park Facing"
                  value={formData.propertyHighlights}
                  onChange={(e) => update('propertyHighlights')(e.target.value)}
                />
              </div>

              {/* RERA Registration Number */}
              <div className={styles.formGroup}>
                <label className={styles.label}>RERA Registration Number (Optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. PRM/KA/RERA/1251/310/PR/171015/000456"
                  value={formData.reraNumber}
                  onChange={(e) => update('reraNumber')(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 4: Photos & Video
             ══════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className={styles.stepSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>Step 4 of 5</span>
                <h2 className={styles.sectionTitle}>Property Photographs</h2>
                <p className={styles.sectionSubtitle}>
                  Add up to {MAX_PHOTOS} high-resolution photos. The first image will be set as the main cover photo.
                </p>
              </div>

              <div className={styles.photoGrid}>
                {formData.images.map((url, idx) => (
                  <div key={idx} className={styles.photoSlot}>
                    <img
                      src={formData._imagePreviews[idx] || url}
                      alt={`Upload slot ${idx + 1}`}
                      className={styles.photoImg}
                    />
                    <div className={styles.photoBadge}>
                      Photo {idx + 1} {idx === 0 && '(Cover)'}
                    </div>
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={() => removePhoto(idx)}
                      title="Remove Photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {formData.images.length < MAX_PHOTOS && (
                  <div
                    className={`${styles.photoAddSlot} ${uploading ? styles.photoAddSlotLoading : ''}`}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className={styles.hiddenFile}
                      onChange={handlePhotoSelect}
                    />
                    {uploading ? (
                      <div className={styles.uploadSpinnerWrap}>
                        <Loader2 size={28} className={styles.spinnerIcon} />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} color="#134E3A" />
                        <span className={styles.addPhotoTitle}>Add Photo</span>
                        <span className={styles.addPhotoSub}>
                          PNG, JPG up to 8MB ({MAX_PHOTOS - formData.images.length} left)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {formData.images.length === 0 && !uploading && (
                <div className={styles.photoAlert}>
                  <AlertCircle size={16} color="#DC2626" />
                  <span>Please upload at least 1 photo to proceed to review.</span>
                </div>
              )}

              {/* Floor Plan Images */}
              <div className={styles.formGroup} style={{ marginTop: '28px' }}>
                <label className={styles.label}>
                  Floor Plan Images (Optional)
                </label>
                <p className={styles.sectionSubtitle} style={{ marginTop: '-4px', marginBottom: '12px' }}>
                  Upload blueprints or 2D/3D floor layout diagrams (up to {MAX_FLOOR_PLANS}).
                </p>

                <div className={styles.photoGrid}>
                  {formData.floorPlanImages.map((url, idx) => (
                    <div key={idx} className={styles.photoSlot}>
                      <img
                        src={formData._floorPlanPreviews[idx] || url}
                        alt={`Floor plan ${idx + 1}`}
                        className={styles.photoImg}
                      />
                      <div className={styles.photoBadge}>
                        Floor Plan {idx + 1}
                      </div>
                      <button
                        type="button"
                        className={styles.removePhotoBtn}
                        onClick={() => removeFloorPlan(idx)}
                        title="Remove Floor Plan"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {formData.floorPlanImages.length < MAX_FLOOR_PLANS && (
                    <div
                      className={`${styles.photoAddSlot} ${uploadingFloorPlan ? styles.photoAddSlotLoading : ''}`}
                      onClick={() => !uploadingFloorPlan && floorPlanInputRef.current?.click()}
                    >
                      <input
                        ref={floorPlanInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.hiddenFile}
                        onChange={handleFloorPlanSelect}
                      />
                      {uploadingFloorPlan ? (
                        <div className={styles.uploadSpinnerWrap}>
                          <Loader2 size={28} className={styles.spinnerIcon} />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} color="#134E3A" />
                          <span className={styles.addPhotoTitle}>Add Floor Plan</span>
                          <span className={styles.addPhotoSub}>
                            Diagram or Layout ({MAX_FLOOR_PLANS - formData.floorPlanImages.length} left)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Video Link */}
              <div className={styles.formGroup} style={{ marginTop: '24px' }}>
                <label className={styles.label}>
                  Property Video (Tour / YouTube Link) (Optional)
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or Video Tour URL"
                  value={formData.propertyVideo}
                  onChange={(e) => update('propertyVideo')(e.target.value)}
                />
              </div>

              {/* Property Brochure Link */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Property Brochure (PDF Link) (Optional)
                </label>
                <input
                  type="url"
                  className={styles.input}
                  placeholder="e.g. https://example.com/brochure.pdf or Drive link"
                  value={formData.propertyBrochure}
                  onChange={(e) => update('propertyBrochure')(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 5: Details Info (Review & Submit)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className={styles.stepSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.stepBadge}>Step 5 of 5</span>
                <h2 className={styles.sectionTitle}>Review Your Listing</h2>
                <p className={styles.sectionSubtitle}>
                  Please verify all information before submitting for team review and publishing.
                </p>
              </div>

              <div className={styles.reviewCards}>
                {/* 1. Basic Details */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <h3>📋 Basic Details</h3>
                    <button type="button" className={styles.editStepLink} onClick={() => setStep(1)}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Building Type</span>
                      <strong className={styles.rVal}>{formData.buildingType}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Listing Type</span>
                      <strong className={styles.rVal}>For {formData.listingType}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Listed By</span>
                      <strong className={styles.rVal}>{formData.userType}</strong>
                    </div>
                    {formData.userType === 'Builder' && formData.builderName && (
                      <div className={styles.reviewRow}>
                        <span className={styles.rLabel}>Builder / Developer</span>
                        <strong className={styles.rVal}>{formData.builderName}</strong>
                      </div>
                    )}
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Email</span>
                      <strong className={styles.rVal}>{formData.email}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Contact Phone</span>
                      <strong className={styles.rVal}>+91 {formData.phone} (Verified)</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Property Type</span>
                      <strong className={styles.rVal}>{formData.propertyType}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Property Name</span>
                      <strong className={styles.rVal}>{formData.propertyName}</strong>
                    </div>
                    {formData.listingType === 'Sell' && (
                      <div className={styles.reviewRow}>
                        <span className={styles.rLabel}>Status</span>
                        <strong className={styles.rVal}>{formData.propertyStatus}</strong>
                      </div>
                    )}
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Location</span>
                      <strong className={styles.rVal}>{formData.locality}, {formData.city}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Address</span>
                      <strong className={styles.rVal}>{formData.address}</strong>
                    </div>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Postal Code</span>
                      <strong className={styles.rVal}>{formData.postalCode}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Property Details */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <h3>🏗️ Property Specifications</h3>
                    <button type="button" className={styles.editStepLink} onClick={() => setStep(2)}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewGrid}>
                    {formData.propertyType === 'Plot' ? (
                      <>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Plot Type</span>
                          <strong className={styles.rVal}>{formData.plotType}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Plot Size</span>
                          <strong className={styles.rVal}>
                            {formData.plotSize === 'Other' ? formData.customPlotSize : formData.plotSize}
                          </strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Facing</span>
                          <strong className={styles.rVal}>{formData.roadFacing}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Plot Age</span>
                          <strong className={styles.rVal}>{formData.plotAge} yrs</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Dimension</span>
                          <strong className={styles.rVal}>{formData.plotDimension} {formData.plotDimensionUnit}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Configuration</span>
                          <strong className={styles.rVal}>{formData.bedroom}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Bathrooms</span>
                          <strong className={styles.rVal}>{formData.bathroom}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Balconies</span>
                          <strong className={styles.rVal}>{formData.balconies}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Door Facing</span>
                          <strong className={styles.rVal}>{formData.doorFacing}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Furnishing</span>
                          <strong className={styles.rVal}>{formData.furnishingStatus}</strong>
                        </div>
                        <div className={styles.reviewRowFull}>
                          <span className={styles.rLabel}>Amenities</span>
                          <strong className={styles.rVal}>
                            {formData.amenities.length > 0 ? formData.amenities.join(', ') : 'None specified'}
                          </strong>
                        </div>
                        {formData.totalProjectFloors && (
                          <div className={styles.reviewRow}>
                            <span className={styles.rLabel}>Total Project Floors</span>
                            <strong className={styles.rVal}>{formData.totalProjectFloors}</strong>
                          </div>
                        )}
                        {formData.possessionDate && (
                          <div className={styles.reviewRow}>
                            <span className={styles.rLabel}>Possession Date</span>
                            <strong className={styles.rVal}>{formData.possessionDate}</strong>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Pricing & Floors */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <h3>💰 Price & Floor</h3>
                    <button type="button" className={styles.editStepLink} onClick={() => setStep(3)}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewRow}>
                      <span className={styles.rLabel}>Expected Price</span>
                      <strong className={styles.rValHighlight}>
                        {formatPriceDisplay(formData.price, formData.priceUnit)}
                      </strong>
                    </div>
                    {formData.propertyType !== 'Plot' && (
                      <>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Total Floors</span>
                          <strong className={styles.rVal}>{formData.totalFloors}</strong>
                        </div>
                        <div className={styles.reviewRow}>
                          <span className={styles.rLabel}>Selected Floor</span>
                          <strong className={styles.rVal}>{formData.selectedFloor}</strong>
                        </div>
                      </>
                    )}
                    {formData.maintenanceCharge && (
                      <div className={styles.reviewRow}>
                        <span className={styles.rLabel}>Maintenance</span>
                        <strong className={styles.rVal}>₹ {formData.maintenanceCharge} / month</strong>
                      </div>
                    )}
                    {formData.propertyHighlights && (
                      <div className={styles.reviewRowFull}>
                        <span className={styles.rLabel}>Property Highlights</span>
                        <strong className={styles.rVal}>{formData.propertyHighlights}</strong>
                      </div>
                    )}
                    {formData.reraNumber && (
                      <div className={styles.reviewRow}>
                        <span className={styles.rLabel}>RERA Number</span>
                        <strong className={styles.rVal}>{formData.reraNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Photos & Documents */}
                <div className={styles.reviewCard}>
                  <div className={styles.reviewCardHeader}>
                    <h3>📸 Photos & Documents</h3>
                    <button type="button" className={styles.editStepLink} onClick={() => setStep(4)}>
                      Edit
                    </button>
                  </div>
                  <div className={styles.reviewPhotoRow}>
                    {formData.images.map((url, i) => (
                      <div key={i} className={styles.reviewPhotoThumb}>
                        <img src={url} alt={`Upload thumbnail ${i + 1}`} />
                        {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                      </div>
                    ))}
                  </div>

                  {formData.floorPlanImages.length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <span className={styles.rLabel} style={{ display: 'block', marginBottom: '8px' }}>
                        Floor Plans ({formData.floorPlanImages.length})
                      </span>
                      <div className={styles.reviewPhotoRow}>
                        {formData.floorPlanImages.map((url, i) => (
                          <div key={i} className={styles.reviewPhotoThumb}>
                            <img src={url} alt={`Floor plan thumbnail ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.propertyVideo && (
                    <div className={styles.reviewRow} style={{ marginTop: '12px' }}>
                      <span className={styles.rLabel}>Property Video</span>
                      <strong className={styles.rVal}>
                        <a href={formData.propertyVideo} target="_blank" rel="noopener noreferrer" style={{ color: '#134E3A', textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {formData.propertyVideo}
                        </a>
                      </strong>
                    </div>
                  )}

                  {formData.propertyBrochure && (
                    <div className={styles.reviewRow} style={{ marginTop: '6px' }}>
                      <span className={styles.rLabel}>Brochure (PDF)</span>
                      <strong className={styles.rVal}>
                        <a href={formData.propertyBrochure} target="_blank" rel="noopener noreferrer" style={{ color: '#134E3A', textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {formData.propertyBrochure}
                        </a>
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Form Navigation Actions ───────────────────────────────────────── */}
          <div className={styles.actionRow}>
            {step > 1 ? (
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleExitPress}
                disabled={isSubmitting}
              >
                <X size={15} color="#dc2626" />
                <span>Exit Listing</span>
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                className={styles.nextBtn}
                onClick={handleNext}
              >
                <span>Next: {STEPS[step]?.title}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className={styles.spinnerIcon} />
                    <span>Submitting Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit Property Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Location Map Picker Modal (Leaflet iframe + OpenStreetMap) ────── */}
      <MapPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleMapConfirm}
        initialCoords={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
        initialCity={formData.city}
      />

      {/* ── Keep Editing / Exit confirmation modal ───────────────────────── */}
      {showExitConfirm && (
        <div className={styles.exitOverlay}>
          <div className={styles.exitCard}>
            <div className={styles.exitIconWrap}>
              <AlertCircle size={36} color="#b91c1c" />
            </div>
            <h2 className={styles.exitTitle}>Exit Listing?</h2>
            <p className={styles.exitMsg}>
              You have unsaved changes. If you leave now, your property information will not be saved.
            </p>
            <div className={styles.exitActions}>
              <button
                className={styles.exitKeepBtn}
                onClick={handleKeepEditing}
              >
                Keep Editing
              </button>
              <button
                className={styles.exitConfirmBtn}
                onClick={handleConfirmExit}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
