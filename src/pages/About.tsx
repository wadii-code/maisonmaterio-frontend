import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Sparkles, Truck, ShieldCheck, Heart, Users, ArrowRight, Quote } from 'lucide-react';
import { Button } from '../components/ui/Button';

const VALUES = [
  { icon: Award, title: 'Quality first', text: 'Every piece is hand-picked by our designers — built to outlast trends.' },
  { icon: Sparkles, title: 'Modern aesthetic', text: 'Clean lines, warm materials. Pieces that feel timeless from day one.' },
  { icon: Truck, title: 'Fast delivery', text: 'Free nationwide delivery on orders over 500 MAD — direct to your door.' },
  { icon: ShieldCheck, title: 'Cash on delivery', text: 'Inspect your items before you pay. No upfront cost, no surprises.' },
];

const STATS = [
  { value: '10k+', label: 'Happy customers' },
  { value: '200+', label: 'Curated products' },
  { value: '50+', label: 'Premium brands' },
  { value: '4.9/5', label: 'Average rating' },
];

const TEAM = [
  { name: 'Yasmine Alaoui',  role: 'Creative Director',   img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
  { name: 'Karim Benali',    role: 'Head of Operations',  img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { name: 'Layla El Khayat', role: 'Lead Designer',       img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80' },
];

export function About() {
  return (
    <>
      <Helmet><title>About Us — SWIPO</title></Helmet>
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
              Our Story
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6"
            >
              Spaces that feel<br /><span className="text-brand-accent">unmistakably yours</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              SWIPO was born from a simple idea: every home deserves furniture that tells a story.
              We're a small team of designers and craftsmen obsessed with the details.
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
              <span className="text-xs font-bold text-brand-accent uppercase tracking-[0.2em]">Our Mission</span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mt-3 mb-6">
                Beautiful furniture should be<br/><span className="text-brand-accent">accessible to everyone</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                For too long, design-led furniture has been reserved for those willing to pay luxury markups.
                We work directly with manufacturers — cutting out the layers — so you get pieces designed
                with intent, at a price that respects your budget.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Pay only when your order arrives. Inspect every piece before you commit. That's the SWIPO promise.
              </p>
              <Link to="/products">
                <Button variant="primary">Browse the collection <ArrowRight size={16} /></Button>
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
              <span className="text-xs font-bold text-brand-accent uppercase tracking-[0.2em]">What we stand for</span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mt-3">Built on four principles</h2>
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

        {/* Team */}
        <section className="py-16 lg:py-24 bg-brand-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Users size={20} className="mx-auto text-brand-accent mb-2" />
              <span className="text-xs font-bold text-brand-accent uppercase tracking-[0.2em]">The team</span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mt-2">People behind the pieces</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TEAM.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="aspect-square rounded-3xl overflow-hidden mb-4">
                    <img src={m.img} alt={m.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-black text-brand-heading">{m.name}</h3>
                  <p className="text-sm text-brand-accent font-semibold mt-0.5">{m.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-16 lg:py-24 bg-brand-dark text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Quote size={32} className="mx-auto text-brand-accent mb-6" />
            <p className="text-2xl lg:text-3xl font-black leading-relaxed mb-6">
              "We don't sell furniture. We help people build the home they imagine when they close their eyes."
            </p>
            <div className="flex items-center justify-center gap-3">
              <img src={TEAM[0].img} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="text-left">
                <p className="font-bold text-sm">{TEAM[0].name}</p>
                <p className="text-xs text-white/60">{TEAM[0].role}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Heart size={28} className="mx-auto text-brand-accent mb-4 fill-brand-accent/20" />
            <h2 className="text-3xl lg:text-4xl font-black text-brand-heading mb-4">Ready to start?</h2>
            <p className="text-gray-500 mb-8">Browse the collection and find pieces that feel like home.</p>
            <Link to="/products">
              <Button variant="primary" size="lg">Shop now <ArrowRight size={18} /></Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
