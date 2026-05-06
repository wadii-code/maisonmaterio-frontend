import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

const ROOMS = [
  {
    name: 'Living Room',
    slug: 'living-room',
    discount: '30% OFF ALL ORDER',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop',
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    discount: '30% OFF ALL ORDER',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
  },
];

export function RoomSection() {
  return (
    <section className="py-20 bg-brand-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ROOMS.map((room, i) => (
            <motion.div
              key={room.slug}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative rounded-3xl overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/20" />
              </div>

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-xs">
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{room.discount}</span>
                  <h3 className="text-2xl font-black text-white mt-1 mb-4">{room.name}</h3>
                  <Link to={`/products?room=${room.slug}`}>
                    <Button variant="primary" size="sm">
                      Shop now
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
