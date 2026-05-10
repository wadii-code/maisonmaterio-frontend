import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import video from '../../assets/videos/vid.mp4';



export function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <video src={video} autoPlay loop muted className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Warm light glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-8xl font-black text-white leading-none tracking-tighter mb-4 sm:mb-6"
          >
            Maison Materio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl sm:text-2xl text-white/80 font-light mb-3 leading-relaxed"
          >
            Illuminez Votre Espace
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base text-white/60 mb-10 max-w-lg leading-relaxed"
          >
            Découvrez des meubles haut de gamme, des décorations d’intérieur et des matériaux de construction conçus pour transformer chaque pièce en un véritable chef-d’œuvre.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/products">
              <Button variant="primary" size="lg" className="!rounded-full">
                Shop Now <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/products?tags=NEW">
              <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white hover:!text-brand-dark !rounded-full">
                Explore New Arrivals
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-10 sm:mt-16 flex items-center gap-6 sm:gap-8"
          >
            {[
              { value: '200+', label: 'Unique Products' },
              { value: '50+', label: 'Brands' },
              { value: '2k+', label: 'Happy Customers' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl sm:text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1.5, duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}