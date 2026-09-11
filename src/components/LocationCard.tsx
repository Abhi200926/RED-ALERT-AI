import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle } from 'lucide-react';
import { PRESET_LOCATIONS } from '../data/mockDisasters';

interface LocationCardProps {
  currentLocationName: string;
  latitude: number;
  longitude: number;
  onUpdateLocation: (name: string, lat: number, lng: number) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  currentLocationName,
  latitude,
  longitude,
  onUpdateLocation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoFeedback('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        onUpdateLocation(`GPS Location (${lat}°N, ${lng}°E)`, lat, lng);
        setGeoLoading(false);
        setGeoFeedback('GPS Coordinates locked successfully.');
        setIsEditing(false);
        setTimeout(() => setGeoFeedback(null), 4000);
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoFeedback('Location access was denied. You can select a preset city or enter an area manually below.');
        } else {
          setGeoFeedback('Unable to acquire precise GPS. Please select a city manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    // Approximate coordinates hash for demo fidelity
    const hash = customInput.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockLat = parseFloat(((hash % 140) - 70).toFixed(4));
    const mockLng = parseFloat(((hash % 340) - 170).toFixed(4));

    onUpdateLocation(customInput.trim(), mockLat, mockLng);
    setCustomInput('');
    setIsEditing(false);
    setGeoFeedback(null);
  };

  return (
    <div
      id="location-management-card"
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-tech uppercase tracking-wider text-slate-400">
            Selected Surveillance Zone
          </span>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <h2 id="selected-location-heading" className="text-lg font-bold text-white tracking-wide">
              {currentLocationName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="gps-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 text-rose-400 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Locating...' : 'Use Current Location'}</span>
          </button>

          <button
            id="change-location-toggle-btn"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition-all"
          >
            {isEditing ? 'Close' : 'Change Location'}
          </button>
        </div>
      </div>

      {/* Coordinate & Accuracy Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono-num text-slate-400 pt-2 border-t border-slate-800/80">
        <div>
          Lat: <span className="text-slate-200 font-semibold">{latitude}°</span>
        </div>
        <div>
          Lng: <span className="text-slate-200 font-semibold">{longitude}°</span>
        </div>
        <div className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Sensor Grid Online
        </div>
      </div>

      {/* Geolocation Feedback/Notice */}
      {geoFeedback && (
        <div
          id="geo-feedback-notice"
          className="mt-3 p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{geoFeedback}</span>
        </div>
      )}

      {/* Location Selection & Presets Drawer */}
      {isEditing && (
        <div id="location-picker-drawer" className="mt-4 pt-4 border-t border-slate-800/90 space-y-4">
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                id="custom-location-input"
                type="text"
                placeholder="Enter city, province, or district (e.g., Seattle, Vancouver, Seoul)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              id="submit-custom-location-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white tracking-wide transition-all"
            >
              Apply
            </button>
          </form>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-tech block mb-2">
              High-Risk Disaster Presets (Quick Select)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = currentLocationName === preset.name;
                return (
                  <button
                    key={preset.name}
                    id={`preset-${preset.name.split(',')[0].toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      onUpdateLocation(preset.name, preset.lat, preset.lng);
                      setIsEditing(false);
                      setGeoFeedback(null);
                    }}
                    className={`flex items-start justify-between p-2.5 rounded-xl text-left text-xs transition-all border ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="line-clamp-2 leading-tight">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
