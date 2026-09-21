'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { ServiceListing, ServiceRequest, Review, RequestStatus } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { AdminCallCard } from '@/components/AdminCallCard';
import { formatPrice, formatDate } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

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

    // Supabase Realtime Subscription on requests for this provider
    let channel: any = null;
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        channel = supabase
          .channel(`provider-requests-${providerId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'requests' },
            () => {
              loadData();
            }
          )
          .subscribe();
      }
    }

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('sm_data_change', handleDataChange);
    return () => {
      window.removeEventListener('sm_data_change', handleDataChange);
      if (channel) channel.unsubscribe();
    };
  }, [providerId]);

  // Request filter & action states
  const [requestFilter, setRequestFilter] = useState<string>('all');
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [acceptedModalData, setAcceptedModalData] = useState<{ clientName: string; clientPhone?: string | null } | null>(null);

  const handleAcceptRequest = async (req: ServiceRequest) => {
    const clientName = req.client_name || req.client?.full_name || 'la famille';
    const clientPhone = req.client_phone || req.client?.phone || null;
    setUpdatingRequestId(req.id);
    try {
      await DataStore.updateRequestStatus(req.id, 'in_progress', 'accepted_by_provider');
      setAcceptedModalData({ clientName, clientPhone });
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'acceptation : " + (err.message || err));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleDeclineRequest = async (req: ServiceRequest) => {
    const clientName = req.client_name || req.client?.full_name || 'la famille';
    if (!confirm(`Confirmez-vous vouloir décliner la demande de ${clientName} ? Le client recevra un message lui indiquant que sa demande a été déclinée.`)) {
      return;
    }
    setUpdatingRequestId(req.id);
    try {
      await DataStore.updateRequestStatus(req.id, 'cancelled', 'declined_by_provider');
      setActionNotice(`La demande de ${clientName} a été déclinée. Le client recevra un message explicatif sur son tableau de bord.`);
      await loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors du refus : " + (err.message || err));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Voulez-vous supprimer définitivement cette demande de votre tableau de bord ?")) {
      return;
    }
    setUpdatingRequestId(requestId);
    try {
      await DataStore.deleteRequest(requestId);
      setActionNotice("La demande a été supprimée de votre historique.");
      await loadData();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la suppression : " + (err.message || err));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    setUpdatingRequestId(requestId);
    try {
      await DataStore.updateRequestStatus(requestId, newStatus);
      if (newStatus === 'completed') {
        setActionNotice("Félicitations ! Mission marquée comme terminée. La rémunération en espèces a été perçue.");
      } else if (newStatus === 'cancelled') {
        setActionNotice("La demande a été déclinée / annulée.");
      }
      await loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la demande : " + (err.message || err));
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const isVerified = profile?.verification_status === 'verifie_en_main_propre';

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5.0;

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'all') return true;
    return r.status === requestFilter;
  });

  const newRequestsCount = requests.filter(r => r.status === 'new').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

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
                href="/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-on-surface hover:bg-[#ede8df] text-xs font-bold transition"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span>Modifier mon profil</span>
              </Link>
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
                  Action requise : Contrôle de vos 7 pièces physiques en main propre
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Votre profil est actuellement en attente de vérification physique. Le coordinateur doit inspecter votre dossier complet de 7 pièces (photocopies obligatoirement légalisées par l'APC) au bureau d'Alger afin d'activer votre <strong>Sceau de Vérification Or</strong> et vous rendre visible dans le catalogue public.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-3">
              <Link
                href="/provider/verification"
                className="px-5 py-2.5 bg-tertiary hover:bg-tertiary-container text-white text-xs font-bold rounded-2xl shadow-xs transition text-center"
              >
                Consulter la checklist des 7 pièces légalisées
              </Link>
            </div>
          </div>
        )}

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-secondary text-white text-xs font-bold flex items-center gap-2 shadow-md animate-fadeIn">
            <span className="material-symbols-outlined text-base animate-pulse">check_circle</span>
            <span>{actionNotice}</span>
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

          <div 
            onClick={() => setRequestFilter('new')}
            className={`bg-surface-container-lowest rounded-2xl border p-5 shadow-xs cursor-pointer transition ${
              newRequestsCount > 0 ? 'border-amber-400 bg-amber-50/50' : 'border-[#ded7ca]'
            }`}
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Nouvelles Demandes
            </span>
            <div className="font-serif text-3xl font-bold text-primary mt-1 flex items-center justify-between">
              <span>{newRequestsCount}</span>
              {newRequestsCount > 0 && (
                <span className="material-symbols-outlined text-xl text-amber-600 animate-pulse">
                  notifications_active
                </span>
              )}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">À traiter d'urgence</span>
          </div>

          <div 
            onClick={() => setRequestFilter('in_progress')}
            className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs cursor-pointer hover:border-secondary transition"
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Missions en Cours
            </span>
            <div className="font-serif text-3xl font-bold text-secondary mt-1">
              {inProgressCount}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Rendez-vous confirmés</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Note Familles
            </span>
            <div className="font-serif text-3xl font-bold text-wax-gold mt-1 flex items-center gap-1">
              <span>{avgRating.toFixed(1)}</span>
              <span className="material-symbols-outlined text-xl material-symbols-fill">star</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">{reviews.length} avis reçus</span>
          </div>
        </div>

        {/* SECTION MAJEURE : MISSIONS & DEMANDES DE SERVICES RECUES */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7ca] pb-4">
            <div>
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-on-surface">
                <span className="material-symbols-outlined text-primary text-2xl">pending_actions</span>
                <span>Demandes &amp; Réservations des Familles</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-extrabold">
                  {requests.length}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Contactez directement la famille par téléphone ou WhatsApp, acceptez la mission et convenez de la garde.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'all', label: `Toutes (${requests.length})` },
                { key: 'new', label: `À traiter (${newRequestsCount})` },
                { key: 'in_progress', label: `En cours (${inProgressCount})` },
                { key: 'completed', label: `Terminées (${completedCount})` },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setRequestFilter(t.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    requestFilter === t.key
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Requests */}
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#ded7ca] space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline">inbox</span>
              <p className="text-xs font-semibold text-on-surface">Aucune demande dans cette catégorie.</p>
              <p className="text-[11px] text-on-surface-variant">
                Lorsque des familles réservent votre profil, leurs coordonnées et souhaits de garde apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => {
                const clientName = req.client_name || req.client?.full_name || 'Famille';
                const clientPhone = req.client_phone || req.client?.phone;
                const isUpdating = updatingRequestId === req.id;

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-3xl border transition space-y-4 shadow-xs ${
                      req.status === 'new'
                        ? 'bg-amber-50/30 border-amber-300 ring-1 ring-amber-300/40'
                        : req.status === 'in_progress'
                        ? 'bg-emerald-50/20 border-emerald-300'
                        : req.status === 'completed'
                        ? 'bg-[#FAF8F5] border-[#ded7ca]'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    {/* Header: Family Info & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7ca]/60 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {clientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-on-surface">
                              {clientName}
                            </span>
                            {req.status === 'new' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold animate-pulse">
                                Nouveau
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            Reçu le {formatDate(req.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {req.status === 'new' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span>Nouvelle demande • À traiter</span>
                          </span>
                        )}
                        {req.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">handshake</span>
                            <span>Mission confirmée • En cours</span>
                          </span>
                        )}
                        {req.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Mission terminée avec succès</span>
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            <span>Mission déclinée / annulée</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-surface-container-lowest rounded-2xl border border-[#ded7ca]">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Date souhaitée</span>
                        <strong className="text-on-surface block mt-0.5">{formatDate(req.requested_datetime)}</strong>
                      </div>

                      <div className="p-3 bg-surface-container-lowest rounded-2xl border border-[#ded7ca]">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Lieu / Commune</span>
                        <strong className="text-on-surface block mt-0.5 truncate">{req.address_details || req.listing?.location || 'Alger'}</strong>
                      </div>

                      <div className="p-3 bg-surface-container-lowest rounded-2xl border border-[#ded7ca]">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Enfants</span>
                        <strong className="text-on-surface block mt-0.5">
                          {req.child_count || 1} ({req.child_age_or_grade || 'Non spécifié'})
                        </strong>
                      </div>

                      <div className="p-3 bg-surface-container-lowest rounded-2xl border border-[#ded7ca]">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Règlement convenu</span>
                        <strong className="text-secondary font-bold block mt-0.5">
                          {req.listing?.price ? `${req.listing.price} DA (100% Espèces)` : 'Espèces sur place'}
                        </strong>
                      </div>
                    </div>

                    {/* Note de la famille si présente */}
                    {req.note && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs">
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                          Message de la famille :
                        </span>
                        <p className="text-on-surface italic">« {req.note} »</p>
                      </div>
                    )}

                    {/* Direct Contact & Action Workflow Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#ded7ca]/60">
                      {/* Contact Buttons */}
                      <div className="flex items-center gap-2">
                        {clientPhone ? (
                          <>
                            <a
                              href={`tel:${clientPhone}`}
                              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-sm">call</span>
                              <span>Appeler : {clientPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/213${clientPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                              title="Contacter sur WhatsApp"
                            >
                              <span className="material-symbols-outlined text-sm">chat</span>
                              <span>WhatsApp</span>
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">Numéro non renseigné</span>
                        )}
                      </div>

                      {/* Status Action Buttons for the Provider */}
                      <div className="flex items-center gap-2 justify-end">
                        {req.status === 'new' && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleAcceptRequest(req)}
                              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Confirmer la disponibilité et prendre contact avec la famille"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              <span>Accepter la mission</span>
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleDeclineRequest(req)}
                              className="px-3.5 py-2 rounded-xl bg-surface-container border border-[#ded7ca] text-on-surface-variant hover:text-error text-xs font-bold transition cursor-pointer disabled:opacity-50"
                              title="Décliner la mission"
                            >
                              <span>Décliner</span>
                            </button>
                          </>
                        )}

                        {req.status === 'in_progress' && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateRequestStatus(req.id, 'completed')}
                              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Marquer comme terminée une fois la garde réalisée et payée"
                            >
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                              <span>Marquer comme terminée</span>
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => {
                                if (confirm("Annuler cette mission en cours ?")) {
                                  handleUpdateRequestStatus(req.id, 'cancelled');
                                }
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                              <span>Annuler</span>
                            </button>
                          </>
                        )}

                        {req.status === 'completed' && (
                          <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                            <span className="material-symbols-outlined text-sm">done_all</span>
                            <span>Mission accomplie • Espèces perçues</span>
                          </div>
                        )}

                        {req.status === 'cancelled' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-rose-700 font-semibold italic">Demande déclinée</span>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleDeleteRequest(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Supprimer définitivement de mon tableau"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

        {/* MODAL / POPUP APRES ACCEPTATION PAR LE PRESTATAIRE */}
        {acceptedModalData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F5] rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
                  Merci d'avoir accepté la demande !
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  Nous vous recommandons d'appeler le client (<strong className="text-on-surface">{acceptedModalData.clientName}</strong>) pour convenir de tous les détails dès maintenant et au plus tard dans les prochaines <strong>24 heures</strong>.
                </p>
              </div>

              {acceptedModalData.clientPhone && (
                <div className="p-4 rounded-2xl bg-white border border-[#ded7ca] text-center space-y-2">
                  <span className="text-[11px] uppercase font-bold text-on-surface-variant block">
                    Numéro du client à contacter :
                  </span>
                  <div className="font-mono text-xl font-bold text-primary">
                    {acceptedModalData.clientPhone}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a
                      href={`tel:${acceptedModalData.clientPhone}`}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      <span>Appeler maintenant</span>
                    </a>
                    <a
                      href={`https://wa.me/213${acceptedModalData.clientPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAcceptedModalData(null)}
                  className="w-full py-3 rounded-2xl bg-surface-container border border-[#ded7ca] text-on-surface hover:bg-[#ede8df] text-xs font-bold transition cursor-pointer"
                >
                  J'ai compris • Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
