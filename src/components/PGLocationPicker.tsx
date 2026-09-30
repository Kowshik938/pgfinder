import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  Navigation,
  Compass,
  CheckCircle2,
  Building2,
  Train,
  Crosshair,
} from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, MAPS_USAGE_ATTRIBUTION, DEMO_MAP_ID } from '../lib/mapsConfig.ts';

interface LocationData {
  city: string;
  address: string;
  locality: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  initialLocation: LocationData;
  onChange: (location: LocationData) => void;
}

// Popular tech hub coordinates in India
const CITY_PRESETS: Record<string, { lat: number; lng: number; city: string; locality: string }> = {
  'Hitec City, Hyderabad': { lat: 17.4485, lng: 78.3908, city: 'Hyderabad', locality: 'Madhapur' },
  'Gachibowli, Hyderabad': { lat: 17.4401, lng: 78.3489, city: 'Hyderabad', locality: 'Gachibowli' },
  'Koramangala, Bangalore': { lat: 12.9352, lng: 77.6245, city: 'Bangalore', locality: 'Koramangala' },
  'HSR Layout, Bangalore': { lat: 12.9121, lng: 77.6446, city: 'Bangalore', locality: 'HSR Layout' },
  'Hinjewadi, Pune': { lat: 18.5913, lng: 73.7389, city: 'Pune', locality: 'Hinjewadi' },
  'Cyber City, Gurgaon': { lat: 28.4908, lng: 77.0901, city: 'Delhi NCR', locality: 'DLF Phase 2' },
  'OMR, Chennai': { lat: 12.9249, lng: 80.2299, city: 'Chennai', locality: 'Thoraipakkam' },
};

function MapEventsHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const clickListener = map.addListener('click', (e: any) => {
      if (e.latLng) {
        onLocationChange(e.latLng.lat(), e.latLng.lng());
      }
    });
    return () => {
      clickListener?.remove();
    };
  }, [map, onLocationChange]);

  return null;
}

export const PGLocationPicker: React.FC<LocationPickerProps> = ({ initialLocation, onChange }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLocation.latitude || 17.4485,
    lng: initialLocation.longitude || 78.3908,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sync internal position if initialLocation changes
  useEffect(() => {
    if (initialLocation.latitude && initialLocation.longitude) {
      setPosition({ lat: initialLocation.latitude, lng: initialLocation.longitude });
    }
  }, [initialLocation.latitude, initialLocation.longitude]);

  const handlePresetSelect = (presetKey: string) => {
    const preset = CITY_PRESETS[presetKey];
    if (preset) {
      setPosition({ lat: preset.lat, lng: preset.lng });
      onChange({
        ...initialLocation,
        city: preset.city,
        locality: preset.locality,
        latitude: preset.lat,
        longitude: preset.lng,
        address: `${presetKey}, near major IT tech parks`,
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    setPosition({ lat: roundedLat, lng: roundedLng });
    onChange({
      ...initialLocation,
      latitude: roundedLat,
      longitude: roundedLng,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if matches preset
    const match = Object.keys(CITY_PRESETS).find((k) =>
      k.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      handlePresetSelect(match);
      return;
    }

    // Direct geocoding lookup
    setIsGeocoding(true);
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const loc = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;
          setPosition({ lat: loc.lat, lng: loc.lng });

          // Extract city from address components
          let city = initialLocation.city;
          data.results[0].address_components?.forEach((c: any) => {
            if (c.types.includes('locality')) city = c.long_name;
          });

          onChange({
            ...initialLocation,
            address: formattedAddress,
            city: city || initialLocation.city,
            locality: searchQuery.split(',')[0],
            latitude: loc.lat,
            longitude: loc.lng,
          });
        }
      })
      .catch((err) => {
        console.warn('Geocoding search notice:', err);
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Preset Quick-Select */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tech park, locality or landmark (e.g. Madhapur Hyderabad)"
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isGeocoding}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            {isGeocoding ? 'Finding...' : 'Locate'}
          </button>
        </form>
      </div>

      {/* Popular Locality Chips */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Compass className="w-3 h-3 text-amber-400" />
          Popular Tech Hubs:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(CITY_PRESETS).map((presetKey) => (
            <button
              key={presetKey}
              type="button"
              onClick={() => handlePresetSelect(presetKey)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{presetKey}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Google Maps Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-80 sm:h-96 w-full bg-slate-950">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            mapId={DEMO_MAP_ID}
            style={{ width: '100%', height: '100%' }}
            center={position}
            zoom={14}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            internalUsageAttributionIds={MAPS_USAGE_ATTRIBUTION}
          >
            <AdvancedMarker position={position}>
              <Pin
                background={'#f59e0b'}
                borderColor={'#ffffff'}
                glyphColor={'#0b0f19'}
                scale={1.2}
              />
            </AdvancedMarker>

            <MapEventsHandler onLocationChange={handleMapClick} />
          </Map>
        </APIProvider>

        {/* Map Instructions Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 flex items-center gap-1.5 shadow-lg pointer-events-none">
          <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Click anywhere on the map to pin exact PG location</span>
        </div>

        {/* Selected Coordinates Badge */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-mono text-amber-300 shadow-lg pointer-events-none">
          {position.lat.toFixed(4)}° N, {position.lng.toFixed(4)}° E
        </div>
      </div>
    </div>
  );
};
