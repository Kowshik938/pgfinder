import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  MapPin,
  Utensils,
  ShieldCheck,
  Scale,
  RotateCcw,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.tsx';

const POPULAR_AMENITIES = [
  'Wi-Fi',
  'Air Conditioning',
  'Food',
  'Power Backup',
  'Washing Machine',
  'Housekeeping',
  'Biometric',
  'Gym',
  'Parking',
];

interface FilterBarProps {
  totalResults: number;
  onOpenCompare?: () => void;
}

export const AdvancedFilterBar: React.FC<FilterBarProps> = ({ totalResults, onOpenCompare }) => {
  const {
    filters,
    updateFilter,
    toggleAmenityFilter,
    resetFilters,
    activeFilterCount,
    compareList,
  } = useFilters();

  const [showAmenities, setShowAmenities] = useState(false);
  const cities = ['All', 'Hyderabad', 'Bangalore', 'Pune', 'Delhi NCR', 'Chennai'];

  return (
    <div className="bg-[#0d0f22] border border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-xl shadow-violet-950/20 mb-6 space-y-4">
      {/* Primary Row: Search, City, Gender Segmented, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Instant Search Field */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search by name, tech park, or locality..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-3 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City Hub Selector */}
        <div className="lg:col-span-3">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-violet-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={filters.city}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500 cursor-pointer appearance-none"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-[#0d0f22]">
                  {city === 'All' ? 'All Tech Hubs' : city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Gender Segmented Control (Interactive buttons) */}
        <div className="lg:col-span-3 flex p-1 bg-white/[0.04] rounded-xl border border-white/[0.08]">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'BOYS', label: 'Boys' },
            { id: 'GIRLS', label: 'Girls' },
            { id: 'COED', label: 'Co-Ed' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => updateFilter('genderType', g.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filters.genderType === g.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Sort Order Dropdown */}
        <div className="lg:col-span-2">
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full pl-8 pr-7 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer appearance-none truncate"
            >
              <option value="rating_desc" className="bg-[#0e101c]">
                Top Rated
              </option>
              <option value="price_asc" className="bg-[#0e101c]">
                Price: Low to High
              </option>
              <option value="price_desc" className="bg-[#0e101c]">
                Price: High to Low
              </option>
              <option value="newest" className="bg-[#0e101c]">
                Newest First
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Secondary Controls: Budget, Room Type, Meals, Amenities */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Budget Range Slider */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <span className="text-slate-400">Max Rent:</span>
            <span className="text-white font-mono font-semibold">
              ₹{filters.maxRent.toLocaleString()}
            </span>
            <input
              type="range"
              min="5000"
              max="35000"
              step="500"
              value={filters.maxRent}
              onChange={(e) => updateFilter('maxRent', parseInt(e.target.value, 10))}
              className="w-24 sm:w-32 accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Sharing Type */}
          <div className="relative">
            <select
              value={filters.roomType}
              onChange={(e) => updateFilter('roomType', e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer appearance-none pr-7"
            >
              <option value="ALL" className="bg-[#0e101c]">
                Any Sharing
              </option>
              <option value="SINGLE" className="bg-[#0e101c]">
                Single Private Room
              </option>
              <option value="DOUBLE" className="bg-[#0e101c]">
                Double Sharing (2 Beds)
              </option>
              <option value="TRIPLE" className="bg-[#0e101c]">
                Triple Sharing (3 Beds)
              </option>
              <option value="FOUR_SHARING" className="bg-[#0e101c]">
                Four Sharing (Budget)
              </option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Meals Filter */}
          <div className="relative">
            <select
              value={filters.foodFilter}
              onChange={(e) => updateFilter('foodFilter', e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer appearance-none pr-7"
            >
              <option value="ALL" className="bg-[#0e101c]">
                Meals: Any
              </option>
              <option value="INCLUDED" className="bg-[#0e101c]">
                Homely Meals Included
              </option>
              <option value="NOT_INCLUDED" className="bg-[#0e101c]">
                Self-Cooking Only
              </option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Verified Only Toggle */}
          <button
            onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              filters.verifiedOnly
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Hosts</span>
          </button>

          {/* Amenities Drawer Toggle */}
          <button
            onClick={() => setShowAmenities(!showAmenities)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              filters.selectedAmenities.length > 0 || showAmenities
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Amenities</span>
            {filters.selectedAmenities.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-white font-mono text-[10px] flex items-center justify-center">
                {filters.selectedAmenities.length}
              </span>
            )}
          </button>
        </div>

        {/* Right side: Active Filters Count, Reset, Compare */}
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}

          {compareList.length > 0 && onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Scale className="w-3 h-3" />
              <span>Compare ({compareList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Amenities Checklist */}
      {showAmenities && (
        <div className="pt-3 border-t border-white/[0.06] animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Filter by Amenities
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {POPULAR_AMENITIES.map((amenity) => {
              const selected = filters.selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => toggleAmenityFilter(amenity)}
                  className={`p-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border text-left ${
                    selected
                      ? 'bg-purple-600/20 text-purple-200 border-purple-500/50 font-semibold'
                      : 'bg-white/[0.02] text-slate-300 border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                      selected
                        ? 'bg-purple-500 border-purple-400 text-white'
                        : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate">{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
