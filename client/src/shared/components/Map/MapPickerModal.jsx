/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/shared/components/Map/MapPickerModal.jsx
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaSearch,
  FaMapMarkerAlt,
  FaCheck,
  FaSpinner,
  FaLocationArrow,
} from 'react-icons/fa';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import debounce from 'lodash/debounce';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

function ClickToSetMarker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function MapPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialQuery = '',
  initialCenter = { lat: 31.5204, lng: 74.3587 },
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [center, setCenter] = useState(initialCenter);
  const [marker, setMarker] = useState(initialCenter);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setCenter(initialCenter);
      setMarker(initialCenter);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500); // Fix Leaflet render issue
    }
  }, [isOpen]);

  const fetchSuggestions = async text => {
    if (!text || text.length < 3) return setSuggestions([]);
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 500), []);

  const handleSelect = place => {
    const pos = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    setCenter(pos);
    setMarker(pos);
    setQuery(place.display_name);
    setShowSuggestions(false);
  };

  const confirmLocation = () => {
    onSelect({
      lat: marker.lat,
      lng: marker.lng,
      googleMapLink: `https://www.google.com/maps?q=${marker.lat},${marker.lng}`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#1a365d] text-white flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FaMapMarkerAlt /> Select Location
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b relative z-500 bg-white shrink-0">
              <div className="relative">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    debouncedFetch(e.target.value);
                  }}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  placeholder="Search location..."
                  className="w-full pl-11 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#1a365d] outline-none"
                />
                {searching && (
                  <FaSpinner className="absolute right-4 top-3.5 animate-spin text-[#1a365d]" />
                )}

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto z-600">
                    {' '}
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelect(s)}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex gap-3 border-b last:border-0"
                      >
                        <FaLocationArrow className="mt-1 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {s.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {s.display_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map Container - Fixed Height */}
            <div className="flex-1 relative bg-gray-100 w-full">
              <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={center} />
                <ClickToSetMarker onPick={setMarker} />
                <Marker
                  position={marker}
                  draggable
                  eventHandlers={{
                    dragend: e => setMarker(e.target.getLatLng()),
                  }}
                />
              </MapContainer>

              {/* Bottom Confirm Panel */}
              <div className="absolute bottom-6 left-6 right-6 z-1000">
                <div className="bg-white p-4 rounded-xl shadow-lg border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-bold block text-xs text-gray-400 uppercase">
                      Selected Coordinates
                    </span>
                    {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                  </div>
                  <button
                    onClick={confirmLocation}
                    className="px-6 py-2.5 bg-[#d69e2e] text-white rounded-lg hover:bg-[#b8860b] flex items-center gap-2 font-medium w-full sm:w-auto justify-center"
                  >
                    <FaCheck /> Confirm Location
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
