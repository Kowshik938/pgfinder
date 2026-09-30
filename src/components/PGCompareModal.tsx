import React from 'react';
import {
  X,
  Star,
  Check,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Utensils,
  Clock,
  ShieldCheck,
  MapPin,
  Users,
  Layers,
} from 'lucide-react';
import { PGItem } from './PGCard.tsx';
import { useFilters } from '../context/FilterContext.tsx';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPG: (pg: PGItem) => void;
  onBookVisit: (pg: PGItem) => void;
}

const COMMON_FACILITIES = [
  'Wi-Fi',
  'Food',
  'Air Conditioning',
  'Power Backup',
  'Washing Machine',
  'Daily Housekeeping',
  'CCTV / Biometrics',
  'Parking',
  'Gym',
];

export const PGCompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  onSelectPG,
  onBookVisit,
}) => {
  const { compareList, removeFromCompare, clearCompare } = useFilters();

  if (!isOpen || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0e101c] border border-white/[0.08] rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[92vh] flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Side-by-Side Comparison
              </span>
              <span className="text-xs text-slate-400">· {compareList.length} of 3 properties</span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
              Compare Accommodation Details
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Matrix */}
        <div className="overflow-x-auto flex-1 mt-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-3 w-40 text-slate-400 uppercase font-semibold">Criteria</th>
                {compareList.map((pg) => (
                  <th key={pg.id} className="py-4 px-4 min-w-[240px] align-top">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(pg.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove from compare"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-28 rounded-xl overflow-hidden mb-2 bg-slate-950">
                        <img
                          src={
                            pg.images?.[0]?.imageUrl ||
                            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={pg.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="font-bold text-sm text-white line-clamp-1">{pg.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{pg.locality}, {pg.city}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Starting Rent */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Starting Rent</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    <div className="text-base font-extrabold text-emerald-400">
                      ₹{pg.monthlyRent.toLocaleString()}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">/ month</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Gender Category */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Gender Category</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {pg.genderType} PG
                    </span>
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Security Deposit</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 font-semibold text-white">
                    ₹{(pg.securityDeposit || pg.monthlyRent).toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Food Provision */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Food Included</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    {pg.foodIncluded ? (
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        {pg.foodType || '3 Meals Daily'}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not Included</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Available Beds */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Vacant Beds</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 font-bold text-indigo-300">
                    {pg.availableBeds} beds available
                  </td>
                ))}
              </tr>

              {/* Room Configurations */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Room Options</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    <div className="space-y-1">
                      {pg.rooms && pg.rooms.length > 0 ? (
                        pg.rooms.map((r) => (
                          <div key={r.id} className="text-slate-300">
                            <strong>{r.roomType.replace('_', ' ').toLowerCase()}:</strong> ₹{r.rent.toLocaleString()}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500">Standard Room</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Gate Timing */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Gate Timing</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 text-slate-300">
                    {pg.gateClosingTime || '10:30 PM'}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-slate-400">Rating & Reviews</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    <div className="flex items-center gap-1 font-bold text-white">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{pg.rating ? pg.rating.toFixed(1) : '5.0'}</span>
                      <span className="text-slate-400 font-normal">({pg.reviewCount || 0})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Facilities Checklist */}
              {COMMON_FACILITIES.map((facility) => (
                <tr key={facility} className="hover:bg-slate-800/20">
                  <td className="py-2.5 px-3 font-medium text-slate-400">{facility}</td>
                  {compareList.map((pg) => {
                    const hasFacility =
                      facility === 'Food'
                        ? Boolean(pg.foodIncluded)
                        : pg.amenities?.some((a) =>
                            a.amenity.name.toLowerCase().includes(facility.toLowerCase())
                          ) ?? true;

                    return (
                      <td key={pg.id} className="py-2.5 px-4">
                        {hasFacility ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <XCircle className="w-3.5 h-3.5 text-slate-600" />
                            No
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Triggers */}
              <tr>
                <td className="py-4 px-3 font-semibold text-slate-400">Action</td>
                {compareList.map((pg) => (
                  <td key={pg.id} className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectPG(pg);
                        }}
                        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onBookVisit(pg);
                        }}
                        className="w-full py-2 rounded-xl border border-white/[0.1] hover:border-purple-500/40 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
                      >
                        Schedule Visit
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
