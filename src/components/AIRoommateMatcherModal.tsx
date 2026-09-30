import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  Moon,
  Sun,
  Utensils,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface MatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIRoommateMatcherModal: React.FC<MatcherModalProps> = ({ isOpen, onClose }) => {
  const [sleepSchedule, setSleepSchedule] = useState('flexible');
  const [foodHabit, setFoodHabit] = useState('any');
  const [workStyle, setWorkStyle] = useState('hybrid');
  const [cleanliness, setCleanliness] = useState('moderate');
  const [socialPreference, setSocialPreference] = useState('balanced');
  const [targetCity, setTargetCity] = useState('Hyderabad');

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/match-roommates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sleepSchedule,
          foodHabit,
          workStyle,
          cleanliness,
          socialPreference,
          targetCity,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-white max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini AI • Roommate Compatibility Matcher
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              AI Coliving Compatibility Matcher
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Find your ideal room sharing harmony based on sleep rhythms, habits, and work
              schedules.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
          {analysisResult ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              {/* Match Score Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border border-purple-500/40 text-center relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Coliving Compatibility Score
                </div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 my-2">
                  {analysisResult.matchScore}%
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-bold">
                  {analysisResult.personalityType}
                </div>
              </div>

              {/* Highlights */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Compatibility Strengths
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.compatibilityHighlights?.map((h: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Friction Points */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Habits to Coordinate On
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {analysisResult.potentialFrictionPoints?.map((f: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Room Type & AI Advice */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    Optimal Room Match:
                  </span>
                  <span className="text-xs font-bold text-indigo-300">
                    {analysisResult.recommendedRoomType}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic border-t border-indigo-900/60 pt-2">
                  "{analysisResult.advice}"
                </p>
              </div>

              <button
                onClick={() => setAnalysisResult(null)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz with New Preferences
              </button>
            </div>
          ) : (
            <form onSubmit={handleAnalyze} className="space-y-5">
              {/* Question 1: Sleep Schedule */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  1. When do you typically sleep?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'early', label: 'Early Bird (10 PM - 6 AM)' },
                    { id: 'night', label: 'Night Owl (1 AM - 9 AM)' },
                    { id: 'flexible', label: 'Flexible / Shift Work' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSleepSchedule(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        sleepSchedule === opt.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Food Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  2. Food & Dietary Habits
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'veg', label: 'Strict Pure Vegetarian' },
                    { id: 'non-veg', label: 'Non-Vegetarian' },
                    { id: 'any', label: 'Comfortable with Any' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFoodHabit(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        foodHabit === opt.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Work Schedule */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  3. Work / College Routine
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wfh', label: 'Full Work From Home' },
                    { id: 'office', label: 'Daily Office / Tech Park' },
                    { id: 'hybrid', label: 'Hybrid (WFH + Office)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWorkStyle(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        workStyle === opt.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Cleanliness Standards */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  4. Cleanliness Standard
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'strict', label: 'Strict & Spotless' },
                    { id: 'moderate', label: 'Moderate & Tidy' },
                    { id: 'casual', label: 'Casual / Relaxed' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCleanliness(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        cleanliness === opt.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Destination City
                </label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Hyderabad">Hyderabad (Madhapur / Gachibowli)</option>
                  <option value="Bangalore">Bangalore (Koramangala / HSR / Whitefield)</option>
                  <option value="Pune">Pune (Hinjewadi / Kharadi)</option>
                  <option value="Delhi NCR">Gurgaon Cyber City / Noida</option>
                  <option value="Chennai">Chennai OMR</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? 'Running Gemini AI Analysis...' : 'Compute Compatibility Match'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
