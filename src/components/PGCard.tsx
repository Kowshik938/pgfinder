import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Users,
  ChevronRight,
  ShieldCheck,
  Scale,
  Calendar,
  Heart,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export interface PGItem {
  id: number;
  name: string;
  tagline?: string | null;
  description?: string | null;
  genderType: string;
  city: string;
  address: string;
  locality?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  monthlyRent: number;
  securityDeposit?: number | null;
  availableBeds: number;
  totalBeds: number;
  verificationStatus: string;
  rules?: string | null;
  foodIncluded?: boolean | null;
  foodType?: string | null;
  gateClosingTime?: string | null;
  rating: number;
  reviewCount: number;
  images?: Array<{ id: number; imageUrl: string; caption?: string; isPrimary: boolean }>;
  rooms?: Array<{ id: number; roomType: string; rent: number; availableBeds: number }>;
  amenities?: Array<{ amenity: { id: number; name: string; icon?: string } }>;
  owner?: { id: number; name: string; phone?: string; email: string };
}

interface PGCardProps {
  pg: PGItem;
  onSelect: (pg: PGItem) => void;
  onBookVisit: (pg: PGItem) => void;
}

export const PGCard: React.FC<PGCardProps> = ({ pg, onSelect, onBookVisit }) => {
  const { addToCompare, removeFromCompare, isComparing } = useFilters();
  const { token, dbUser, setDemoUser } = useAuth();
  const comparing = isComparing(pg.id);
  const [isFavorited, setIsFavorited] = useState(false);

  const primaryImage =
    pg.images?.find((img) => img.isPrimary)?.imageUrl ||
    pg.images?.[0]?.imageUrl ||
    '/src/assets/images/coliving_suite_interior_1790710211479.jpg';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token && !dbUser) {
      setDemoUser('USER');
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pgId: pg.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorited(data.isFavorite);
      }
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  return (
    <article
      onClick={() => onSelect(pg)}
      className="group rounded-2xl bg-[#0d0f22] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-violet-950/30 hover:-translate-y-1"
    >
      {/* Editorial Photo Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070810]">
        <img
          src={primaryImage}
          alt={pg.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e101c] via-black/20 to-transparent opacity-90" />

        {/* Top Control Bar Over Image */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {pg.verificationStatus === 'VERIFIED' && (
              <span className="text-[11px] font-medium text-emerald-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Compare Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                comparing ? removeFromCompare(pg.id) : addToCompare(pg);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 border ${
                comparing
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-black/60 text-slate-300 hover:text-white border-white/20 hover:border-white/40'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{comparing ? 'In Compare' : 'Compare'}</span>
            </button>

            {/* Favorite / Heart Button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-md backdrop-blur-md transition-all cursor-pointer border ${
                isFavorited
                  ? 'bg-rose-600/80 text-white border-rose-500'
                  : 'bg-black/60 text-slate-300 hover:text-white border-white/20 hover:border-white/40'
              }`}
              title={isFavorited ? 'Saved to favorites' : 'Save to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Bed Count Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-200">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-white">{pg.availableBeds}</span>
          <span className="text-slate-400">beds vacant</span>
        </div>
      </div>

      {/* Card Content & Editorial Typography */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Line (No static pills) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 flex-wrap">
            <span className="capitalize text-slate-300 font-medium">
              {pg.genderType.toLowerCase()} PG
            </span>
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <span>{pg.locality || pg.address}</span>
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <span>{pg.city}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {pg.name}
          </h3>

          {/* Tagline / Meal plan info */}
          <p className="text-xs text-slate-400 line-clamp-1 mt-1 leading-relaxed">
            {pg.tagline ||
              (pg.foodIncluded
                ? '3 Homely Meals Included · High-Speed Fiber'
                : 'Self-Cooking Kitchen · AC Rooms')}
          </p>

          {/* Specs row */}
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1 font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">
                {pg.rating ? pg.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-500">({pg.reviewCount || 0})</span>
            </div>

            <span className="text-slate-300">
              {pg.rooms && pg.rooms.length > 0
                ? `${pg.rooms.length} Room Configs`
                : 'Attached Washroom'}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Starts from
            </div>
            <div className="text-lg font-bold text-white font-mono">
              ₹{pg.monthlyRent.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1">/ mo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookVisit(pg);
              }}
              className="px-3 py-1.5 rounded-xl border border-white/[0.1] hover:border-violet-400/50 hover:bg-violet-600/10 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              Schedule Visit
            </button>
            <button
              onClick={() => onSelect(pg)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
