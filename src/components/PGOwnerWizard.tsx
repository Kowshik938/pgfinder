import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Bed,
  CheckCircle2,
  Image as ImageIcon,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Utensils,
  Clock,
  Sparkles,
  AlertCircle,
  Wifi,
  Wind,
  Droplets,
  Shirt,
  Zap,
  Car,
  Dumbbell,
  Check,
} from 'lucide-react';
import { PGLocationPicker } from './PGLocationPicker.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface WizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DEFAULT_AMENITIES = [
  { id: 1, name: 'High-Speed Wi-Fi', icon: 'Wifi', category: 'ESSENTIAL' },
  { id: 2, name: 'Air Conditioning (AC)', icon: 'Wind', category: 'COMFORT' },
  { id: 3, name: '3 Times Homely Food', icon: 'Utensils', category: 'ESSENTIAL' },
  { id: 4, name: 'RO Water Purifier', icon: 'Droplets', category: 'ESSENTIAL' },
  { id: 5, name: 'Automatic Washing Machine', icon: 'Shirt', category: 'FACILITY' },
  { id: 6, name: '24/7 Power Backup', icon: 'Zap', category: 'ESSENTIAL' },
  { id: 7, name: 'Daily Housekeeping', icon: 'Sparkles', category: 'FACILITY' },
  { id: 8, name: 'CCTV & Biometric Access', icon: 'ShieldCheck', category: 'SAFETY' },
  { id: 9, name: 'Refrigerator in Common Area', icon: 'Refrigerator', category: 'FACILITY' },
  { id: 10, name: '2-Wheeler & 4-Wheeler Parking', icon: 'Car', category: 'FACILITY' },
  { id: 11, name: 'Gym & Fitness Zone', icon: 'Dumbbell', category: 'COMFORT' },
];

const PRESET_PHOTOS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
];

const DEFAULT_RULES = [
  'No loud music or parties after 10:30 PM',
  'Visitors allowed in lounge area until 8:30 PM',
  'Smoking and alcohol strictly prohibited on premises',
  'Gate closes at 11:00 PM; pre-inform for late entry',
  'Keep shared kitchen and laundry spaces clean after use',
];

