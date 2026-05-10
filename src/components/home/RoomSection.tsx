import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRooms } from '../../hooks/useProducts';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

export function RoomSection() {
  const { data: rooms, isLoading } = useRooms();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [rooms]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 320;
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 24) : cardWidth + 24, behavior: 'smooth' });
  };

  if (!isLoading && (!rooms || rooms.length === 0)) return null;

  return (
    <section className="py-16 lg:py-20 bg-brand-card overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="inline-block text-xs font-bold text-brand-accent uppercase tracking-[0.2em] mb-2">House Parts</span>
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading">
              Shop by <span className="text-brand-accent">room</span>
            </h2>
            <div className="w-12 h-1 bg-brand-accent mt-3 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`p-2.5 rounded-full transition-all ${
                canScrollLeft
                  ? 'bg-white text-brand-heading hover:bg-brand-dark hover:text-white shadow-sm'
                  : 'bg-white/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`p-2.5 rounded-full transition-all ${
                canScrollRight
                  ? 'bg-white text-brand-heading hover:bg-brand-dark hover:text-white shadow-sm'
                  : 'bg-white/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable rail */}
        <div
          ref={scrollRef}
          className="flex gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-[85%] sm:w-[60%] lg:w-[calc((100%-3rem)/2)] shrink-0" />
              ))
            : rooms?.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[calc((100%-3rem)/2)] rounded-3xl overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={room.image_url ?? `https://placehold.co/800x600/1a1a1a/fff?text=${encodeURIComponent(room.name)}`}
                      alt={room.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                    <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 lg:p-6 max-w-[280px]">
                      {room.discount_text && (
                        <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{room.discount_text}</span>
                      )}
                      <h3 className="text-2xl lg:text-3xl font-black text-white mt-1 mb-4">{room.name}</h3>
                      <Link to={`/products?room=${room.slug}`}>
                        <Button variant="primary" size="sm">
                          Shop now <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
