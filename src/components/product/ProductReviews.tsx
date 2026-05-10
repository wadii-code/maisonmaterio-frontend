import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import type { Review } from '../../types';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  hasPurchased: boolean;
  hasReviewed: boolean;
  isLoggedIn: boolean;
  onSubmit?: (rating: number, comment: string) => Promise<void>;
}

export function ProductReviews({
  rating, reviewCount, reviews = [],
  hasPurchased, hasReviewed, isLoggedIn,
  onSubmit,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !onSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(reviewRating, comment.trim());
      toast.success('Thank you for your review!');
      setComment('');
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { stars, count, percent };
  });

  return (
    <section className="border-t border-gray-100 pt-12 mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Summary */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-black text-brand-heading mb-4">Customer Reviews</h2>
          <div className="bg-brand-card rounded-2xl p-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-brand-heading">{rating.toFixed(1)}</span>
              <span className="text-gray-400">/ 5</span>
            </div>
            <StarRating rating={rating} size="md" />
            <p className="text-sm text-gray-500 mt-2">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>

            {reviewCount > 0 && (
              <div className="space-y-1.5 mt-5">
                {distribution.map(d => (
                  <div key={d.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-500">{d.stars}</span>
                    <Star size={10} className="fill-brand-accent text-brand-accent" />
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.percent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-brand-accent"
                      />
                    </div>
                    <span className="w-6 text-right text-gray-400">{d.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Eligibility CTA */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {!isLoggedIn ? (
                <div className="text-center">
                  <Lock size={20} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Sign in to write a review</p>
                </div>
              ) : hasReviewed ? (
                <div className="text-center">
                  <Star size={20} className="mx-auto text-brand-accent mb-2 fill-brand-accent" />
                  <p className="text-sm text-gray-600 font-semibold">You've already reviewed this product</p>
                </div>
              ) : !hasPurchased ? (
                <div className="text-center">
                  <ShoppingBag size={20} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Only verified buyers can leave reviews</p>
                </div>
              ) : (
                <Button variant="primary" fullWidth onClick={() => setShowForm(!showForm)}>
                  <MessageCircle size={16} /> Write a Review
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Form + Reviews list */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {showForm && hasPurchased && !hasReviewed && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="bg-white border-2 border-brand-accent/30 rounded-2xl p-6 overflow-hidden"
              >
                <h3 className="font-black text-brand-heading mb-4">Share your experience</h3>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your rating</label>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoveredStar(0)}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        type="button" key={n}
                        onClick={() => setReviewRating(n)}
                        onMouseEnter={() => setHoveredStar(n)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star size={28}
                          className={n <= (hoveredStar || reviewRating)
                            ? 'fill-brand-accent text-brand-accent'
                            : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your review</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    required minLength={10}
                    placeholder="What did you love about this product?"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-brand-accent transition-colors text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" loading={submitting} disabled={!comment.trim() || comment.trim().length < 10}>
                    Submit Review
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {reviews.length === 0 ? (
            <div className="bg-brand-card rounded-2xl p-12 text-center">
              <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to share your thoughts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-sm font-black text-brand-accent">
                        {review.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-brand-heading text-sm">{review.profiles?.full_name ?? 'Anonymous'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check size={11} /> Verified buyer
                          </span>
                          <span>·</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Check({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
