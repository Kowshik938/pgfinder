import React from 'react';
import {
  Train,
  Building2,
  HeartPulse,
  ShoppingBag,
  Dumbbell,
  Footprints,
  Car,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { PGItem } from './PGCard.tsx';

interface NearbyProps {
  pg: PGItem;
}

export const NearbyAmenitiesPanel: React.FC<NearbyProps> = ({ pg }) => {
  // Generate contextual nearby landmarks based on city and locality
  const isHyd = pg.city?.toLowerCase().includes('hyderabad');
  const isBlr = pg.city?.toLowerCase().includes('bangalore');
  const isPune = pg.city?.toLowerCase().includes('pune');

  const places = [
    {
      category: 'Transit & Metro',
      name: isHyd
        ? `${pg.locality || 'Madhapur'} Metro Station (Blue Line)`
        : isBlr
        ? 'Indiranagar / Silk Board Metro'
        : 'Metro Hub & Bus Terminal',
      distance: '450 meters',
      time: '5 min walk',
      icon: Train,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      category: 'IT Tech Park',
      name: isHyd
        ? 'Cyber Towers & Mindspace IT SEZ'
        : isBlr
        ? 'Manyata / Ecospace Tech Park'
        : 'EON Free Zone / Hinjewadi Phase 1',
      distance: '950 meters',
      time: '12 min walk • 3 min drive',
      icon: Building2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      category: 'Healthcare & Hospital',
      name: isHyd
        ? 'Apollo Clinics & Medicover Hospital'
        : isBlr
        ? 'Manipal Hospital & Cloudnine'
        : 'Ruby Hall Clinic Specialist Center',
      distance: '1.2 km',
      time: '4 min drive',
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      category: 'Daily Needs & Groceries',
      name: 'Ratnadeep Supermarket & Quick Commerce Hub',
      distance: '300 meters',
      time: '4 min walk',
      icon: ShoppingBag,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      category: 'Fitness & Sports',
      name: 'Cult.fit & Golds Gym Center',
      distance: '600 meters',
      time: '7 min walk',
      icon: Dumbbell,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Footprints className="w-4 h-4 text-emerald-400" />
            Walkability & Neighborhood Transit
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Key tech landmarks, metro stations, and hospitals surrounding this property.
          </p>
        </div>

        <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5" />
          <span>Walk Score: 94/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {places.map((place, idx) => {
          const Icon = place.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${place.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  {place.category}
                </div>
                <div className="text-xs font-semibold text-white truncate">{place.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <strong className="text-slate-300">{place.distance}</strong>
                  <span>• {place.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
