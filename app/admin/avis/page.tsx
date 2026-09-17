'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function AdminReviewsModerationPage() {
  const { role, isConfigured, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await DataStore.getAdminReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);
    try {
      await DataStore.deleteReview(reviewToDelete.id);
      setSuccessMessage('Avis supprimé avec succès.');
      setReviewToDelete(null);
      await loadReviews();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (!authLoading && isConfigured && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-error-container text-error rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface">Accès Administrateur Requis</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
          Cet espace de modération est exclusivement réservé au coordinateur de la plateforme TataWafa.
        </p>
      </div>
    );
  }

  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase();
    const comment = (r.comment || '').toLowerCase();
    const clientName = (r.client?.full_name || '').toLowerCase();
    const providerName = (r.provider?.full_name || '').toLowerCase();
    const listingTitle = (r.listing?.title || '').toLowerCase();
    return comment.includes(q) || clientName.includes(q) || providerName.includes(q) || listingTitle.includes(q);
  });

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7ca] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-sm material-symbols-fill">reviews</span>
              <span>Modération Delete-Only Conforme RLS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
              Modération des Avis Clients Vérifiés
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Les avis sont déposés par les familles après mission. L'administrateur peut uniquement supprimer les avis non conformes.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-container-lowest border border-[#ded7ca] text-xs font-bold text-on-surface hover:bg-[#ede8df]"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Retour au dispatching</span>
          </Link>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-secondary-fixed text-secondary text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-surface-container-lowest p-4 rounded-3xl border border-[#ded7ca]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par famille, prestataire, mot-clé dans l'avis..."
              className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <span className="material-symbols-outlined text-2xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="text-xs text-on-surface-variant">Chargement des avis...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-3xl border border-[#ded7ca] text-center text-xs text-on-surface-variant">
            Aucun avis à modérer.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <strong className="text-on-surface font-bold">{rev.client?.full_name || 'Famille'}</strong>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-primary font-medium">Pour : {rev.provider?.full_name || 'Prestataire'}</span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-[11px] text-on-surface-variant">{formatDateShort(rev.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-wax-gold text-xs font-bold">
                    <span className="material-symbols-outlined text-sm material-symbols-fill">star</span>
                    <span>{rev.rating} / 5</span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    « {rev.comment} »
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewToDelete(rev)}
                  className="px-3.5 py-2 rounded-xl bg-error-container text-error hover:bg-error hover:text-white font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-center shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Supprimer</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 border border-[#ded7ca] space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-error font-serif font-bold text-base">
                <span className="material-symbols-outlined text-xl">warning</span>
                <span>Confirmer la suppression de l'avis</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Êtes-vous certain de vouloir supprimer définitivement cet avis de la famille <strong>{reviewToDelete.client?.full_name}</strong> ?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-[#FAF8F5]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-xl bg-error text-white font-bold text-xs shadow-xs"
                >
                  {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
