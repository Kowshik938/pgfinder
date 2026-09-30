/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Phase1Hero } from './components/Phase1Hero.tsx';
import { PGCard, PGItem } from './components/PGCard.tsx';
import { PGDetailsModal } from './components/PGDetailsModal.tsx';
import { VisitModal } from './components/VisitModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { ReviewListModal } from './components/ReviewListModal.tsx';
import { AIRoommateMatcherModal } from './components/AIRoommateMatcherModal.tsx';
import { AIAssistantWidget } from './components/AIAssistantWidget.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ArchitectureViewer } from './components/ArchitectureViewer.tsx';
import { RoleWorkspace } from './components/RoleWorkspace.tsx';
import { InteractiveMapExplorer } from './components/InteractiveMapExplorer.tsx';
import { AdvancedFilterBar } from './components/AdvancedFilterBar.tsx';
import { PGCompareModal } from './components/PGCompareModal.tsx';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext.tsx';
import { FilterProvider, useFilters } from './context/FilterContext.tsx';
import { ROLE_THEMES } from './utils/roleTheme.ts';
import {
  Building2,
  RefreshCw,
  Sparkles,
  MapPin,
  CheckCircle2,
  Columns,
  LayoutGrid,
  Map as MapIcon,
  Scale,
  X,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';

function MainContent() {
  const [activeTab, setActiveTab] = useState<'explore' | 'workspace' | 'architecture' | 'api-tester'>('explore');
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [pgList, setPgList] = useState<PGItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPg, setSelectedPg] = useState<PGItem | null>(null);
  const [visitPg, setVisitPg] = useState<PGItem | null>(null);
  const [bookingPg, setBookingPg] = useState<PGItem | null>(null);
  const [reviewPg, setReviewPg] = useState<PGItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('USER');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isRoommateMatcherOpen, setIsRoommateMatcherOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const { filters, resetFilters, compareList, removeFromCompare, clearCompare } = useFilters();
  const { dbUser, activeRole } = useAuth();
  const currentTheme = ROLE_THEMES[activeRole];

  // Listen for Google Maps Platform quota defense event
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const fetchPGs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city && filters.city !== 'All') params.append('city', filters.city);
      if (filters.genderType && filters.genderType !== 'ALL') params.append('genderType', filters.genderType);
      if (filters.roomType && filters.roomType !== 'ALL') params.append('roomType', filters.roomType);
      if (filters.minRent) params.append('minRent', filters.minRent.toString());
      if (filters.maxRent) params.append('maxRent', filters.maxRent.toString());
      if (filters.foodFilter === 'INCLUDED') params.append('foodIncluded', 'true');
      if (filters.foodFilter === 'NOT_INCLUDED') params.append('foodIncluded', 'false');
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      if (filters.selectedAmenities.length > 0) {
        params.append('amenities', filters.selectedAmenities.join(','));
      }
      if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const res = await fetch(`/api/pgs?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPgList(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch PGs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, [
    filters.city,
    filters.genderType,
    filters.minRent,
    filters.maxRent,
    filters.roomType,
    filters.foodFilter,
    filters.verifiedOnly,
    filters.selectedAmenities,
    filters.sortBy,
    filters.search,
  ]);

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin', role: UserRole = 'USER') => {
    setAuthMode(mode);
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080911] text-slate-100 flex flex-col font-sans pb-16 selection:bg-purple-600/30 selection:text-purple-200">
      {/* Google Maps Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs text-center sticky top-0 z-50">
          <span>
            Google Maps Platform quota reached. Fallback coordinate locator activated.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={handleOpenAuth}
        onOpenRoommateMatcher={() => setIsRoommateMatcherOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'explore' ? (
          <div>
            <Phase1Hero
              onSearch={fetchPGs}
              openArchitecture={() => setActiveTab('architecture')}
              onOpenRoommateMatcher={() => setIsRoommateMatcherOpen(true)}
            />

            {/* Roommate Matcher Ribbon */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0d0f22] to-indigo-950/30 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-violet-950/25 backdrop-blur-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/40">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Looking for a Compatible Roommate?</span>
                      <span className="text-[10px] text-violet-300 font-semibold uppercase tracking-wider">
                        · AI Matching
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Pair with flatmates matching your sleep schedule, food preferences, and quiet hours.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsRoommateMatcherOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer self-start sm:self-auto transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Match Quiz</span>
                </button>
              </div>
            </div>

            {/* PG Discovery Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {/* Filter Bar */}
              <AdvancedFilterBar
                totalResults={pgList.length}
                onOpenCompare={() => setIsCompareOpen(true)}
              />

              {/* View Mode & Header */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <span>
                      {filters.city === 'All' ? 'Verified Accommodations' : `Spaces in ${filters.city}`}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 font-mono">
                      {pgList.length} available
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Switcher */}
                  <div className="hidden md:flex items-center bg-[#0d0f22] border border-white/[0.08] rounded-xl p-1 text-xs">
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                        viewMode === 'split' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Split</span>
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                        viewMode === 'grid' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                        viewMode === 'map' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>
                  </div>

                  <button
                    onClick={fetchPGs}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e101c] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-96 rounded-2xl bg-[#0e101c] border border-white/[0.06] animate-pulse"
                    />
                  ))}
                </div>
              ) : pgList.length === 0 ? (
                <div className="text-center py-16 bg-[#0e101c] rounded-3xl border border-white/[0.08] p-8">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Matching Accommodations</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                    We couldn't locate any spaces matching your filter combination. Try adjusting the
                    budget slider or searching for a broader locality.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : viewMode === 'map' ? (
                <InteractiveMapExplorer
                  pgList={pgList}
                  onSelectPG={(item) => setSelectedPg(item)}
                />
              ) : viewMode === 'split' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: PG Cards */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pgList.map((pg) => (
                      <PGCard
                        key={pg.id}
                        pg={pg}
                        onSelect={(item) => setSelectedPg(item)}
                        onBookVisit={(item) => setVisitPg(item)}
                      />
                    ))}
                  </div>

                  {/* Right: Sticky Interactive Google Map */}
                  <div className="lg:col-span-5 sticky top-24">
                    <InteractiveMapExplorer
                      pgList={pgList}
                      onSelectPG={(item) => setSelectedPg(item)}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pgList.map((pg) => (
                    <PGCard
                      key={pg.id}
                      pg={pg}
                      onSelect={(item) => setSelectedPg(item)}
                      onBookVisit={(item) => setVisitPg(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'workspace' ? (
          <RoleWorkspace onExplore={() => setActiveTab('explore')} />
        ) : (
          <ArchitectureViewer />
        )}
      </main>

      {/* Floating Compare Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0e101c]/95 border border-purple-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-4 animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Compare Accommodations</div>
              <div className="text-[10px] text-slate-400">
                {compareList.length} of 3 selected
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {compareList.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#070810] border border-white/[0.08] text-[11px] text-slate-200"
              >
                <span className="max-w-[80px] truncate">{p.name}</span>
                <button
                  onClick={() => removeFromCompare(p.id)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Compare Now
            </button>
            <button
              onClick={clearCompare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating AI PG Concierge Widget */}
      <AIAssistantWidget />

      {/* Quiet Footer */}
      <footer className="bg-[#06070d] border-t border-white/[0.06] py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-display">PGFinder</span>
            <span className="text-white/20">·</span>
            <span>A new city. A new beginning. Find a place that feels like home.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Accommodations & Real Reviews
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PGDetailsModal
        pg={selectedPg}
        onClose={() => setSelectedPg(null)}
        onBookVisit={(pg) => {
          setSelectedPg(null);
          setVisitPg(pg);
        }}
        onBookRoom={(pg) => {
          setSelectedPg(null);
          setBookingPg(pg);
        }}
        onOpenReviews={(pg) => {
          setSelectedPg(null);
          setReviewPg(pg);
        }}
      />

      <VisitModal pg={visitPg} onClose={() => setVisitPg(null)} />

      <BookingModal
        pg={bookingPg}
        onClose={() => setBookingPg(null)}
        onSuccess={() => fetchPGs()}
      />

      <ReviewListModal
        pg={reviewPg}
        onClose={() => setReviewPg(null)}
        onReviewAdded={() => fetchPGs()}
      />

      <AIRoommateMatcherModal
        isOpen={isRoommateMatcherOpen}
        onClose={() => setIsRoommateMatcherOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        initialRole={authInitialRole}
      />

      <PGCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectPG={(pg) => {
          setIsCompareOpen(false);
          setSelectedPg(pg);
        }}
        onBookVisit={(pg) => {
          setIsCompareOpen(false);
          setVisitPg(pg);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <MainContent />
      </FilterProvider>
    </AuthProvider>
  );
}
