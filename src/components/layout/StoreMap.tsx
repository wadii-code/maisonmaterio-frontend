import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

const STORE = {
  address: 'Boulevard Mohammed V, Casablanca, Maroc',
  phone: '+212 645-104432 ',
  email: 'maisonmateriau@gmail.com',
  hours: 'Mon - Sat: 10am - 8pm',
  // Exact store coordinates (33°32'30.1"N 7°36'14.8"W)
  lat: 33.541697,
  lng: -7.604112,
};

export function StoreMap() {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${STORE.lng - 0.01},${STORE.lat - 0.005},${STORE.lng + 0.01},${STORE.lat + 0.005}&layer=mapnik&marker=${STORE.lat},${STORE.lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${STORE.lat},${STORE.lng}`;

  return (
    <section className="bg-brand-card py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-bold text-brand-accent uppercase tracking-[0.2em] mb-3">Visitez-nous</span>
          <h2 className="text-3xl lg:text-4xl font-black text-brand-heading">
            Découvrez notre <span className="text-brand-accent">magasin</span>
          </h2>
          <div className="w-12 h-1 bg-brand-accent mt-3 rounded-full mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-brand-dark text-white rounded-3xl p-6 lg:p-8 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Ouvert maintenant</span>
            </div>

            <h3 className="text-2xl font-black mb-1"> Maison Materiau</h3>
            <p className="text-white/60 text-sm mb-8">Showroom premium & studio de design</p>

            <div className="space-y-5 flex-1">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-lg shrink-0">
                  <MapPin size={16} className="text-brand-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-0.5">Adresse</p>
                  <p className="text-sm text-white/90">{STORE.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-lg shrink-0">
                  <Clock size={16} className="text-brand-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-0.5">Horaires</p>
                  <p className="text-xs text-white ">24h/24 et 7j/7</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-lg shrink-0">
                  <Phone size={16} className="text-brand-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-0.5">Téléphone</p>
                  <a href={`tel:${STORE.phone}`} className="text-sm text-white/90 hover:text-brand-accent transition-colors">{STORE.phone}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-lg shrink-0">
                  <Mail size={16} className="text-brand-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-0.5">E-mail</p>
                  <a href={`mailto:${STORE.email}`} className="text-sm text-white/90 hover:text-brand-accent transition-colors">{STORE.email}</a>
                </div>
              </div>
            </div>

            <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-orange text-white font-bold py-3.5 rounded-full transition-all hover:scale-[1.02] text-sm"
            >
              <Navigation size={16} /> Obtenir l'itinéraire
            </a>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 rounded-3xl overflow-hidden bg-white shadow-sm relative min-h-[400px] lg:min-h-[500px]"
          >
            <iframe
              src={mapSrc}
              className="w-full h-full border-0 absolute inset-0"
              loading="lazy"
              title="Maison Materiau Factory Location"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Custom marker overlay (decorative) */}
            <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-lg p-3 pr-4 flex items-center gap-2 pointer-events-none">
              <div className="bg-brand-accent text-white p-1.5 rounded-lg">
                <MapPin size={14} />
              </div>
              <div>
                <p className="text-xs font-black text-brand-heading">Maison Materiau</p>
                <p className="text-[10px] text-gray-400">Casablanca, Morocco</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
