import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Star, Trash2, MessageCircle } from 'lucide-react';
import { useAdminReviews, useDeleteReview } from '../../hooks/useReviews';
import { StarRating } from '../../components/ui/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export function AdminReviews() {
  const { data: reviews, isLoading } = useAdminReviews();
  const deleteReview = useDeleteReview();

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet avis ? Cette action est irréversible.')) return;
    try {
      await deleteReview.mutateAsync(id);
      toast.success('Avis supprimé');
    } catch (err: any) {
      toast.error(err.message ?? 'Échec de la suppression');
    }
  };

  return (
    <>
      <Helmet><title>Avis — SWIPO Admin</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-brand-heading">Avis</h1>
          <p className="text-gray-400 text-sm mt-0.5">{reviews?.length ?? 0} avis clients</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : !reviews?.length ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
            <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={r.products?.images?.[0] ?? 'https://placehold.co/64x64/f5f5f5/999?text=P'}
                    alt={r.products?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <p className="font-bold text-brand-heading text-sm line-clamp-1">{r.products?.name}</p>
                      <p className="text-xs text-gray-400">par {r.profiles?.full_name ?? 'Anonyme'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{r.comment}</p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="self-end sm:self-start p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Supprimer l'avis"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
