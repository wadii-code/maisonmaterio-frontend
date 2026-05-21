import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 12 : 16;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={starSize}
            className={i < Math.floor(rating) ? 'fill-brand-accent text-brand-accent' : 'fill-gray-200 text-gray-200'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count} avis)</span>
      )}
    </div>
  );
}
