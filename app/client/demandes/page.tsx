'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ServiceRequest } from '@/types';
import { DataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { ReviewModal } from '@/components/ReviewModal';
import { TimelineTracker } from '@/components/TimelineTracker';
import { getStatusBadgeStyle, formatDate, formatPrice, getCategoryBadge } from '@/lib/utils';
import { ADMIN_CONTACT } from '@/lib/constants';

export default function ClientRequestsPage() {
  const { profile, user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReviewRequest, setSelectedReviewRequest] = useState<ServiceRequest | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const clientId = profile?.id || user?.id || 'usr_client_guest';
      const data = await DataStore.getRequests({ role: 'client', userId: clientId });
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const handleDataChange = () => {
      loadRequests();
    };

    window.addEventListener('sm_data_change', handleDataChange);
    return () => window.removeEventListener('sm_data_change', handleDataChange);
  }, [profile?.id, user?.id]);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return r.status === 'new' || r.status === 'in_progress';
    return r.status === filterStatus;
  });

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* En-tête Espace Famille */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7ca] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed/50 text-primary text-xs font-bold">
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Espace Famille • Wilaya d'Alger</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
              Mes Réservations &amp; Demandes de Garde
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Suivez en direct l'avancement de vos demandes coordonnées par téléphone avec notre équipe d'Alger.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <span>Explorer d'autres profils</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Filtres de statut en pilules organiques */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: `Toutes (${requests.length})` },
            { key: 'active', label: `En cours (${requests.filter(r => r.status === 'new' || r.status === 'in_progress').length})` },
            { key: 'completed', label: `Terminées (${requests.filter(r => r.status === 'completed').length})` },
            { key: 'cancelled', label: `Annulées (${requests.filter(r => r.status === 'cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap border ${
                filterStatus === tab.key
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-container-lowest border-[#ded7ca] text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="text-xs text-on-surface-variant">Chargement de vos dossiers...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-on-surface">Aucune demande trouvée</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {filterStatus === 'all'
                ? "Vous n'avez pas encore transmis de demande de garde sur TataWafa."
                : `Aucune demande correspondant à ce filtre.`}
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white text-xs font-bold rounded-2xl shadow-xs transition"
              >
                <span>Découvrir les prestataires certifiés</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((req) => {
              const badge = getStatusBadgeStyle(req.status);
              const catBadge = req.listing ? getCategoryBadge(req.listing.category) : null;
              const provider = req.listing?.provider;
              const dossierCode = `TW-ALG-${req.id.slice(-4).toUpperCase()}`;

              return (
                <div
                  key={req.id}
                  className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-5 hover:shadow-md transition"
                >
                  
                  {/* En-tête de la carte */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7ca]/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#f4f1ea] border border-[#ded7ca] shrink-0">
                        {req.listing?.photo_url ? (
                          <img src={req.listing.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-fixed/30 text-primary font-bold text-xs">
                            {catBadge?.shortLabel || 'TW'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant">
                            {catBadge?.label || 'Garde'}
                          </span>
                          <span className="text-xs font-bold text-[#7d562d] bg-[#fcf8ee] border border-[#D4A373]/60 px-2 py-0.5 rounded-full">
                            Dossier {dossierCode}
                          </span>
                        </div>
                        <h3 className="font-serif text-base font-bold text-on-surface mt-1">
                          {req.listing?.title || 'Prestation de garde à Alger'}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          Intervenante : <strong className="text-on-surface">{provider?.full_name || 'Assignée par le coordinateur'}</strong>
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Timeline de la demande */}
                  <TimelineTracker status={req.status} />

                  {/* Grille des détails */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#ded7ca]">
                    <div>
                      <span className="text-on-surface-variant text-[11px] block mb-0.5">Créneau d'intervention</span>
                      <strong className="text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                        {formatDate(req.requested_datetime)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-on-surface-variant text-[11px] block mb-0.5">Commune &amp; Quartier</span>
                      <strong className="text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">location_on</span>
                        {req.address_details || req.listing?.location || 'Alger'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-on-surface-variant text-[11px] block mb-0.5">Règlement convenu</span>
                      <strong className="text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-secondary text-sm material-symbols-fill">payments</span>
                        {req.listing?.price ? formatPrice(req.listing.price, req.listing.price_unit || 'séance') : 'Selon accord'} (Espèces)
                      </strong>
                    </div>
                  </div>

                  {/* Actions contextuelles */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <Link
                      href={`/confirmation/${req.id}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Consulter le bon de réservation complet</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>

                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${ADMIN_CONTACT.phone}`}
                        className="text-xs font-bold text-on-surface-variant hover:text-secondary flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        <span>Contacter Coordinateur</span>
                      </a>

                      {req.status === 'completed' && (
                        req.review ? (
                          <div className="flex items-center gap-1.5 text-xs text-secondary bg-secondary-fixed/50 px-3 py-1.5 rounded-xl border border-secondary/30">
                            <span className="material-symbols-outlined text-sm material-symbols-fill">task_alt</span>
                            <span>Avis publié ({req.review.rating}/5)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedReviewRequest(req)}
                            className="px-4 py-2 bg-wax-gold hover:bg-[#b7895b] text-white text-xs font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm material-symbols-fill">star</span>
                            <span>Laisser un avis certifié</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Modal d'Avis */}
        {selectedReviewRequest && (
          <ReviewModal
            request={selectedReviewRequest}
            isOpen={Boolean(selectedReviewRequest)}
            onClose={() => setSelectedReviewRequest(null)}
            onReviewSubmitted={() => {
              loadRequests();
            }}
          />
        )}

      </div>
    </div>
  );
}
