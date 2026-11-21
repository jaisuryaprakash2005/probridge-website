import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Crosshair, MapPin, Check, Loader2 } from 'lucide-react';
import styles from './MapPickerModal.module.css';

export default function MapPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialCoords = null,
  initialCity = '',
}) {
  const [loading, setLoading] = useState(true);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const iframeRef = useRef(null);

  const CITY_COORDS = {
    bengaluru: { lat: 12.9716, lng: 77.5946 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    hyderabad: { lat: 17.3850, lng: 78.4867 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    delhi: { lat: 28.6139, lng: 77.2090 },
    kochi: { lat: 9.9312, lng: 76.2673 },
    coimbatore: { lat: 11.0168, lng: 76.9558 },
    pune: { lat: 18.5204, lng: 73.8567 },
    kolkata: { lat: 22.5726, lng: 88.3639 },
    ahmedabad: { lat: 23.0225, lng: 72.5714 },
    noida: { lat: 28.5355, lng: 77.3910 },
    gurgaon: { lat: 28.4595, lng: 77.0266 },
    mysore: { lat: 12.2958, lng: 76.6394 },
    trivandrum: { lat: 8.5241, lng: 76.9366 },
    vijayawada: { lat: 16.5062, lng: 80.6480 },
    bhopal: { lat: 23.2599, lng: 77.4126 },
    bhubaneswar: { lat: 20.2961, lng: 85.8245 },
  };
  const cityKey = (initialCity || '').trim().toLowerCase();
  const cityDefault = CITY_COORDS[cityKey];
  const defaultLat = initialCoords?.lat || (cityDefault ? cityDefault.lat : 13.0827);
  const defaultLng = initialCoords?.lng || (cityDefault ? cityDefault.lng : 80.2707);

  // Listen to messages from the map iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'LOCATION_PIN_UPDATED') {
        setSelectedLocation(e.data.payload);
        setLoading(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Forward search place using Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const q = initialCity ? `${searchQuery.trim()}, ${initialCity}, India` : `${searchQuery.trim()}, India`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5&addressdetails=1`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchResults([]);
    setSearchQuery(item.display_name.split(',')[0]);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SET_MAP_CENTER', payload: { lat, lng } },
        '*'
      );
    }
  };

  // Browser GPS detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFetchingGps(false);
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'SET_MAP_CENTER', payload: { lat, lng } },
            '*'
          );
        }
      },
      (err) => {
        setFetchingGps(false);
        alert('Could not retrieve your location. Please check browser location permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Embedded Leaflet HTML with draggable pin & reverse geocode
  const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
    .custom-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #134E3A;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    }
    .custom-pin::after {
      content: '';
      width: 12px;
      height: 12px;
      background: #ffffff;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var startLat = ${defaultLat};
    var startLng = ${defaultLng};

    var map = L.map('map', {
      zoomControl: true
    }).setView([startLat, startLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    var pinIcon = L.divIcon({
      className: 'custom-pin-wrap',
      html: '<div class="custom-pin"></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    var marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: pinIcon
    }).addTo(map);

    async function reverseGeocode(lat, lng) {
      try {
        var res = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&addressdetails=1');
        var data = await res.json();
        var a = data.address || {};
        var rawCity = a.city || a.town || a.municipality || a.city_district || a.state_district || a.county || '';
        var city = rawCity.replace(/\s+(District|Urban|Rural|Corporation)$/i, '').trim();
        var locality = a.suburb || a.neighbourhood || a.residential || a.subdistrict || a.quarter || a.city_district || a.borough || a.village || a.hamlet || a.road || '';
        var postalCode = a.postcode || '';
        var fullAddress = data.display_name || '';

        // If locality is not found directly, extract from display_name tokens
        if (!locality && fullAddress) {
          var tokens = fullAddress.split(',').map(function(s) { return s.trim(); });
          for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (t && !/^\d+$/.test(t) && t.toLowerCase() !== city.toLowerCase() && !/^(india|tamil nadu|karnataka|telangana|maharashtra|kerala|andhra pradesh|gujarat|delhi)$/i.test(t)) {
              locality = t;
              break;
            }
          }
        }

        // Clean display address
        var parts = fullAddress.split(', ');
        if (parts.length > 2) fullAddress = parts.slice(0, 4).join(', ');

        window.parent.postMessage({
          type: 'LOCATION_PIN_UPDATED',
          payload: {
            lat: lat,
            lng: lng,
            city: city,
            locality: locality,
            postalCode: postalCode,
            address: fullAddress,
            displayName: data.display_name || ''
          }
        }, '*');
      } catch (err) {
        window.parent.postMessage({
          type: 'LOCATION_PIN_UPDATED',
          payload: {
            lat: lat,
            lng: lng,
            city: '',
            locality: '',
            postalCode: '',
            address: 'Pinned at ' + lat.toFixed(4) + ', ' + lng.toFixed(4)
          }
        }, '*');
      }
    }

    // Trigger initial geocode
    reverseGeocode(startLat, startLng);

    // Map click moves pin
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Marker drag moves pin
    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    // Listen for center updates from parent
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'SET_MAP_CENTER') {
        var lat = e.data.payload.lat;
        var lng = e.data.payload.lng;
        map.flyTo([lat, lng], 16, { duration: 0.8 });
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      }
    });
  </script>
</body>
</html>`;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconCircle}>
              <MapPin size={20} color="#134E3A" />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Pin Property Location</h3>
              <p className={styles.modalSub}>
                Click anywhere on the map or drag the pin. Address, city & locality will be auto-filled.
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Search & GPS Bar */}
        <div className={styles.searchBarRow}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search place, locality, landmark (e.g. Medavakkam, Anna Nagar, HSR Layout)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && <Loader2 size={16} className={styles.spinner} />}
            <button type="submit" className={styles.searchSubmitBtn}>
              Search
            </button>
          </form>

          <button
            type="button"
            className={styles.gpsBtn}
            onClick={handleUseCurrentLocation}
            disabled={fetchingGps}
            title="Locate my GPS position"
          >
            {fetchingGps ? (
              <Loader2 size={15} className={styles.spinner} />
            ) : (
              <Crosshair size={15} />
            )}
            <span>My Location</span>
          </button>
        </div>

        {/* Search Autocomplete Results */}
        {searchResults.length > 0 && (
          <div className={styles.searchResultsDropdown}>
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.searchResultItem}
                onClick={() => selectSearchResult(item)}
              >
                <MapPin size={15} color="#134E3A" />
                <span className={styles.resultText}>{item.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Interactive Map Area */}
        <div className={styles.mapFrameWrap}>
          {loading && (
            <div className={styles.mapLoadingOverlay}>
              <Loader2 size={32} className={styles.spinner} />
              <span>Loading interactive map...</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Property Location Pin Map"
            srcDoc={mapHtml}
            className={styles.mapIframe}
          />
        </div>

        {/* Bottom Confirmation Bar */}
        <div className={styles.confirmBar}>
          <div className={styles.previewBox}>
            <div className={styles.previewLocality}>
              <MapPin size={16} color="#134E3A" />
              <strong>
                {selectedLocation?.locality
                  ? `${selectedLocation.locality}${selectedLocation.city ? `, ${selectedLocation.city}` : ''}`
                  : 'Selected Spot'}
              </strong>
              {selectedLocation?.postalCode && (
                <span className={styles.pinTag}>PIN: {selectedLocation.postalCode}</span>
              )}
            </div>
            <div className={styles.previewAddr}>
              {selectedLocation?.address || 'Click anywhere on map to pin exact location.'}
            </div>
          </div>

          <div className={styles.confirmActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleConfirm}
              disabled={!selectedLocation}
            >
              <Check size={16} />
              <span>Apply This Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

