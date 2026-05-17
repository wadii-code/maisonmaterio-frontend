import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Sparkles, Truck, ShieldCheck, Heart, Users, ArrowRight, Quote } from 'lucide-react';
import { Button } from '../components/ui/Button';

const VALUES = [
  { icon: Award, title: 'La qualité d\'abord', text: 'Chaque pièce est sélectionnée par nos designers — conçue pour durer au-delà des tendances.' },
  { icon: Sparkles, title: 'Esthétique moderne', text: 'Des lignes épurées, des matériaux chaleureux. Des pièces intemporelles dès le premier jour.' },
  { icon: Truck, title: 'Livraison rapide', text: 'Livraison gratuite dans tout le Maroc pour toute commande de plus de 500 MAD — directement chez vous.' },
  { icon: ShieldCheck, title: 'Paiement à la livraison', text: 'Inspectez vos articles avant de payer. Aucun frais à l\'avance, aucune surprise.' },
];

const STATS = [
  { value: '2k+', label: 'Clients satisfaits' },
  { value: '200+', label: 'Produits sélectionnés' },
  { value: '50+', label: 'Marques premium' },
  { value: '4.9/5', label: 'Note moyenne' },
];

export function About() {
  return (
    <>
      <Helmet><title>À propos — Maison Materiau</title></Helmet>
      <div className="pt-20">
        {/* Hero */}
        <section className="relative bg-brand-dark text-white overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=80"
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-dark" />
          </div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-bold rounded-full mb-6 tracking-[0.2em] uppercase"
            >
              Notre Histoire
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6"
            >
              Des espaces qui vous<br /><span className="text-brand-accent">ressemblent vraiment</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              Maison Materiau est né d'une idée simple : chaque maison mérite des meubles qui racontent une histoire.
              Nous sommes une petite équipe de designers et d'artisans obsédés par les détails.
            </motion.p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl lg:text-5xl font-black text-brand-accent">{s.value}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 lg:py-24 bg-brand-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <span className="text-xs font-bold text-brand-accent uppercase tracking-[0.2em]">Notre Mission</span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mt-3 mb-6">
                Le mobilier de qualité doit être<br/><span className="text-brand-accent">accessible à tous</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Pendant trop longtemps, le mobilier design est resté réservé à ceux prêts à payer le prix fort.
                Nous travaillons directement avec les fabricants — sans intermédiaires — pour vous offrir des
                pièces conçues avec soin, à un prix qui respecte votre budget.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Payez uniquement à la livraison. Inspectez chaque article avant de vous engager. C'est la promesse Maison Materiau.
              </p>
              <Link to="/products">
                <Button variant="primary">Découvrir la collection <ArrowRight size={16} /></Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 grid grid-cols-2 gap-3"
            >
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" alt="" className="rounded-2xl aspect-[3/4] object-cover" />
              <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80" alt="" className="rounded-2xl aspect-[3/4] object-cover translate-y-8" />
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-brand-accent uppercase tracking-[0.2em]">Ce qui nous anime</span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mt-3">Bâti sur quatre principes</h2>
              <div className="w-12 h-1 bg-brand-accent mt-3 rounded-full mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-brand-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-xl mb-4">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-black text-brand-heading mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-16 lg:py-24 bg-brand-dark text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Quote size={32} className="mx-auto text-brand-accent mb-6" />
            <p className="text-2xl lg:text-3xl font-black leading-relaxed mb-6">
              «&nbsp;Nous ne vendons pas des meubles. Nous aidons les gens à construire la maison qu'ils imaginent quand ils ferment les yeux.&nbsp;»
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart size={28} className="mx-auto text-brand-accent mb-4 fill-brand-accent/20" />
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mb-4">Prêt à commencer&nbsp;?</h2>
            <p className="text-gray-500 mb-8">Parcourez la collection et trouvez les pièces qui se sentent comme à la maison.</p>
            <Link to="/products">
              <Button variant="primary" size="lg">Acheter maintenant <ArrowRight size={18} /></Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
