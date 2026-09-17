'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServiceRequest, 
  RequestStatus, 
  Profile, 
  ServiceListing 
} from '@/types';
import { DataStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getStatusBadgeStyle, formatDate, formatPrice, getCategoryBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { role, isConfigured, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'listings'>('requests');
  
  // Requests state
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  
  // Users state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  
  // Listings state
  const [listings, setListings] = useState<ServiceListing[]>([]);
  
  // General state
  const [loading, setLoading] = useState(true);
  const [realtimeNotice, setRealtimeNotice] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allRequests, allProfiles, allListings] = await Promise.all([
        DataStore.getRequests(),
        DataStore.getProfiles(),
        DataStore.getListings({ includeUnverified: true }),
      ]);
      setRequests(allRequests);
      setProfiles(allProfiles);
      setListings(allListings);

      if (selectedRequest) {
        const refreshed = allRequests.find(r => r.id === selectedRequest.id);
        if (refreshed) setSelectedRequest(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // 1. Supabase Realtime Subscription if configured
    let channel: any = null;
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        channel = supabase
          .channel('admin-requests')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'requests' },
            (payload) => {
              setRealtimeNotice(`Nouvelle mise à jour en direct (${payload.eventType}) à ${new Date().toLocaleTimeString('fr-FR')}`);
              loadAllData();
              setTimeout(() => setRealtimeNotice(null), 5000);
            }
          )
          .subscribe();
      }
    }

    // 2. Local reactive event listener
    const handleDataChange = () => {
      loadAllData();
    };

    window.addEventListener('sm_data_change', handleDataChange);

    return () => {
      if (channel) channel.unsubscribe();
      window.removeEventListener('sm_data_change', handleDataChange);
    };
  }, []);

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    await DataStore.updateRequestStatus(requestId, newStatus);
    await loadAllData();
  };

  const filteredRequests = requests.filter((r) => {
    if (requestStatusFilter === 'all') return true;
    return r.status === requestStatusFilter;
  });

  const filteredProfiles = profiles.filter((p) => {
    if (userRoleFilter === 'all') return true;
    return p.role === userRoleFilter;
  });

  const newRequestsCount = requests.filter(r => r.status === 'new').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  if (!authLoading && isConfigured && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-error-container text-error rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface">Accès Administrateur Restreint</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Cet espace confidentiel contient les numéros de téléphone privés des familles et des prestataires. Vous devez être connecté avec un compte disposant du rôle <strong>admin</strong>.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary-600 shadow-xs transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête Espace Admin (Editorial Sanctuary Dark) */}
        <div className="bg-[#17222d] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#233241] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A373]/20 text-[#ffdcbd] text-xs font-bold border border-[#D4A373]/30">
                <span className="material-symbols-outlined text-sm material-symbols-fill">verified_user</span>
                <span>Cellule de Coordination • Wilaya d'Alger</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#c6ebd7] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ligne Directe Active</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Tableau de Bord &amp; Dispatching Téléphonique
            </h1>
            <p className="text-xs sm:text-sm text-[#ded7ca] max-w-2xl leading-relaxed">
              Consultez les demandes des familles en direct, contactez par téléphone les prestataires, contrôlez les pièces d'identité en main propre et mettez à jour les statuts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/prestataires"
              className="px-4 py-2.5 bg-secondary hover:bg-secondary-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Vérifications Physiques</span>
            </Link>
            <button
              onClick={loadAllData}
              className="p-2.5 bg-[#233241] hover:bg-[#2d3e50] text-white rounded-2xl text-xs transition"
              title="Actualiser"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>
        </div>

        {/* Realtime Alert Banner */}
        {realtimeNotice && (
          <div className="p-4 rounded-2xl bg-secondary text-white text-xs font-semibold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base animate-pulse">notifications_active</span>
              <span>{realtimeNotice}</span>
            </div>
          </div>
        )}

        {/* Métriques Clés Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              À Appeler d'Urgence
            </span>
            <div className="font-serif text-3xl font-bold text-primary mt-1 flex items-center justify-between">
              <span>{newRequestsCount}</span>
              <span className="material-symbols-outlined text-xl text-primary animate-pulse">phone_in_talk</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Demandes &lt; 2h</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Missions Confirmées
            </span>
            <div className="font-serif text-3xl font-bold text-secondary mt-1">
              {inProgressCount}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Gardes en cours</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Missions Terminées
            </span>
            <div className="font-serif text-3xl font-bold text-on-surface mt-1">
              {completedCount}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Règlement espèces validé</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Total Prestataires
            </span>
            <div className="font-serif text-3xl font-bold text-wax-gold mt-1 flex items-center justify-between">
              <span>{profiles.filter(p => p.role === 'provider').length}</span>
              <Link href="/admin/prestataires" className="text-xs font-bold text-primary hover:underline">
                Vérifier →
              </Link>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Dossiers Wilaya d'Alger</span>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex items-center gap-2 border-b border-[#ded7ca] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">support_agent</span>
            <span>Dispatching Téléphonique ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Utilisateurs ({profiles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">assignment</span>
            <span>Annonces ({listings.length})</span>
          </button>
        </div>

        {/* TAB 1: DISPATCHING DEMANDES */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filtres de statut */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: 'all', label: `Toutes (${requests.length})` },
                { key: 'new', label: `Nouvelles / À appeler (${newRequestsCount})` },
                { key: 'in_progress', label: `En cours (${inProgressCount})` },
                { key: 'completed', label: `Terminées (${completedCount})` },
                { key: 'cancelled', label: 'Annulées' }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setRequestStatusFilter(t.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                    requestStatusFilter === t.key
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-surface-container-lowest border-[#ded7ca] text-on-surface-variant'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                  progress_activity
                </span>
                <p className="text-xs text-on-surface-variant">Chargement des dossiers...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-3xl border border-[#ded7ca] text-center space-y-3">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">inbox</span>
                <p className="text-xs text-on-surface-variant">Aucune demande trouvée pour ce statut.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => {
                  const badge = getStatusBadgeStyle(req.status);
                  const client = req.client;
                  const provider = req.listing?.provider;
                  const dossierCode = `TW-ALG-${req.id.slice(-4).toUpperCase()}`;

                  return (
                    <div
                      key={req.id}
                      className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7ca]/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-serif font-bold text-base text-on-surface">
                            {dossierCode}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {formatDate(req.created_at)}
                          </span>
                        </div>

                        {/* Status update select */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant font-medium">Statut mission :</span>
                          <select
                            value={req.status}
                            onChange={(e) => handleStatusChange(req.id, e.target.value as RequestStatus)}
                            className="bg-[#FAF8F5] border border-[#ded7ca] rounded-xl px-2.5 py-1 text-xs text-on-surface font-semibold focus:outline-none"
                          >
                            <option value="new">Nouvelle (À appeler)</option>
                            <option value="in_progress">Confirmée &amp; En cours</option>
                            <option value="completed">Terminée (Paiement reçu)</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </div>
                      </div>

                      {/* Main Dual Call Row: Client Phone vs Provider Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client Call Box */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                            Famille d'Alger (Demandeur)
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="font-serif text-sm text-on-surface block">
                                {client?.full_name || 'Client Famille'}
                              </strong>
                              <span className="text-xs text-on-surface-variant">
                                {client?.phone || 'Téléphone non précisé'}
                              </span>
                            </div>
                            {client?.phone && (
                              <a
                                href={`tel:${client.phone}`}
                                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                              >
                                <span className="material-symbols-outlined text-sm">call</span>
                                <span>Appeler</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Provider Call Box */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                            Intervenante Sélectionnée
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="font-serif text-sm text-on-surface block">
                                {provider?.full_name || req.listing?.title || 'Prestataire'}
                              </strong>
                              <span className="text-xs text-on-surface-variant">
                                {provider?.phone || 'Téléphone bureau'}
                              </span>
                            </div>
                            {provider?.phone && (
                              <a
                                href={`tel:${provider.phone}`}
                                className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                              >
                                <span className="material-symbols-outlined text-sm">call</span>
                                <span>Appeler</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="p-3.5 rounded-2xl bg-[#f4f1ea]/60 border border-[#ded7ca] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-on-surface-variant">Date souhaitée : </span>
                          <strong className="text-on-surface">{formatDate(req.requested_datetime)}</strong>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Lieu : </span>
                          <strong className="text-on-surface">{req.address_details || req.listing?.location || 'Alger'}</strong>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Enfants : </span>
                          <strong className="text-on-surface">{req.child_count || 1} ({req.child_age_or_grade || 'Non spécifié'})</strong>
                        </div>
                        <div>
                          <span className="text-secondary font-bold">100% Espèces convenu</span>
                        </div>
                      </div>

                      {req.note && (
                        <p className="text-xs text-on-surface-variant italic bg-[#FAF8F5] p-3 rounded-xl border border-[#ded7ca]">
                          « {req.note} »
                        </p>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7ca]">
              <h3 className="font-serif font-bold text-lg text-on-surface">Annuaire des Utilisateurs</h3>
              <div className="flex gap-2">
                {['all', 'client', 'provider', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      userRoleFilter === r ? 'bg-primary text-white' : 'bg-[#FAF8F5] border border-[#ded7ca] text-on-surface-variant'
                    }`}
                  >
                    {r === 'all' ? 'Tous' : r === 'client' ? 'Familles' : r === 'provider' ? 'Prestataires' : 'Admins'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredProfiles.map(u => (
                <div key={u.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-on-surface font-semibold block">{u.full_name}</strong>
                    <span className="text-on-surface-variant text-[11px]">{u.phone || 'Non renseigné'} • {u.location || 'Alger'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed-variant">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANNONCES */}
        {activeTab === 'listings' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7ca]">
              <h3 className="font-serif font-bold text-lg text-on-surface">Gestion des Annonces Catalogue</h3>
              <span className="text-xs text-on-surface-variant font-bold">{listings.length} annonces</span>
            </div>

            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="font-serif text-sm text-on-surface block">{l.title}</strong>
                    <span className="text-on-surface-variant text-[11px]">
                      Prestataire : {l.provider?.full_name || 'Non spécifié'} • {l.location || 'Alger'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="text-primary font-bold">{l.price} DA</strong>
                    <Link
                      href={`/services/${l.id}`}
                      className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-[#ded7ca] font-semibold text-xs hover:bg-[#ede8df]"
                    >
                      Voir profil public
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
