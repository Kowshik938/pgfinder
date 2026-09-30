import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PGItem } from './PGCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ReviewModalProps {
  pg: PGItem | null;
  onClose: () => void;
  onReviewAdded?: () => void;
}

export const ReviewListModal: React.FC<ReviewModalProps> = ({
  pg,
  onClose,
  onReviewAdded,
}) => {
  const { dbUser, token, setDemoUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!pg) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/pg/${pg.id}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [pg?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !pg) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!dbUser) {
        setDemoUser('USER');
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pgId: pg.id,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccessMsg('Thank you! Your verified tenant review has been published.');
      setComment('');
      fetchReviews();
      if (onReviewAdded) onReviewAdded();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error posting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Verified Tenant Ratings
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">{pg.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {pg.rating ? pg.rating.toFixed(1) : '5.0'} / 5.0
              </span>
              <span>•</span>
              <span>Based on {reviews.length} authentic tenant experiences</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Reviews List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
              Loading verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800 p-6">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="font-bold text-white mb-1">No reviews yet</div>
              <p>Be the first tenant to share your stay experience at this property!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                      {r.user?.name ? r.user.name[0].toUpperCase() : 'T'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{r.user?.name || 'Verified Tenant'}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-10">{r.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write a Review Section */}
        <div className="pt-4 border-t border-slate-800 shrink-0">
          {successMsg && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Rate your stay:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Share feedback on cleanliness, food quality, Wi-Fi, host..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
