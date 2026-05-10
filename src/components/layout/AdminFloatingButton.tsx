import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function AdminFloatingButton() {
  const { profile } = useAuthStore();
  const location = useLocation();

  // Only show for admins on customer-facing routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = profile?.role === 'admin';

  return (
    <AnimatePresence>
      {isAdmin && !isAdminRoute && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Link
            to="/admin"
            className="group flex items-center gap-2 bg-brand-dark hover:bg-brand-accent text-white pl-4 pr-5 py-3 rounded-full shadow-2xl transition-all hover:scale-105"
          >
            <div className="bg-brand-accent group-hover:bg-white/20 transition-colors p-1.5 rounded-full">
              <LayoutDashboard size={14} />
            </div>
            <span className="text-sm font-bold">Espace admin</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
