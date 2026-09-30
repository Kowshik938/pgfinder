import { UserRole } from '../context/AuthContext.tsx';
import { User, ShieldCheck, Building2, Crown } from 'lucide-react';

export interface RoleThemeConfig {
  role: UserRole;
  title: string;
  badgeLabel: string;
  description: string;
  primaryColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorderHover: string;
  buttonClass: string;
  accentGradient: string;
  avatarRing: string;
  activeTabBg: string;
  glowColor: string;
  dotColor: string;
}

export const ROLE_THEMES: Record<UserRole, RoleThemeConfig> = {
  USER: {
    role: 'USER',
    title: 'Tenant / Seeker',
    badgeLabel: 'Tenant Mode',
    description: 'Explore verified PGs, book rooms, request in-person visits, and write reviews.',
    primaryColor: '#6366f1', // Indigo
    badgeBg: 'bg-indigo-500/15',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    cardBorderHover: 'hover:border-indigo-500/50',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25',
    accentGradient: 'from-indigo-500 to-cyan-500',
    avatarRing: 'ring-indigo-500/50 border-indigo-400',
    activeTabBg: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    dotColor: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]',
  },
  OWNER: {
    role: 'OWNER',
    title: 'PG Owner / Host',
    badgeLabel: 'Host Mode',
    description: 'Manage property listings, room inventories, pricing, photos, and tenant bookings.',
    primaryColor: '#f59e0b', // Amber / Gold
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    cardBorderHover: 'hover:border-amber-500/50',
    buttonClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/25',
    accentGradient: 'from-amber-400 via-orange-500 to-amber-600',
    avatarRing: 'ring-amber-500/50 border-amber-400',
    activeTabBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  },
  ADMIN: {
    role: 'ADMIN',
    title: 'Platform Administrator',
    badgeLabel: 'Admin Mode',
    description: 'Verify PG listings, review host documentation, audit users, and moderate content.',
    primaryColor: '#f43f5e', // Rose / Crimson
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    cardBorderHover: 'hover:border-rose-500/50',
    buttonClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25',
    accentGradient: 'from-rose-500 via-red-500 to-purple-600',
    avatarRing: 'ring-rose-500/50 border-rose-400',
    activeTabBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    dotColor: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  },
};
