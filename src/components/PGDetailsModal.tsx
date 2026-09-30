import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Star,
  CheckCircle2,
  Users,
  Utensils,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Phone,
  Mail,
  FileText,
  Heart,
  Footprints,
  Eye,
  MessageSquare,
  Bed,
  Wifi,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import { PGItem } from './PGCard.tsx';
import { NearbyAmenitiesPanel } from './NearbyAmenitiesPanel.tsx';
import { Accommodation3DViewer } from './Accommodation3DViewer.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ModalProps {
  pg: PGItem | null;
  onClose: () => void;
  onBookVisit: (pg: PGItem) => void;
  onBookRoom?: (pg: PGItem) => void;
  onOpenReviews?: (pg: PGItem) => void;
}

export const PGDetailsModal: React.FC<ModalProps> = ({
  pg,
  onClose,
  onBookVisit,
  onBookRoom,
  onOpenReviews,
}) => {
  const { dbUser, token, setDemoUser } = useAuth();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | '3d-tour' | 'transit'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!pg) return;
    if (token) {
      fetch(`/api/favorites/check/${pg.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setIsFavorite(Boolean(d.isFavorite)))
        .catch(() => {});
    }
  }, [pg?.id, token]);

  const toggleFavorite = async () => {
    if (!pg) return;
    try {
      if (!dbUser) {
        setDemoUser('USER');
      }
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
        setIsFavorite(data.isFavorite);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!pg) return null;

  const images =
    pg.images && pg.images.length > 0
      ? pg.images
      : [
          {
            id: 1,
            imageUrl: '/src/assets/images/coliving_suite_interior_1790710211479.jpg',
            caption: 'Primary Living Suite',
            isPrimary: true,
          },
          {
            id: 2,
            imageUrl: '/src/assets/images/coliving_communal_lounge_1790710222502.jpg',
            caption: 'Coworking & Community Lounge',
            isPrimary: false,
          },
          {
            id: 3,
            imageUrl: '/src/assets/images/coliving_building_exterior_1790710234542.jpg',
            caption: 'Architecture & Exterior',
            isPrimary: false,
          },
        ];

  let parsedRules: string[] = [];
  try {
    if (pg.rules) {
      parsedRules = typeof pg.rules === 'string' ? JSON.parse(pg.rules) : pg.rules;
    }
  } catch {
    parsedRules = [pg.rules as string];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e101c] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                : 'bg-black/60 hover:bg-black text-slate-300 hover:text-white border-white/20'
            }`}
            title={isFavorite ? 'Remove from saved' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Main Gallery Viewport */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-[#070810]">
            <img
              src={images[activePhotoIndex]?.imageUrl || images[0].imageUrl}
              alt={pg.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e101c] via-black/30 to-transparent opacity-90" />

            {/* Bottom Title Bar over Image */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
              <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                <span className="capitalize">{pg.genderType.toLowerCase()} PG</span>
                <span aria-hidden="true" className="text-white/30">
                  ·
                </span>
                <span>{pg.locality || pg.address}</span>
                <span aria-hidden="true" className="text-white/30">
                  ·
                </span>
                <span>{pg.city}</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                {pg.name}
              </h2>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="px-6 py-3 bg-[#0a0c16] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`h-14 w-20 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-purple-400 ring-2 ring-purple-500/30'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Navigation Tabs (Overview, 3D Tour, Nearby Transit) */}
          <div className="px-6 border-b border-white/[0.08] flex items-center gap-8 bg-[#0e101c]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 text-xs font-semibold cursor-pointer border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Overview & Inventory
            </button>
            <button
              onClick={() => setActiveTab('3d-tour')}
              className={`py-3.5 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === '3d-tour'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>3D Room Inspection</span>
            </button>
            <button
              onClick={() => setActiveTab('transit')}
              className={`py-3.5 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'transit'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-purple-400" />
              <span>Nearby Places & Walkability</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' ? (
              <div className="space-y-8">
                {/* Description & Key Specs */}
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    About This Accommodation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {pg.description ||
                      `${pg.name} is a premier paying guest accommodation offering spacious rooms with attached washrooms, ergonomic study desks, 3-times daily nutritious home-cooked meals, and high-speed Wi-Fi. Ideal for working professionals and students seeking a safe, clean, and inspiring living environment.`}
                  </p>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06]">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Starting Rent
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        ₹{pg.monthlyRent.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ mo</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Security Deposit
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        ₹{(pg.securityDeposit || pg.monthlyRent).toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Vacant Beds
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {pg.availableBeds}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          of {pg.totalBeds}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        Gate Timings
                      </div>
                      <div className="text-base font-bold text-white font-mono mt-0.5">
                        {pg.gateClosingTime || '11:00 PM'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Room Configurations Table */}
                {pg.rooms && pg.rooms.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-lg text-white mb-3 flex items-center justify-between">
                      <span>Room Sharing Options & Tariffs</span>
                      <span className="text-xs text-slate-400 font-normal">
                        Select room during booking
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {pg.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span className="capitalize">{room.roomType.toLowerCase()} Room</span>
                              <span className="font-mono text-purple-300">
                                {room.availableBeds} vacant
                              </span>
                            </div>
                            <div className="text-lg font-bold text-white font-mono">
                              ₹{room.rent.toLocaleString()}
                              <span className="text-xs text-slate-400 font-normal ml-1">/ mo</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Attached Bath · Desk</span>
                            {onBookRoom && (
                              <button
                                onClick={() => onBookRoom(pg)}
                                className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
                              >
                                Reserve &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities Grid */}
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-3">
                    Furnishings & Amenities
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {(pg.amenities && pg.amenities.length > 0
                      ? pg.amenities.map((a) => a.amenity.name)
                      : [
                          'High-Speed Wi-Fi',
                          'Air Conditioning',
                          '3 Homely Meals Included',
                          '24/7 Power Backup',
                          'Automatic Washing Machine',
                          'Daily Room Housekeeping',
                          'Attached Western Washroom',
                          'CCTV & Biometric Entry',
                          'RO Drinking Water',
                          'Refrigerator on Floor',
                        ]
                    ).map((amenityName, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-xs text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{amenityName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* House Rules */}
                {parsedRules.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-lg text-white mb-3">
                      House Rules & Guidelines
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {parsedRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Host Details */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-base border border-purple-500/30">
                      {pg.owner?.name ? pg.owner.name[0].toUpperCase() : 'H'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>Managed by {pg.owner?.name || 'Verified Host'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Background-verified host with on-site caretaker and physical maintenance
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {onOpenReviews && (
                      <button
                        onClick={() => onOpenReviews(pg)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        <span>Reviews ({pg.reviewCount || 0})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === '3d-tour' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Interactive 3D Coliving Suite Inspection</span>
                  <span className="text-slate-400">Click and drag to orbit room angles</span>
                </div>
                <Accommodation3DViewer roomType={pg.rooms?.[0]?.roomType || 'Executive Coliving Suite'} />
              </div>
            ) : (
              <NearbyAmenitiesPanel pg={pg} />
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-[#0a0c16] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Monthly Tariff
            </div>
            <div className="text-xl font-bold text-white font-mono">
              ₹{pg.monthlyRent.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onBookVisit(pg)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/[0.1] hover:border-purple-500/40 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Schedule Visit</span>
            </button>

            {onBookRoom && (
              <button
                onClick={() => onBookRoom(pg)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book Room Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
