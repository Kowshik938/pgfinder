import React, { useState } from 'react';
import {
  X,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Bed,
  Utensils,
  CreditCard,
  Lock,
} from 'lucide-react';
import { PGItem } from './PGCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface BookingModalProps {
  pg: PGItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ pg, onClose, onSuccess }) => {
  const { dbUser, token, setDemoUser } = useAuth();

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    pg?.rooms?.[0]?.id || null
  );
  const [moveInDate, setMoveInDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [mealPlan, setMealPlan] = useState('VEG_NON_VEG');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!pg) return null;

  // Selected room details
  const selectedRoom =
    pg.rooms?.find((r) => r.id === selectedRoomId) || pg.rooms?.[0] || null;
  const roomRent = selectedRoom ? selectedRoom.rent : pg.monthlyRent;
  const securityDeposit = pg.securityDeposit || roomRent;
  const totalAmount = roomRent + securityDeposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!dbUser) {
        setDemoUser('USER');
      }

      const payload = {
        pgId: pg.id,
        roomId: selectedRoomId,
        moveInDate,
        totalAmount,
        notes: `${notes} [Meal Plan: ${mealPlan}]`,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setBookingConfirmed(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error completing booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e101c] border border-white/[0.08] rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {bookingConfirmed ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Booking Request Sent</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your room reservation request for <strong>{pg.name}</strong> has been transmitted to the
              property manager.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Move-in Date:</span>
                <strong className="text-white">{moveInDate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Monthly Rent:</span>
                <strong className="text-emerald-400">₹{roomRent.toLocaleString()}/mo</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Deposit:</span>
                <strong className="text-white">₹{securityDeposit.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400 font-sans">Status:</span>
                <span className="text-amber-400 font-semibold text-[11px]">
                  Pending Host Confirmation
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/30"
            >
              Done & Return to Listings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-widest mb-1">
                Room Reservation
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Book Your Stay</h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pg.name}</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Room Selection */}
            {pg.rooms && pg.rooms.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Room Sharing Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {pg.rooms.map((room) => {
                    const isSelected = selectedRoomId === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold capitalize">
                          {room.roomType.replace('_', ' ').toLowerCase()}
                        </div>
                        <div className="text-xs font-extrabold text-emerald-400 mt-1">
                          ₹{room.rent.toLocaleString()}
                          <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {room.availableBeds} beds available
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Move-in Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Planned Move-in Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Meal Plan Option */}
            {pg.foodIncluded && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meal Plan Preference
                </label>
                <select
                  value={mealPlan}
                  onChange={(e) => setMealPlan(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="VEG_NON_VEG">Veg & Non-Veg 3 Meals Daily</option>
                  <option value="PURE_VEG">Pure Vegetarian Meals</option>
                  <option value="BREAKFAST_DINNER">Breakfast & Dinner Only</option>
                </select>
              </div>
            )}

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Special Requests or Notes for Host (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Need high floor room, parking space for bike..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>First Month Rent:</span>
                <span className="text-white font-semibold">₹{roomRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Refundable Security Deposit:</span>
                <span className="text-white font-semibold">₹{securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Brokerage / Platform Fee:</span>
                <span className="text-emerald-400 font-semibold">₹0 (Zero Brokerage)</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-sm">
                <span>Total Due at Check-in:</span>
                <span className="text-emerald-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No payment required now. Pay directly to host upon key handover.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Transmitting Request...' : 'Confirm Room Reservation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
