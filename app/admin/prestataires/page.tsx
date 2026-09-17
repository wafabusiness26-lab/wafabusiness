'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, VerificationStatus } from '@/types';
import { DataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { VerificationBadge } from '@/components/VerificationBadge';

export default function AdminPrestatairesPage() {
  const { role, isConfigured, loading: authLoading } = useAuth();
  const [providers, setProviders] = useState<Profile[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Profile | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Checklist states for physical verification
  const [idCardChecked, setIdCardChecked] = useState(false);
  const [diplomaChecked, setDiplomaChecked] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await DataStore.getProfiles('provider');
      setProviders(data);
      if (selectedProvider) {
        const refreshed = data.find(p => p.id === selectedProvider.id);
        if (refreshed) setSelectedProvider(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      setIdCardChecked(Boolean(selectedProvider.id_card_verified));
      setDiplomaChecked(Boolean(selectedProvider.diploma_verified));
      setVerificationNotes(selectedProvider.admin_verification_notes || '');
    }
  }, [selectedProvider]);

  const handleCertify = async (status: VerificationStatus) => {
    if (!selectedProvider) return;
    setUpdating(true);
    try {
      await DataStore.updateVerificationStatus(selectedProvider.id, status, {
        id_card_verified: idCardChecked,
        diploma_verified: diplomaChecked,
        notes: verificationNotes,
      });
      await loadProviders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (filterStatus !== 'all' && (p.verification_status || 'en_attente_physique') !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (!authLoading && isConfigured && role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 bg-error-container text-error rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface">Accès Administrateur Restreint</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
          Réservé exclusivement au coordinateur agréé de TataWafa.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7ca] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-sm material-symbols-fill">verified_user</span>
              <span>Contrôle Physique &amp; Badges Or</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
              Vérification des Prestataires en Main Propre
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Examinez les pièces originales présentées au bureau et délivrez le Sceau de Vérification Officiel.
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

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-3xl border border-[#ded7ca]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone, commune..."
              className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'en_attente_physique', label: 'En attente bureau' },
              { key: 'verifie_en_main_propre', label: 'Certifiés en main propre' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFilterStatus(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                  filterStatus === t.key
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-[#FAF8F5] border-[#ded7ca] text-on-surface-variant'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Column Layout: List vs Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Provider List */}
          <div className="lg:col-span-6 space-y-3">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <span className="material-symbols-outlined text-2xl text-primary animate-spin">
                  progress_activity
                </span>
                <p className="text-xs text-on-surface-variant">Chargement...</p>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-[#ded7ca] text-center text-xs text-on-surface-variant">
                Aucun prestataire trouvé.
              </div>
            ) : (
              filteredProviders.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProvider(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    selectedProvider?.id === p.id
                      ? 'bg-primary-fixed/40 border-primary shadow-xs'
                      : 'bg-surface-container-lowest border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary font-bold flex items-center justify-center text-xs">
                      {p.full_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <strong className="font-serif font-bold text-sm text-on-surface block">{p.full_name}</strong>
                      <span className="text-[11px] text-on-surface-variant">{p.phone || 'Sans tél'} • {p.location || 'Alger'}</span>
                    </div>
                  </div>

                  <VerificationBadge status={p.verification_status || 'en_attente_physique'} size="sm" />
                </div>
              ))
            )}
          </div>

          {/* Inspection Panel */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-[#ded7ca] space-y-6 shadow-sm sticky top-28">
            {selectedProvider ? (
              <div className="space-y-5">
                <div className="border-b border-[#ded7ca] pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                    Dossier d'Inspection Physique
                  </span>
                  <h3 className="font-serif font-bold text-xl text-on-surface mt-1">
                    {selectedProvider.full_name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1 text-xs text-on-surface-variant">
                    <span>Tél : {selectedProvider.phone || 'Non renseigné'}</span>
                    {selectedProvider.phone && (
                      <a href={`tel:${selectedProvider.phone}`} className="text-primary font-bold hover:underline">
                        Appeler
                      </a>
                    )}
                  </div>
                </div>

                {/* Checklist Controls */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Contrôle des pièces originales au bureau :
                  </h4>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={idCardChecked}
                      onChange={(e) => setIdCardChecked(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="text-xs">
                      <strong className="text-on-surface block">CNI Biométrique originale contrôlée</strong>
                      <span className="text-[11px] text-on-surface-variant">Identité vérifiée en face à face avec le titulaire.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={diplomaChecked}
                      onChange={(e) => setDiplomaChecked(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="text-xs">
                      <strong className="text-on-surface block">Diplômes &amp; Casier B3 originaux inspectés</strong>
                      <span className="text-[11px] text-on-surface-variant">Attestations conformes et certifiées conformes à l'original.</span>
                    </div>
                  </label>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                    Notes du Coordinateur :
                  </label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Observations suite à l'entretien au bureau..."
                    className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleCertify('verifie_en_main_propre')}
                    className="px-5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm material-symbols-fill">verified</span>
                    <span>Délivrer le Sceau Or (Certifié)</span>
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleCertify('en_attente_physique')}
                    className="px-4 py-2.5 rounded-2xl bg-[#fcf8ee] border border-[#D4A373] text-[#7d562d] font-semibold text-xs hover:bg-[#ffdcbd] transition"
                  >
                    Remettre en attente
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-xs text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">person_search</span>
                <p>Sélectionnez un prestataire dans la liste pour vérifier son dossier physique.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
