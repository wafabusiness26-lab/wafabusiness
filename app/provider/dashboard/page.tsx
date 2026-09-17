'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { ServiceListing, ServiceRequest, Review } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { AdminCallCard } from '@/components/AdminCallCard';
import { formatPrice } from '@/lib/utils';

export default function ProviderDashboardPage() {
  const { profile, user } = useAuth();
  const providerId = profile?.id || user?.id || 'usr_provider_guest';

  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [l, reqs, revs] = await Promise.all([
        DataStore.getProviderListing(providerId),
        DataStore.getRequests({ role: 'provider', userId: providerId }),
        DataStore.getReviewsForProvider(providerId),
      ]);
      setListing(l);
      setRequests(reqs);
      setReviews(revs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('sm_data_change', handleDataChange);
    return () => window.removeEventListener('sm_data_change', handleDataChange);
  }, [providerId]);

  const isVerified = profile?.verification_status === 'verifie_en_main_propre';

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5.0;

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profil Header */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary-fixed text-secondary font-serif font-bold text-2xl flex items-center justify-center border border-secondary/30 shrink-0">
                {profile?.full_name?.charAt(0) || 'P'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
                    {profile?.full_name || 'Espace Prestataire'}
                  </h1>
                  <VerificationBadge status={profile?.verification_status || 'en_attente_physique'} size="sm" />
                </div>
                <p className="text-xs text-on-surface-variant">
                  {profile?.phone || 'Numéro non renseigné'} • {profile?.location || 'Wilaya d\'Alger'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/provider/annonces"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>Gérer mon annonce</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Alerte si le dossier physique n'est pas encore vérifié */}
        {!isVerified && (
          <div className="bg-[#fcf8ee] border border-[#D4A373] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdcbd] text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl material-symbols-fill">verified_user</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-[#422401]">
                  Action requise : Contrôle de vos pièces originales en main propre
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Votre profil est actuellement en attente de vérification physique. Le coordinateur doit inspecter votre pièce d'identité originale et vos diplômes au bureau d'Alger afin d'activer votre <strong>Sceau de Vérification Or</strong> et vous rendre visible dans le catalogue public.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-3">
              <Link
                href="/provider/verification"
                className="px-5 py-2.5 bg-tertiary hover:bg-tertiary-container text-white text-xs font-bold rounded-2xl shadow-xs transition text-center"
              >
                Consulter la checklist des documents originaux
              </Link>
            </div>
          </div>
        )}

        {/* Statistiques Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Statut Catalogue
            </span>
            <div className="font-serif text-lg font-bold text-on-surface mt-1">
              {listing ? (isVerified ? 'Publiée & Vérifiée' : 'En attente badge') : 'Aucune annonce'}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Missions Reçues
            </span>
            <div className="font-serif text-3xl font-bold text-primary mt-1">
              {requests.length}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Avis Familles
            </span>
            <div className="font-serif text-3xl font-bold text-secondary mt-1">
              {reviews.length}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Note Famille
            </span>
            <div className="font-serif text-3xl font-bold text-wax-gold mt-1 flex items-center gap-1">
              <span>{avgRating.toFixed(1)}</span>
              <span className="material-symbols-outlined text-xl material-symbols-fill">star</span>
            </div>
          </div>
        </div>

        {/* Mon Annonce Publiée */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#ded7ca] pb-4">
            <div className="flex items-center gap-2 font-serif font-bold text-lg text-on-surface">
              <span className="material-symbols-outlined text-primary text-xl">assignment</span>
              <span>Mon Annonce de Prestation</span>
            </div>
            <Link
              href="/provider/annonces"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Modifier l'annonce</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center space-y-2">
              <span className="material-symbols-outlined text-2xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-xs text-on-surface-variant">Chargement...</p>
            </div>
          ) : !listing ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-on-surface-variant">Vous n'avez pas encore configuré votre annonce de garde ou soutien.</p>
              <Link
                href="/provider/annonces"
                className="inline-block px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-2xl shadow-xs"
              >
                Créer mon annonce maintenant
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-serif text-lg font-bold text-on-surface">{listing.title}</h4>
                <strong className="text-primary font-bold text-base">
                  {formatPrice(listing.price, listing.price_unit || 'séance')}
                </strong>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{listing.description}</p>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-2 border-t border-[#ded7ca]">
                <span>Commune : <strong className="text-on-surface">{listing.location || 'Alger'}</strong></span>
                <span>•</span>
                <span>Disponibilités : <strong className="text-on-surface">{listing.availability || 'Sur demande'}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Coordination & Contact Admin */}
        <AdminCallCard
          title="Ligne directe du coordinateur pour les prestataires"
          subtitle="Une question sur une mission ou votre visite de contrôle physique ? Contactez-nous à tout moment."
        />

      </div>
    </div>
  );
}
