'use client';

import React, { useState, useEffect } from 'react';
import { 
  Profile, 
  ServiceListing, 
  VerificationStatus,
  UserRole
} from '@/types';
import { DataStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatDate, formatPrice, getCategoryBadge } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { VerificationBadge } from '@/components/VerificationBadge';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { role, isConfigured, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'candidates' | 'listings' | 'users'>('candidates');
  
  // Candidates filter and search state
  const [candidateStatusFilter, setCandidateStatusFilter] = useState<string>('all');
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null);

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
      const [allProfiles, allListings] = await Promise.all([
        DataStore.getProfiles(),
        DataStore.getListings({ includeUnverified: true }),
      ]);
      setProfiles(allProfiles);
      setListings(allListings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Check URL parameters for candidate highlighting or tab selection
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        setHighlightId(targetId);
        setActiveTab('candidates');
      }
      const targetTab = params.get('tab');
      if (targetTab === 'candidates' || targetTab === 'listings' || targetTab === 'users') {
        setActiveTab(targetTab);
      }
    }

    // 1. Supabase Realtime Subscription (profiles, service_listings)
    let channel: any = null;
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        channel = supabase
          .channel('admin-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
              setRealtimeNotice(`Candidature / profil prestataire (${payload.eventType}) à ${new Date().toLocaleTimeString('fr-FR')}`);
              loadAllData();
              setTimeout(() => setRealtimeNotice(null), 5000);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'service_listings' },
            (payload) => {
              setRealtimeNotice(`Annonce de service (${payload.eventType}) à ${new Date().toLocaleTimeString('fr-FR')}`);
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

  const handleUpdateCandidateStatus = async (providerId: string, newStatus: VerificationStatus) => {
    setUpdatingCandidateId(providerId);
    try {
      await DataStore.updateVerificationStatus(providerId, newStatus);
      await loadAllData();
    } catch (e: any) {
      alert("Erreur lors de la mise à jour du statut : " + (e.message || e));
    } finally {
      setUpdatingCandidateId(null);
    }
  };

  const handlePromoteToProvider = async (userId: string) => {
    if (!confirm('Voulez-vous attribuer le rôle Prestataire à cet utilisateur ? Son profil passera en attente de vérification physique.')) {
      return;
    }
    try {
      await DataStore.updateUserRole(userId, 'provider');
      await loadAllData();
    } catch (e: any) {
      alert("Erreur lors de l'attribution du rôle : " + (e.message || e));
    }
  };

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression définitive de l'annonce "${title}" ?`)) {
      return;
    }
    try {
      await DataStore.deleteListing(listingId);
      await loadAllData();
    } catch (e: any) {
      alert("Erreur lors de la suppression de l'annonce : " + (e.message || e));
    }
  };

  // Provider Candidatures Breakdown
  const allProviderProfiles = profiles.filter(p => p.role === 'provider');
  const pendingCandidates = allProviderProfiles.filter(
    p => p.verification_status === 'en_attente_physique' || (!p.verification_status && p.role === 'provider')
  );
  const unreviewedCandidates = allProviderProfiles.filter(
    p => p.verification_status === 'non_verifie'
  );
  const verifiedCandidates = allProviderProfiles.filter(
    p => p.verification_status === 'verifie_en_main_propre'
  );
  const suspendedCandidates = allProviderProfiles.filter(
    p => p.verification_status === 'suspendu'
  );

  // Filtered Candidates according to status tab and search query
  const filteredCandidates = allProviderProfiles.filter((p) => {
    if (candidateStatusFilter === 'en_attente_physique') {
      const isPending = p.verification_status === 'en_attente_physique' || !p.verification_status;
      if (!isPending) return false;
    } else if (candidateStatusFilter === 'non_verifie') {
      if (p.verification_status !== 'non_verifie') return false;
    } else if (candidateStatusFilter === 'verifie_en_main_propre') {
      if (p.verification_status !== 'verifie_en_main_propre') return false;
    } else if (candidateStatusFilter === 'suspendu') {
      if (p.verification_status !== 'suspendu') return false;
    }

    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase().trim();
      const code = `CAND-ALG-${p.id.slice(-4)}`.toLowerCase();
      const matchName = p.full_name?.toLowerCase().includes(q);
      const matchPhone = p.phone && p.phone.includes(q);
      const matchLoc = p.location && p.location.toLowerCase().includes(q);
      const matchCode = code.includes(q);
      if (!matchName && !matchPhone && !matchLoc && !matchCode) return false;
    }

    return true;
  });

  const filteredProfiles = profiles.filter((p) => {
    if (userRoleFilter === 'all') return true;
    return p.role === userRoleFilter;
  });

  if (!authLoading && isConfigured && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-error-container text-error rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface">Accès Administrateur Restreint</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Cet espace confidentiel contient les dossiers et numéros de téléphone des candidats et prestataires. Vous devez être connecté avec un compte disposant du rôle <strong>admin</strong>.
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
                <span>Supervision en Direct</span>
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Tableau de Bord &amp; Candidatures Prestataires
            </h1>
            <p className="text-xs sm:text-sm text-[#ded7ca] max-w-2xl leading-relaxed">
              Supervisez toutes les candidatures prestataires, examinez les statuts en direct, validez le Sceau Or après contrôle physique ou suspendez les comptes non conformes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/prestataires"
              className="px-4 py-2.5 bg-secondary hover:bg-secondary-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">checklist</span>
              <span>Espace 7 Pièces Physiques</span>
            </Link>
            <button
              onClick={loadAllData}
              className="p-2.5 bg-[#233241] hover:bg-[#2d3e50] text-white rounded-2xl text-xs transition cursor-pointer"
              title="Actualiser les données"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>
        </div>

        {/* Realtime Alert Banner */}
        {realtimeNotice && (
          <div className="p-4 rounded-2xl bg-secondary text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base animate-pulse">notifications_active</span>
              <span>{realtimeNotice}</span>
            </div>
          </div>
        )}

        {/* Métriques Clés Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => {
              setActiveTab('candidates');
              setCandidateStatusFilter('en_attente_physique');
            }}
            className={`bg-surface-container-lowest rounded-2xl border p-5 shadow-xs cursor-pointer transition ${
              pendingCandidates.length > 0 ? 'border-amber-400 bg-amber-50/40 hover:bg-amber-50/70' : 'border-[#ded7ca] hover:border-primary/40'
            }`}
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              En Attente Bureau
            </span>
            <div className="font-serif text-3xl font-bold text-amber-800 mt-1 flex items-center justify-between">
              <span>{pendingCandidates.length}</span>
              {pendingCandidates.length > 0 ? (
                <span className="material-symbols-outlined text-xl text-amber-600 animate-pulse">schedule</span>
              ) : (
                <span className="material-symbols-outlined text-xl text-slate-400">check_circle</span>
              )}
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Convocation physique requise</span>
          </div>

          <div 
            onClick={() => {
              setActiveTab('candidates');
              setCandidateStatusFilter('non_verifie');
            }}
            className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs cursor-pointer hover:border-primary/40 transition"
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Non Examinés
            </span>
            <div className="font-serif text-3xl font-bold text-slate-700 mt-1 flex items-center justify-between">
              <span>{unreviewedCandidates.length}</span>
              <span className="material-symbols-outlined text-xl text-slate-400">pending</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Nouveaux dossiers inscrits</span>
          </div>

          <div 
            onClick={() => {
              setActiveTab('candidates');
              setCandidateStatusFilter('verifie_en_main_propre');
            }}
            className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs cursor-pointer hover:border-secondary/40 transition"
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Certifiés Sceau Or
            </span>
            <div className="font-serif text-3xl font-bold text-secondary mt-1 flex items-center justify-between">
              <span>{verifiedCandidates.length}</span>
              <span className="material-symbols-outlined text-xl text-secondary material-symbols-fill">verified</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Visibles au catalogue public</span>
          </div>

          <div 
            onClick={() => setActiveTab('listings')}
            className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] p-5 shadow-xs cursor-pointer hover:border-primary/40 transition"
          >
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Annonces Catalogue
            </span>
            <div className="font-serif text-3xl font-bold text-primary mt-1 flex items-center justify-between">
              <span>{listings.length}</span>
              <span className="material-symbols-outlined text-xl text-primary">assignment</span>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-1 block">Services créés par les prestataires</span>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex items-center gap-2 border-b border-[#ded7ca] pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('candidates')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">how_to_reg</span>
            <span>Candidatures Prestataires ({allProviderProfiles.length})</span>
            {pendingCandidates.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'candidates' ? 'bg-white text-primary' : 'bg-amber-200 text-amber-900'
              }`}>
                {pendingCandidates.length} en attente
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">assignment</span>
            <span>Annonces ({listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>Utilisateurs ({profiles.length})</span>
          </button>
        </div>

        {/* TAB 1: CANDIDATURES PRESTATAIRES (MAIN SCREEN) */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            {/* Header & Link to 7 Pieces Checklist */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-[#ded7ca]">
              <div>
                <h3 className="font-serif font-bold text-xl text-on-surface">
                  Gestion Complète des Candidatures Prestataires
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                  Chaque statut est affiché en direct. Vous pouvez modifier le statut d'un prestataire directement ici ou ouvrir l'espace de vérification pour examiner ses 7 pièces physiques.
                </p>
              </div>
              <Link
                href="/admin/prestataires"
                className="px-4 py-2.5 rounded-2xl bg-secondary text-white text-xs font-bold hover:bg-secondary-600 transition flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">fact_check</span>
                <span>Ouvrir l'Espace 7 Pièces</span>
              </Link>
            </div>

            {/* Status Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-3xl border border-[#ded7ca]">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { key: 'all', label: `Tous (${allProviderProfiles.length})` },
                  { key: 'en_attente_physique', label: `En attente bureau (${pendingCandidates.length})` },
                  { key: 'non_verifie', label: `Non examinés (${unreviewedCandidates.length})` },
                  { key: 'verifie_en_main_propre', label: `Sceau Or (${verifiedCandidates.length})` },
                  { key: 'suspendu', label: `Rejetés (${suspendedCandidates.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCandidateStatusFilter(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      candidateStatusFilter === tab.key
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-on-surface-variant hover:text-on-surface border border-[#ded7ca]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  placeholder="Rechercher nom, tél, commune..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#ded7ca] text-xs text-on-surface focus:outline-none focus:border-primary transition"
                />
                {candidateSearch && (
                  <button
                    type="button"
                    onClick={() => setCandidateSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Candidates Grid */}
            {filteredCandidates.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-3xl border border-[#ded7ca] text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
                <h4 className="font-serif text-lg font-bold text-on-surface">Aucune candidature trouvée</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Aucun prestataire ne correspond aux filtres sélectionnés ({candidateStatusFilter !== 'all' ? `filtre: ${candidateStatusFilter}` : ''} {candidateSearch ? `recherche: "${candidateSearch}"` : ''}).
                </p>
                {(candidateStatusFilter !== 'all' || candidateSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateStatusFilter('all');
                      setCandidateSearch('');
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container border border-[#ded7ca] text-xs font-bold text-on-surface hover:bg-[#ede8df] transition"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((candidate) => {
                  const candidateListing = listings.find(l => l.provider_id === candidate.id);
                  const candidateDossierCode = `CAND-ALG-${candidate.id.slice(-4).toUpperCase()}`;
                  const isHighlighted = candidate.id === highlightId;
                  const isUpdating = updatingCandidateId === candidate.id;
                  const currentStatus = candidate.verification_status || 'non_verifie';

                  return (
                    <div
                      key={candidate.id}
                      className={`bg-surface-container-lowest rounded-3xl border p-6 shadow-sm space-y-4 transition ${
                        isHighlighted 
                          ? 'border-primary ring-2 ring-primary/40 bg-amber-50/20' 
                          : 'border-[#ded7ca] hover:border-secondary/40'
                      }`}
                    >
                      {/* Top Row: Name, Dossier Code, Badge */}
                      <div className="flex items-start justify-between gap-3 border-b border-[#ded7ca]/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {candidate.full_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-base text-on-surface">
                                {candidate.full_name}
                              </span>
                              {isHighlighted && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-bold animate-pulse">
                                  Sélectionné
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-outline font-mono block mt-0.5">
                              {candidateDossierCode} • Inscrit le {formatDate(candidate.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge Displayed Prominently on the Card */}
                        <div className="shrink-0">
                          <VerificationBadge status={currentStatus} size="md" />
                        </div>
                      </div>

                      {/* Coordonnées */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#ded7ca]">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Téléphone</span>
                          {candidate.phone ? (
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`tel:${candidate.phone}`}
                                className="font-bold text-primary hover:underline"
                              >
                                {candidate.phone}
                              </a>
                              <a
                                href={`https://wa.me/213${candidate.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Ouvrir WhatsApp"
                              >
                                <span className="material-symbols-outlined text-[17px]">chat</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant italic mt-1 block">Non renseigné</span>
                          )}
                        </div>

                        <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#ded7ca]">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Commune</span>
                          <span className="font-bold text-on-surface mt-1 block truncate">
                            {candidate.location || 'Wilaya d\'Alger'}
                          </span>
                        </div>
                      </div>

                      {/* Annonce associée */}
                      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#ded7ca] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Annonce de Service</span>
                          {candidateListing && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              candidateListing.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {candidateListing.is_active ? 'Active' : 'En attente'}
                            </span>
                          )}
                        </div>

                        {candidateListing ? (
                          <div>
                            <strong className="text-on-surface font-semibold block">{candidateListing.title}</strong>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-on-surface-variant">
                              <span>Tarif : <strong className="text-primary">{candidateListing.price} DA</strong> / {candidateListing.price_unit || 'séance'}</span>
                              <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-bold capitalize">
                                {candidateListing.category === 'babysitting' ? 'Nounou' : 'Soutien'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant italic">
                            Aucune annonce rédigée pour le moment (compte prestataire uniquement).
                          </p>
                        )}
                      </div>

                      {/* Quick Status Buttons directly on the main screen */}
                      <div className="space-y-2 pt-1 border-t border-[#ded7ca]/60">
                        <div className="text-[10px] uppercase font-bold text-on-surface-variant">
                          Actions Rapides de Statut :
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Sceau Or Button */}
                          {currentStatus !== 'verifie_en_main_propre' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateCandidateStatus(candidate.id, 'verifie_en_main_propre')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Valider la vérification physique et décerner le Sceau Or"
                            >
                              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                              <span>Valider Sceau Or</span>
                            </button>
                          )}

                          {/* En attente physique Button */}
                          {currentStatus !== 'en_attente_physique' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateCandidateStatus(candidate.id, 'en_attente_physique')}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Convoquer au bureau pour le contrôle physique"
                            >
                              <span className="material-symbols-outlined text-sm text-amber-600">schedule</span>
                              <span>En attente bureau</span>
                            </button>
                          )}

                          {/* Rejeter / Suspendre Button */}
                          {currentStatus !== 'suspendu' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => {
                                if (confirm(`Confirmez-vous le rejet / la suspension de la candidature de ${candidate.full_name} ?`)) {
                                  handleUpdateCandidateStatus(candidate.id, 'suspendu');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Rejeter ou suspendre cette candidature"
                            >
                              <span className="material-symbols-outlined text-sm text-rose-600">cancel</span>
                              <span>Rejeter</span>
                            </button>
                          )}

                          {/* Checklist Link Button */}
                          <Link
                            href={`/admin/prestataires?id=${candidate.id}`}
                            className="ml-auto px-3.5 py-1.5 rounded-xl bg-secondary text-white hover:bg-secondary-600 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            title="Ouvrir la checklist des 7 pièces physiques justificatives"
                          >
                            <span className="material-symbols-outlined text-sm">fact_check</span>
                            <span>Checklist 7 Pièces →</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANNONCES CATALOGUE */}
        {activeTab === 'listings' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7ca]">
              <h3 className="font-serif font-bold text-lg text-on-surface">Gestion des Annonces Catalogue</h3>
              <span className="text-xs text-on-surface-variant font-bold">{listings.length} annonces</span>
            </div>

            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="p-8 text-center text-xs text-on-surface-variant bg-[#FAF8F5] rounded-2xl border border-[#ded7ca]">
                  Aucune annonce enregistrée dans le catalogue pour le moment.
                </div>
              ) : (
                listings.map(l => (
                  <div key={l.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="font-serif text-sm text-on-surface block">{l.title}</strong>
                      <span className="text-on-surface-variant text-[11px]">
                        Prestataire : {l.provider?.full_name || 'Non spécifié'} • {l.location || 'Alger'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong className="text-primary font-bold">{l.price} DA</strong>
                      <Link
                        href={`/services/${l.id}`}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-[#ded7ca] font-semibold text-xs hover:bg-[#ede8df]"
                      >
                        Voir profil
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(l.id, l.title)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Supprimer définitivement l'annonce"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded7ca]">
              <h3 className="font-serif font-bold text-lg text-on-surface">Annuaire des Utilisateurs</h3>
              <div className="flex gap-2">
                {['all', 'client', 'provider', 'admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
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
                <div key={u.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-on-surface font-semibold">{u.full_name}</strong>
                      <VerificationBadge status={u.verification_status || 'non_verifie'} size="sm" />
                    </div>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      {u.phone || 'Non renseigné'} • {u.location || 'Alger'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed-variant">
                      {u.role}
                    </span>
                    {u.role === 'client' && (
                      <button
                        type="button"
                        onClick={() => handlePromoteToProvider(u.id)}
                        className="px-2.5 py-1 rounded-xl bg-secondary text-white hover:bg-secondary-600 transition text-[11px] font-bold shadow-xs cursor-pointer"
                        title="Convertir ce compte client en prestataire"
                      >
                        Passer en Prestataire
                      </button>
                    )}
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
