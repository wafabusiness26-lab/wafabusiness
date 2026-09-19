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

  // Checklist states for physical verification (7 pièces obligatoires)
  const [idCardChecked, setIdCardChecked] = useState(false);
  const [birthCertificateChecked, setBirthCertificateChecked] = useState(false);
  const [familyRecordChecked, setFamilyRecordChecked] = useState(false);
  const [residenceCertificateChecked, setResidenceCertificateChecked] = useState(false);
  const [criminalRecordChecked, setCriminalRecordChecked] = useState(false);
  const [photosChecked, setPhotosChecked] = useState(false);
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
      setBirthCertificateChecked(Boolean(selectedProvider.birth_certificate_verified));
      setFamilyRecordChecked(Boolean(selectedProvider.family_record_verified));
      setResidenceCertificateChecked(Boolean(selectedProvider.residence_certificate_verified));
      setCriminalRecordChecked(Boolean(selectedProvider.criminal_record_verified));
      setPhotosChecked(Boolean(selectedProvider.photos_verified));
      setDiplomaChecked(Boolean(selectedProvider.diploma_verified));
      setVerificationNotes(selectedProvider.admin_verification_notes || '');
    }
  }, [selectedProvider]);

  const setAllChecked = (val: boolean) => {
    setIdCardChecked(val);
    setBirthCertificateChecked(val);
    setFamilyRecordChecked(val);
    setResidenceCertificateChecked(val);
    setCriminalRecordChecked(val);
    setPhotosChecked(val);
    setDiplomaChecked(val);
  };

  const checkedCount = [
    idCardChecked,
    birthCertificateChecked,
    familyRecordChecked,
    residenceCertificateChecked,
    criminalRecordChecked,
    photosChecked,
    diplomaChecked,
  ].filter(Boolean).length;

  const handleCertify = async (status: VerificationStatus) => {
    if (!selectedProvider) return;
    setUpdating(true);
    try {
      await DataStore.updateVerificationStatus(selectedProvider.id, status, {
        id_card_verified: idCardChecked,
        birth_certificate_verified: birthCertificateChecked,
        family_record_verified: familyRecordChecked,
        residence_certificate_verified: residenceCertificateChecked,
        criminal_record_verified: criminalRecordChecked,
        photos_verified: photosChecked,
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

                {/* Checklist Controls - 7 Pièces Officielles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                        Contrôle des 7 pièces en main propre :
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Inspection physique réalisée au bureau d'Alger.
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      checkedCount === 7 
                        ? 'bg-secondary-fixed text-secondary' 
                        : 'bg-[#ede8df] text-on-surface-variant'
                    }`}>
                      {checkedCount}/7 validées
                    </span>
                  </div>

                  {/* Note persistante obligatoire sur les copies légalisées */}
                  <div className="p-3.5 rounded-2xl bg-[#fcf8ee] border border-[#D4A373] flex items-start gap-2.5 text-xs text-[#7d562d]">
                    <span className="material-symbols-outlined text-[#8c5828] text-lg shrink-0 mt-0.5 material-symbols-fill">
                      gavel
                    </span>
                    <div className="space-y-1">
                      <strong className="block text-sm text-[#422401] font-bold">
                        Règle d'Agrément : Copies Légalisées Obligatoires
                      </strong>
                      <p className="text-on-surface-variant leading-relaxed text-[11px]">
                        Chaque photocopie présentée doit <strong>obligatoirement être une copie conforme légalisée par l'APC (Mairie)</strong>. Aucune photocopie simple non tamponnée n'est recevable.
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action rapide */}
                  <div className="flex items-center justify-end gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAllChecked(true)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container border border-[#ded7ca] text-secondary font-bold hover:bg-[#ede8df] transition flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">done_all</span>
                      <span>Tout cocher (Dossier complet)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllChecked(false)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container border border-[#ded7ca] text-on-surface-variant hover:bg-[#ede8df] transition"
                    >
                      Décocher tout
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {/* 1. Photocopie de la pièce d'identité */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      idCardChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={idCardChecked}
                        onChange={(e) => setIdCardChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-on-surface font-bold">1. Photocopie de la pièce d'identité</strong>
                          <span className="text-[10px] px-1.5 py-0.2 bg-primary-fixed/60 text-primary rounded-md font-bold">Légalisée</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Photocopie légalisée de la CNI biométrique ou passeport en cours de validité.
                        </span>
                      </div>
                    </label>

                    {/* 2. Extrait de naissance */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      birthCertificateChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={birthCertificateChecked}
                        onChange={(e) => setBirthCertificateChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <strong className="text-on-surface font-bold">2. Extrait de naissance</strong>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Extrait d'acte de naissance officiel récent (12S ou état civil).
                        </span>
                      </div>
                    </label>

                    {/* 3. Fiche familiale */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      familyRecordChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={familyRecordChecked}
                        onChange={(e) => setFamilyRecordChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <strong className="text-on-surface font-bold">3. Fiche familiale</strong>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Fiche familiale d'état civil (ou fiche individuelle pour célibataire).
                        </span>
                      </div>
                    </label>

                    {/* 4. Certificat de résidence */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      residenceCertificateChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={residenceCertificateChecked}
                        onChange={(e) => setResidenceCertificateChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <strong className="text-on-surface font-bold">4. Certificat de résidence</strong>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Certificat de résidence récent dans l'une des 57 communes de la Wilaya d'Alger.
                        </span>
                      </div>
                    </label>

                    {/* 5. Casier judiciaire — adultes */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      criminalRecordChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={criminalRecordChecked}
                        onChange={(e) => setCriminalRecordChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-on-surface font-bold">5. Casier judiciaire — adultes</strong>
                          <span className="text-[10px] px-1.5 py-0.2 bg-secondary-fixed text-secondary rounded-md font-bold">Bulletin N°3</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Extrait de casier judiciaire vierge récent (moins de 3 mois).
                        </span>
                      </div>
                    </label>

                    {/* 6. 3 photos */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      photosChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={photosChecked}
                        onChange={(e) => setPhotosChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <strong className="text-on-surface font-bold">6. 3 photos d'identité</strong>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          3 photographies d'identité récentes en couleur au format officiel.
                        </span>
                      </div>
                    </label>

                    {/* 7. Diplôme ou certificat de scolarité */}
                    <label className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      diplomaChecked ? 'bg-secondary-fixed/30 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={diplomaChecked}
                        onChange={(e) => setDiplomaChecked(e.target.checked)}
                        className="mt-0.5 accent-secondary w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-on-surface font-bold">7. Diplôme ou certificat de scolarité</strong>
                          <span className="text-[10px] px-1.5 py-0.2 bg-primary-fixed/60 text-primary rounded-md font-bold">Légalisé</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Photocopie légalisée du diplôme d'État ou certificat de scolarité.
                        </span>
                      </div>
                    </label>
                  </div>
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
