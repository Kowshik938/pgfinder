import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from '@vis.gl/react-google-maps';
import { MapPin, Star, Users, ChevronRight, X } from 'lucide-react';
import { PGItem } from './PGCard.tsx';
import { GOOGLE_MAPS_API_KEY, MAPS_USAGE_ATTRIBUTION, DEMO_MAP_ID } from '../lib/mapsConfig.ts';

interface MapExplorerProps {
  pgList: PGItem[];
  onSelectPG: (pg: PGItem) => void;
}

export const InteractiveMapExplorer: React.FC<MapExplorerProps> = ({ pgList, onSelectPG }) => {
  const [selectedPG, setSelectedPG] = useState<PGItem | null>(null);

  // Default center around Hyderabad / Bangalore
  const defaultCenter = {
    lat: pgList[0]?.latitude || 17.4485,
    lng: pgList[0]?.longitude || 78.3908,
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={DEMO_MAP_ID}
          style={{ width: '100%', height: '100%' }}
          defaultCenter={defaultCenter}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          internalUsageAttributionIds={MAPS_USAGE_ATTRIBUTION}
        >
          {pgList.map((pg) => {
            if (!pg.latitude || !pg.longitude) return null;
            const isSelected = selectedPG?.id === pg.id;

            return (
              <AdvancedMarker
                key={pg.id}
                position={{ lat: pg.latitude, lng: pg.longitude }}
                onClick={() => setSelectedPG(pg)}
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xl border cursor-pointer transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-white scale-110 shadow-amber-400/50'
                      : 'bg-slate-900/90 text-white border-indigo-500/50 hover:border-amber-400 hover:scale-105'
                  }`}
                >
                  <span className="text-[10px]">₹</span>
                  <span>{(pg.monthlyRent / 1000).toFixed(0)}k</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {selectedPG && selectedPG.latitude && selectedPG.longitude && (
            <InfoWindow
              position={{ lat: selectedPG.latitude, lng: selectedPG.longitude }}
              onCloseClick={() => setSelectedPG(null)}
            >
              <div className="p-2 text-slate-900 max-w-[220px]">
                {selectedPG.images?.[0]?.imageUrl && (
                  <img
                    src={selectedPG.images[0].imageUrl}
                    alt={selectedPG.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="font-bold text-xs line-clamp-1">{selectedPG.name}</div>
                <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                  {selectedPG.locality || selectedPG.address}, {selectedPG.city}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                  <div className="text-xs font-black text-indigo-700">
                    ₹{selectedPG.monthlyRent.toLocaleString()}
                    <span className="text-[10px] font-normal text-slate-500">/mo</span>
                  </div>
                  <button
                    onClick={() => onSelectPG(selectedPG)}
                    className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    View PG
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Info Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-white flex items-center gap-2 shadow-xl pointer-events-none">
        <MapPin className="w-3.5 h-3.5 text-amber-400" />
        <span>
          Showing <strong>{pgList.length}</strong> PGs on Google Maps
        </span>
      </div>
    </div>
  );
};