export const PGOwnerWizard: React.FC<WizardProps> = ({ onSuccess, onCancel }) => {
  const { token, dbUser, setDemoUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    tagline: '',
    description: '',
    genderType: 'COED', // 'BOYS' | 'GIRLS' | 'COED'
    foodIncluded: true,
    foodType: 'Veg & Non-Veg',
    gateClosingTime: '10:30 PM',
  });

  // Step 2: Location
  const [location, setLocation] = useState({
    city: 'Hyderabad',
    locality: 'Madhapur',
    address: 'Plot 42, Near Cyber Towers, Madhapur',
    latitude: 17.4485,
    longitude: 78.3908,
  });

  // Step 3: Rooms
  const [roomsList, setRoomsList] = useState([
    {
      roomType: 'SINGLE',
      rent: 15000,
      totalBeds: 2,
      availableBeds: 1,
      hasAttachedBathroom: true,
      hasBalcony: true,
      hasAc: true,
      description: 'Executive single private room with dedicated work desk',
    },
    {
      roomType: 'DOUBLE',
      rent: 10500,
      totalBeds: 6,
      availableBeds: 2,
      hasAttachedBathroom: true,
      hasBalcony: false,
      hasAc: true,
      description: 'Spacious 2-sharing room with individual wardrobes',
    },
  ]);

  // Step 4: Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([1, 2, 3, 4, 5, 6, 8]);

  // Step 5: Photos
  const [photos, setPhotos] = useState<string[]>([...PRESET_PHOTOS]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Step 6: Pricing & Rules
  const [pricingRules, setPricingRules] = useState({
    monthlyRent: 10500,
    securityDeposit: 10000,
    noticePeriodDays: 30,
    rules: [...DEFAULT_RULES],
  });
  const [newRule, setNewRule] = useState('');

  // Handlers for Rooms
  const handleAddRoom = () => {
    setRoomsList((prev) => [
      ...prev,
      {
        roomType: 'TRIPLE',
        rent: 8500,
        totalBeds: 6,
        availableBeds: 3,
        hasAttachedBathroom: true,
        hasBalcony: false,
        hasAc: false,
        description: 'Budget-friendly 3-sharing room with high-speed WiFi',
      },
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    if (roomsList.length <= 1) return;
    setRoomsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRoom = (index: number, field: string, value: any) => {
    setRoomsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Toggle Amenity
  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Photo handlers
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    if (photos.length <= 1) return;
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Rules handlers
  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setPricingRules((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule.trim()],
    }));
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setPricingRules((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  // Final Submit
  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!dbUser) {
        setDemoUser('OWNER');
      }

      // Calculate starting rent from lowest room rent
      const lowestRent =
        roomsList.length > 0
          ? Math.min(...roomsList.map((r) => r.rent))
          : pricingRules.monthlyRent;

      const payload = {
        name: basicInfo.name || 'Sri Laxmi Executive Coliving',
        tagline: basicInfo.tagline,
        description: basicInfo.description,
        genderType: basicInfo.genderType,
        city: location.city,
        address: location.address,
        locality: location.locality,
        latitude: location.latitude,
        longitude: location.longitude,
        monthlyRent: lowestRent,
        securityDeposit: pricingRules.securityDeposit,
        noticePeriodDays: pricingRules.noticePeriodDays,
        foodIncluded: basicInfo.foodIncluded,
        foodType: basicInfo.foodType,
        gateClosingTime: basicInfo.gateClosingTime,
        rules: pricingRules.rules,
        roomsData: roomsList,
        imageUrls: photos,
        amenityIds: selectedAmenities,
      };

      const res = await fetch('/api/pgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register PG');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error registering property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step Validation
  const canGoNext = () => {
    if (currentStep === 1) {
      return basicInfo.name.trim().length > 0;
    }
    if (currentStep === 2) {
      return location.address.trim().length > 0;
    }
    if (currentStep === 3) {
      return roomsList.length > 0;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicator Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Phase 3 — PG Owner Registration Wizard
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              List Your Paying Guest Property
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add your rooms, set your pricing, pin your Google Maps location, and welcome tenants.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer self-start sm:self-auto"
          >
            Cancel Listing
          </button>
        </div>

        {/* 7-Step Navigation Pills */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Rooms' },
            { num: 4, label: 'Amenities' },
            { num: 5, label: 'Photos' },
            { num: 6, label: 'Pricing' },
            { num: 7, label: 'Review' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num <= currentStep || canGoNext()) {
                  setCurrentStep(s.num);
                }
              }}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                currentStep === s.num
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : currentStep > s.num
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-950/60 text-slate-500 border border-slate-800'
              }`}
            >
              <div className="text-[10px] uppercase font-bold opacity-80">Step {s.num}</div>
              <div className="text-xs truncate">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step Content Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* ========================================================================= */}
        {/* STEP 1: Basic Information */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Basic Property Information</h3>
              <p className="text-xs text-slate-400">
                Provide the property branding and gender category.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PG Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Sai Luxury Coliving & PG"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Highlights
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 Mins to Cyber Towers • 300 Mbps Fiber WiFi • Homely Food"
                  value={basicInfo.tagline}
                  onChange={(e) => setBasicInfo({ ...basicInfo, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender Category *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'BOYS', label: 'Men / Boys PG' },
                    { type: 'GIRLS', label: 'Women / Girls PG' },
                    { type: 'COED', label: 'Coliving (Co-Ed)' },
                  ].map((g) => (
                    <button
                      key={g.type}
                      type="button"
                      onClick={() => setBasicInfo({ ...basicInfo, genderType: g.type })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        basicInfo.genderType === g.type
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold shadow-md'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your accommodation, neighborhood, community vibe, cleanliness standards, etc."
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Food Included?
                  </label>
                  <select
                    value={basicInfo.foodIncluded ? 'yes' : 'no'}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, foodIncluded: e.target.value === 'yes' })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="yes">Yes, 3 Meals Daily Included</option>
                    <option value="no">No, Self-Cooking / Food Not Included</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gate Closing Time
                  </label>
                  <input
                    type="text"
                    value={basicInfo.gateClosingTime}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, gateClosingTime: e.target.value })
                    }
                    placeholder="e.g. 10:30 PM or 24/7 Biometric"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Location (Google Maps & Places API) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                Select Location via Google Maps & Places
              </h3>
              <p className="text-xs text-slate-400">
                Search nearby tech parks or click on the map to pin exact coordinates.
              </p>
            </div>

            <PGLocationPicker
              initialLocation={location}
              onChange={(newLoc) => setLocation(newLoc)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Locality / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={location.locality}
                  onChange={(e) => setLocation({ ...location, locality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Rooms Configuration */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Room Types & Beds</h3>
                <p className="text-xs text-slate-400">
                  Configure room sharing options, pricing, and available beds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRoom}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room Type
              </button>
            </div>

            <div className="space-y-4">
              {roomsList.map((room, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 relative group"
                >
                  {roomsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Sharing Type
                      </label>
                      <select
                        value={room.roomType}
                        onChange={(e) => handleUpdateRoom(idx, 'roomType', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="SINGLE">Single Room (Private)</option>
                        <option value="DOUBLE">2-Sharing (Double)</option>
                        <option value="TRIPLE">3-Sharing (Triple)</option>
                        <option value="FOUR_SHARING">4-Sharing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Monthly Rent (₹)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={room.rent}
                        onChange={(e) =>
                          handleUpdateRoom(idx, 'rent', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-bold text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Total Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={room.totalBeds}
                        onChange={(e) =>
                          handleUpdateRoom(idx, 'totalBeds', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Available Beds Now
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={room.availableBeds}
                        onChange={(e) =>
                          handleUpdateRoom(idx, 'availableBeds', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500 font-bold text-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Room Perks toggles */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasAc}
                        onChange={(e) => handleUpdateRoom(idx, 'hasAc', e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>Air Conditioning (AC)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasAttachedBathroom}
                        onChange={(e) =>
                          handleUpdateRoom(idx, 'hasAttachedBathroom', e.target.checked)
                        }
                        className="accent-amber-500 rounded"
                      />
                      <span>Attached Washroom</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.hasBalcony}
                        onChange={(e) => handleUpdateRoom(idx, 'hasBalcony', e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>Balcony</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Amenities */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Property Amenities</h3>
              <p className="text-xs text-slate-400">
                Select all features and facilities provided at your PG accommodation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_AMENITIES.map((item) => {
                const isSelected = selectedAmenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAmenity(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/5'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: Photos Gallery */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Photos & Gallery</h3>
              <p className="text-xs text-slate-400">
                Add high-quality photos of bedrooms, washrooms, dining space, and building exterior.
              </p>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-800 h-36 bg-slate-950"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors cursor-pointer"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold">
                      Main Cover
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Add Custom Photo URL */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Add Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Add Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: Pricing & House Rules */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Pricing & House Policies</h3>
              <p className="text-xs text-slate-400">
                Define the security deposit, notice period, and rules tenants must adhere to.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={pricingRules.securityDeposit}
                  onChange={(e) =>
                    setPricingRules({
                      ...pricingRules,
                      securityDeposit: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={pricingRules.noticePeriodDays}
                  onChange={(e) =>
                    setPricingRules({
                      ...pricingRules,
                      noticePeriodDays: parseInt(e.target.value, 10) || 30,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* House Rules Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                House Rules & Policies ({pricingRules.rules.length})
              </label>
              <div className="space-y-2 mb-3">
                {pricingRules.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                  >
                    <span>{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Guests not allowed overnight without prior notice..."
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: Review and Submit */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Review & Submit Listing</h3>
              <p className="text-xs text-slate-400">
                Verify all listing parameters before submitting for verification.
              </p>
            </div>

            {/* Summary Preview Box */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                    {basicInfo.genderType} PG
                  </span>
                  <h4 className="text-xl font-extrabold text-white mt-1.5">
                    {basicInfo.name || 'Sri Sai Luxury Coliving'}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {location.address}, {location.city}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Starting Rent</div>
                  <div className="text-2xl font-black text-amber-400">
                    ₹{Math.min(...roomsList.map((r) => r.rent)).toLocaleString()}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Room Types</span>
                  <strong className="text-white">{roomsList.length} configurations</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Total Beds</span>
                  <strong className="text-white">
                    {roomsList.reduce((acc, r) => acc + r.totalBeds, 0)} beds
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Amenities</span>
                  <strong className="text-white">{selectedAmenities.length} selected</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Photos</span>
                  <strong className="text-white">{photos.length} uploaded</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Your property will be saved to Cloud SQL PostgreSQL with status{' '}
                  <strong>PENDING</strong> verification by the admin team.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                canGoNext()
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Next: Step {currentStep + 1}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Registering Property...' : 'Submit PG Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
