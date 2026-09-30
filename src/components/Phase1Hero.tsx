import React from 'react';
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Compass,
  Building2,
  Home,
  Utensils,
  Wifi,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext.tsx';
import { City3DCanvas } from './City3DCanvas.tsx';

interface HeroProps {
  onSearch: () => void;
  openArchitecture: () => void;
  onOpenRoommateMatcher?: () => void;
}

export const Phase1Hero: React.FC<HeroProps> = ({
  onSearch,
  openArchitecture,
  onOpenRoommateMatcher,
}) => {
  const { filters, updateFilter } = useFilters();
  const cities = ['All', 'Hyderabad', 'Bangalore', 'Pune', 'Delhi NCR', 'Chennai'];

  const handleCitySelect = (localityName: string, cityName: string) => {
    updateFilter('city', cityName);
    updateFilter('search', localityName);
    onSearch();
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="relative pt-10 pb-16 overflow-hidden border-b border-white/[0.08]">
      {/* Ambient luminous violet backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-gradient-to-b from-purple-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Story-driven editorial statement */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300">CURATED LIVING IN INDIA'S TECH HUBS</span>
            <span className="text-white/20">·</span>
            <span className="text-slate-400">ZERO BROKERAGE</span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400">100% VERIFIED</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08] text-balance">
            A new city. A new beginning.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300">
              Find a place that feels like home.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl text-balance font-normal">
            Relocating for an engineering sprint, a new venture, or academic journey shouldn't mean
            compromising on peace of mind. Discover thoughtfully designed coliving suites and paying
            guest residences minutes from major technology corridors.
          </p>
        </div>

        {/* 3D Interactive City Canvas */}
        <div className="mb-8">
          <City3DCanvas onSelectLocality={handleCitySelect} selectedCity={filters.city} />
        </div>

        {/* Editorial Search Console */}
        <form
          onSubmit={handleHeroSubmit}
          className="p-2 sm:p-2.5 rounded-2xl bg-[#0d0f22]/95 border border-violet-500/20 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl max-w-4xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            {/* Destination City */}
            <div className="sm:col-span-4 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Destination City
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                <select
                  value={filters.city}
                  onChange={(e) => updateFilter('city', e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-[#0d0f22]">
                      {c === 'All' ? 'All Tech Hubs' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Locality or Tech Park */}
            <div className="sm:col-span-5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/[0.08]">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Locality or Tech Park
              </label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Madhapur, Koramangala, HSR..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="sm:col-span-3 p-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Search Spaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Quantified Proof Line (Zero-Pill, Clean Typography) */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% physically verified hosts & premises
            </span>
            <span className="hidden sm:inline text-white/10" aria-hidden="true">
              ·
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <Home className="w-4 h-4 text-violet-400" />
              Zero brokerage · Direct lease with host
            </span>
            <span className="hidden sm:inline text-white/10" aria-hidden="true">
              ·
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <Utensils className="w-4 h-4 text-indigo-400" />
              Fresh home-cooked meals & dedicated Wi-Fi
            </span>
          </div>

          <button
            onClick={openArchitecture}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs underline"
          >
            System Architecture & DB &rarr;
          </button>
        </div>

        {/* Editorial Story Narrative: A New Beginning */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/[0.08]">
          <div className="rounded-2xl p-6 bg-[#0d0f22] border border-white/[0.06] hover:border-violet-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="text-xs font-semibold text-violet-400 font-mono mb-2">01</div>
              <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                Prime Tech Proximity
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skip hours of grueling commute. Every property is strategically located within 10–20
                minutes of major enterprise campuses, metro corridors, and startup hubs.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span>HITEC City · Koramangala · Hinjewadi</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[#0d0f22] border border-white/[0.06] hover:border-violet-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="text-xs font-semibold text-violet-400 font-mono mb-2">02</div>
              <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                Private Work-Live Balance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quiet study tables, high-speed fiber connectivity, private attached washrooms, and
                daily housekeeping so you can focus entirely on your career and passions.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span>Fiber Wi-Fi · Power Backup · Housekeeping</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[#0d0f22] border border-white/[0.06] hover:border-violet-500/30 transition-all flex flex-col justify-between group">
            <div>
              <div className="text-xs font-semibold text-violet-400 font-mono mb-2">03</div>
              <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                Curated Community
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live among ambitious peers. Our AI compatibility matcher pairs you with flatmates
                who share your work rhythms, food choices, and quiet-hour expectations.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Roommate Compatibility Engine</span>
              {onOpenRoommateMatcher && (
                <button
                  onClick={onOpenRoommateMatcher}
                  className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer underline"
                >
                  Try Matcher &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
