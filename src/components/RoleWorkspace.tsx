import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  ArrowRight,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  MapPin,
  Bed,
  Check,
  X,
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import { ROLE_THEMES } from '../utils/roleTheme.ts';
import { PGOwnerWizard } from './PGOwnerWizard.tsx';

interface RoleWorkspaceProps {
  onExplore: () => void;
}

export const RoleWorkspace: React.FC<RoleWorkspaceProps> = ({ onExplore }) => {
  const { dbUser, activeRole, token } = useAuth();
  const theme = ROLE_THEMES[activeRole];

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);

  // Tenant state
  const [tenantBookings, setTenantBookings] = useState<any[]>([]);
  const [tenantVisits, setTenantVisits] = useState<any[]>([]);

  // Owner state
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [ownerPgs, setOwnerPgs] = useState<any[]>([]);

  // Admin state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminPgs, setAdminPgs] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load data based on active role
  const loadRoleData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (activeRole === 'USER') {
        const bRes = await fetch('/api/bookings/my', { headers });
        if (bRes.ok) {
          const bData = await bRes.json();
          setTenantBookings(bData.data || []);
        }

        const vRes = await fetch('/api/visits/my', { headers });
        if (vRes.ok) {
          const vData = await vRes.json();
          setTenantVisits(vData.data || []);
        }
      } else if (activeRole === 'OWNER') {
        const pRes = await fetch('/api/pgs');
        if (pRes.ok) {
          const pData = await pRes.json();
          setOwnerPgs(pData.data || []);
        }

        const bRes = await fetch('/api/bookings/owner', { headers });
        if (bRes.ok) {
          const bData = await bRes.json();
          setOwnerBookings(bData.data || []);
        }
      } else if (activeRole === 'ADMIN') {
        const uRes = await fetch('/api/auth/admin/users', { headers });
        if (uRes.ok) {
          const uData = await uRes.json();
          setAdminUsers(uData.data || []);
        }

        const pRes = await fetch('/api/auth/admin/pending-pgs', { headers });
        if (pRes.ok) {
          const pData = await pRes.json();
          setAdminPgs(pData.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load role data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoleData();
  }, [activeRole, token]);

  const handleUpdateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionSuccess(`Booking updated to ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadRoleData();
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  const handleVerifyPg = async (pgId: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/auth/admin/verify-pg/${pgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionSuccess(`Property status set to ${status}`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadRoleData();
      }
    } catch (err) {
      console.error('Error verifying PG:', err);
    }
  };

  if (showWizard) {
    return (
      <PGOwnerWizard
        onSuccess={() => {
          setShowWizard(false);
          setActionSuccess('Property registered and submitted for verification!');
          setTimeout(() => setActionSuccess(null), 4000);
          loadRoleData();
        }}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Role Header Banner */}
      <div className="rounded-3xl border border-white/[0.08] p-6 sm:p-8 bg-[#0e101c] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeRole === 'OWNER'
                  ? 'bg-amber-400'
                  : activeRole === 'ADMIN'
                  ? 'bg-rose-400'
                  : 'bg-violet-400'
              }`}
            />
            <span className="uppercase tracking-wider">{activeRole} DASHBOARD</span>
            <span className="text-white/20">·</span>
            <span>{dbUser ? dbUser.name : 'Active Persona'}</span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            {activeRole === 'USER'
              ? 'Tenant Residence & Booking Center'
              : activeRole === 'OWNER'
              ? 'Property Portfolio & Occupancy Hub'
              : 'Platform Administration & Verification'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {activeRole === 'USER'
              ? 'Track your scheduled physical visits, active tenancy agreements, and rent deposits in real time.'
              : activeRole === 'OWNER'
              ? 'Manage room tariffs, verify tenant booking inquiries, inspect occupancy, and onboard new properties.'
              : 'Audit new PG submissions, ensure host identity authenticity, and oversee platform users.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeRole === 'OWNER' && (
            <button
              onClick={() => setShowWizard(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Property</span>
            </button>
          )}

          <button
            onClick={loadRoleData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TENANT / USER VIEW */}
      {activeRole === 'USER' && (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Confirmed Bookings
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {tenantBookings.filter((b) => b.status === 'CONFIRMED').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Active verified tenancies</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pending Requests
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {tenantBookings.filter((b) => b.status === 'PENDING').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Awaiting host review</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Scheduled Visits
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {tenantVisits.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">In-person walk-throughs</div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">My Tenancy Bookings</h2>
              <button
                onClick={onExplore}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
              >
                Browse more spaces &rarr;
              </button>
            </div>

            {tenantBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                You haven't requested any room bookings yet. Explore spaces and click "Book Room Now" to submit an application.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {tenantBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{b.pg?.locality || 'Tech Corridor'}</span>
                        <span>·</span>
                        <span>{b.pg?.city || 'India'}</span>
                      </div>
                      <div className="font-display font-bold text-base text-white mt-0.5">
                        {b.pg?.name || `Booking #${b.id}`}
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                        <span className="font-mono">Move-in: {new Date(b.moveInDate).toLocaleDateString()}</span>
                        <span>·</span>
                        <span className="font-mono font-semibold text-white">₹{b.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : b.status === 'REJECTED'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visits Section */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">Scheduled Physical Visits</h2>
            {tenantVisits.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No physical visits scheduled. Click "Schedule Visit" on any property card to arrange an in-person walk-through.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {tenantVisits.map((v) => (
                  <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-display font-bold text-base text-white">
                        {v.pg?.name || `Visit #${v.id}`}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(v.visitDate).toLocaleDateString()} at {v.timeSlot}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        {v.status || 'SCHEDULED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OWNER / HOST VIEW */}
      {activeRole === 'OWNER' && (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Listed Properties
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{ownerPgs.length}</div>
              <div className="text-xs text-slate-400 mt-1">Verified host premises</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Beds
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {ownerPgs.reduce((acc, p) => acc + (p.totalBeds || 0), 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Inventory capacity</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Occupancy Rate
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {ownerPgs.length > 0
                  ? Math.round(
                      (ownerPgs.reduce(
                        (acc, p) => acc + (p.totalBeds - p.availableBeds),
                        0
                      ) /
                        Math.max(
                          1,
                          ownerPgs.reduce((acc, p) => acc + p.totalBeds, 0)
                        )) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-xs text-slate-400 mt-1">Live resident ratio</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pending Bookings
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {ownerBookings.filter((b) => b.status === 'PENDING').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Action required</div>
            </div>
          </div>

          {/* Pending Inquiries & Requests */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">Tenant Booking Inquiries</h2>
            {ownerBookings.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active booking requests at the moment. As tenants explore your listings, inquiries will populate here for review.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {ownerBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-display font-bold text-base text-white">
                        {b.user?.name || 'Applicant'} · {b.pg?.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Move-in: {new Date(b.moveInDate).toLocaleDateString()} · Tariff: ₹{b.totalAmount?.toLocaleString()} · Contact: {b.user?.email || b.user?.phone || 'On file'}
                      </div>
                      {b.notes && (
                        <div className="text-xs text-slate-300 mt-1 italic">"{b.notes}"</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Properties Portfolio */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">Your Listed Properties</h2>
              <button
                onClick={() => setShowWizard(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
              >
                + Add Another Space
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerPgs.map((pg) => (
                <div key={pg.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-start">
                  <div>
                    <div className="text-xs text-slate-400">
                      {pg.locality} · {pg.city}
                    </div>
                    <div className="font-display font-bold text-base text-white mt-0.5">
                      {pg.name}
                    </div>
                    <div className="text-xs text-slate-300 mt-2 flex items-center gap-3">
                      <span className="font-mono">₹{pg.monthlyRent?.toLocaleString()}/mo</span>
                      <span>·</span>
                      <span>{pg.availableBeds} beds available</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                      pg.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {pg.verificationStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW */}
      {activeRole === 'ADMIN' && (
        <div className="space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pending Submissions
              </div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {adminPgs.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Audit required</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Platform Users
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {adminUsers.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Registered accounts</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e101c] border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Properties
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {ownerPgs.filter((p) => p.verificationStatus === 'VERIFIED').length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Active on discovery</div>
            </div>
          </div>

          {/* Pending Verifications Queue */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">Pending PG Audits</h2>
            {adminPgs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                All submitted properties have been verified. No pending audits in queue.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {adminPgs.map((p) => (
                  <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-display font-bold text-base text-white">{p.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {p.locality} · {p.city} · Host: {p.owner?.name || 'Partner Host'} ({p.owner?.email})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyPg(p.id, 'VERIFIED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify & Publish</span>
                      </button>
                      <button
                        onClick={() => handleVerifyPg(p.id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold cursor-pointer transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform User Registry */}
          <div className="rounded-3xl bg-[#0e101c] border border-white/[0.08] p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">User Accounts Registry</h2>
            <div className="divide-y divide-white/[0.06]">
              {adminUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-slate-400">{u.email}</div>
                  </div>
                  <span className="font-mono text-purple-300 uppercase">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
