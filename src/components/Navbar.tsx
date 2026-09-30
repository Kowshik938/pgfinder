import React, { useState } from 'react';
import {
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import { ROLE_THEMES } from '../utils/roleTheme.ts';

interface NavbarProps {
  activeTab: 'explore' | 'workspace' | 'architecture' | 'api-tester';
  setActiveTab: (tab: 'explore' | 'workspace' | 'architecture' | 'api-tester') => void;
  openAuthModal: (mode?: 'signin' | 'register', role?: UserRole) => void;
  onOpenRoommateMatcher?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  onOpenRoommateMatcher,
}) => {
  const { dbUser, activeRole, switchRole, signOut } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#080911]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className="text-left cursor-pointer group focus:outline-none"
            >
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                PGFinder
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide">
            <button
              onClick={() => setActiveTab('explore')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'explore'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              Explore Spaces
            </button>

            {onOpenRoommateMatcher && (
              <button
                onClick={onOpenRoommateMatcher}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent flex items-center gap-1.5"
              >
                <span>Roommate Matcher</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('workspace')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'workspace'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              Role Workspace
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`transition-colors cursor-pointer py-1 ${
                activeTab === 'architecture'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              Architecture & DB
            </button>
          </nav>

          {/* Zone 3: Role Switcher & Auth actions */}
          <div className="flex items-center gap-3">
            {/* Perspective Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeRole === 'OWNER'
                      ? 'bg-amber-400'
                      : activeRole === 'ADMIN'
                      ? 'bg-rose-400'
                      : 'bg-violet-400'
                  }`}
                />
                <span className="capitalize">{activeRole.toLowerCase()} View</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e101c] border border-white/[0.1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Perspective
                  </div>

                  <button
                    onClick={() => {
                      switchRole('USER');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeRole === 'USER'
                        ? 'bg-purple-600/20 text-purple-200 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Tenant / Seeker</div>
                      <div className="text-[11px] text-slate-400">Search, book visits & compare</div>
                    </div>
                    {activeRole === 'USER' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('OWNER');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeRole === 'OWNER'
                        ? 'bg-amber-600/20 text-amber-200 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">PG Owner / Host</div>
                      <div className="text-[11px] text-slate-400">List spaces & manage bookings</div>
                    </div>
                    {activeRole === 'OWNER' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchRole('ADMIN');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      activeRole === 'ADMIN'
                        ? 'bg-rose-600/20 text-rose-200 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Platform Admin</div>
                      <div className="text-[11px] text-slate-400">Verify listings & audit premises</div>
                    </div>
                    {activeRole === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile or Sign In */}
            {dbUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-md"
                  title={dbUser.name}
                >
                  {dbUser.name[0].toUpperCase()}
                </button>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-purple-600/25"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
