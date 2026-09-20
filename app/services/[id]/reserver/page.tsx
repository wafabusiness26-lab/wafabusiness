'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ServiceListing } from '@/types';
import { DataStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { ALGER_COMMUNES, ADMIN_CONTACT } from '@/lib/constants';

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { profile, user } = useAuth();

  const [listing, setListing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [commune, setCommune] = useState('Hydra');
  const [addressDetails, setAddressDetails] = useState('');
  
  const [formula, setFormula] = useState<'hourly' | 'monthly' | 'evening'>('hourly');
  const [childCount, setChildCount] = useState<number>(1);
  const [childAge, setChildAge] = useState('2 ans');
  const [startDate, setStartDate] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await DataStore.getListingById(id);
        if (data && data.provider?.verification_status === 'verifie_en_main_propre') {
          setListing(data);
          if (data.supported_communes?.[0]) setCommune(data.supported_communes[0]); else if (data.location) setCommune(data.location);
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  useEffect(() => {
    if (profile) {
      if (!clientName && profile.full_name) setClientName(profile.full_name);
      if (!clientPhone && profile.phone) setClientPhone(profile.phone);
      if (profile.location && profile.location !== 'all') setCommune(profile.location);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant">Préparation du dossier de garde...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#f4f1ea] text-primary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-on-surface">
          Pas de service pour cet identifiant
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
          Cette annonce n'existe pas ou n'a pas encore été vérifiée en main propre.
        </p>
        <Link
          href="/services"
          className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-xs transition"
        >
          Retour aux services
        </Link>
      </div>
    );
  }

  const providerName = listing.provider?.full_name || listing.title;
  const providerRole = listing.title;
  const providerPhoto = listing.provider?.avatar_url || listing.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
  const providerRate = listing.price || 1200;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || listing.provider?.verification_status !== 'verifie_en_main_propre') {
      setError("Ce prestataire n'a pas encore été vérifié en main propre par l'administration et ne peut recevoir de réservations.");
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validClientId = (user?.id && uuidRegex.test(user.id)) 
        ? user.id 
        : (profile?.id && uuidRegex.test(profile.id)) 
          ? profile.id 
          : null;

      // Create request in store
      const newRequest = await DataStore.createRequest({
        listing_id: id,
        client_id: validClientId,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        requested_datetime: `${startDate || new Date().toISOString().split('T')[0]} 14:00`,
        child_count: childCount,
        child_age_or_grade: childAge,
        address_details: `${commune}, ${addressDetails}`,
        note: specialNotes.trim() ? `${specialNotes.trim()} (Formule: ${formula})` : `Formule: ${formula}`,
        duration_hours: formula === 'monthly' ? 80 : 2
      });

      if (!newRequest || !newRequest.id) {
        throw new Error("La base de données n'a retourné aucun identifiant de confirmation pour cette demande.");
      }

      router.push(`/confirmation/${newRequest.id}`);
    } catch (err: any) {
      console.error('Erreur réservation:', err);
      setError(err?.message || 'Une erreur est survenue lors de l\'enregistrement.');
      setSubmitting(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 250, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen">
      
      {/* 1. PROGRESS STEPPER TRACKER (Warm Editorial Alabaster & Clay Motif) */}
      <section className="w-full bg-[#ede8df]/60 pb-8 pt-6 border-b border-[#ded7ca]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Overline Breadcrumb Anchor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Link href={`/services/${id}`} className="hover:text-primary transition flex items-center gap-1">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Retour au profil de {providerName}</span>
              </Link>
              <span>/</span>
              <span className="text-on-surface font-semibold">Finalisation du Dossier de Garde</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-secondary-fixed/70 text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold w-fit">
              <span className="material-symbols-outlined text-sm text-secondary material-symbols-fill">shield</span>
              <span>Dossier Garanti Sans Carte Bancaire • 100% Espèces</span>
            </div>
          </div>

          {/* 3-Step Pill Navigator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className={`p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition border ${
                currentStep === 1
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-[#ded7ca]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1 ? 'bg-white text-primary' : 'bg-secondary-fixed text-secondary'
                }`}>
                  {currentStep > 1 ? (
                    <span className="material-symbols-outlined text-base material-symbols-fill">check</span>
                  ) : '1'}
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    currentStep === 1 ? 'text-primary-fixed' : 'text-secondary'
                  }`}>
                    Étape 01
                  </span>
                  <h3 className="font-serif font-bold text-sm">Famille &amp; Commune</h3>
                </div>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                currentStep === 1 ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-on-surface-variant'
              }`}>
                {commune}
              </span>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setCurrentStep(2)}
              className={`p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition border ${
                currentStep === 2
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-[#ded7ca]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2 ? 'bg-white text-primary' : 'bg-[#ede8df] text-on-surface-variant'
                }`}>
                  {currentStep > 2 ? (
                    <span className="material-symbols-outlined text-base material-symbols-fill">check</span>
                  ) : '2'}
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    currentStep === 2 ? 'text-primary-fixed' : 'text-on-surface-variant'
                  }`}>
                    Étape 02
                  </span>
                  <h3 className="font-serif font-bold text-sm">Rythme &amp; Enfants</h3>
                </div>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                currentStep === 2 ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-on-surface-variant'
              }`}>
                {childCount} enfant{childCount > 1 ? 's' : ''}
              </span>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setCurrentStep(3)}
              className={`p-4 rounded-2xl shadow-xs flex items-center justify-between cursor-pointer transition border ${
                currentStep === 3
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-[#ded7ca]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3 ? 'bg-white text-primary' : 'bg-[#ede8df] text-on-surface-variant'
                }`}>
                  3
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    currentStep === 3 ? 'text-primary-fixed' : 'text-on-surface-variant'
                  }`}>
                    Étape 03
                  </span>
                  <h3 className="font-serif font-bold text-sm">Confirmation &amp; Dispatch</h3>
                </div>
              </div>
              <span className="material-symbols-outlined text-base">phone_callback</span>
            </div>

          </div>

        </div>
      </section>

      {/* 2. MAIN DUAL-COLUMN CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SYNTHESIS & CAREGIVER DOSSIER */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Matched Profile Banner */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-[#ded7ca] space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={providerPhoto}
                    alt={providerName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-[#ded7ca]"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-white p-0.5 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs material-symbols-fill">verified</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-on-surface">{providerName}</h3>
                    <span className="text-[10px] font-bold text-secondary bg-secondary-fixed/60 px-2 py-0.5 rounded-full">
                      100% Vérifiée
                    </span>
                  </div>
                  <p className="text-xs text-primary font-semibold">{providerRole}</p>
                  <p className="text-[11px] text-on-surface-variant">{commune}, Alger</p>
                </div>
              </div>

              {/* Mini Verification Trust Checklist */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-sm material-symbols-fill">task_alt</span>
                  <span>CNI biométrique contrôlée au bureau</span>
                </div>
                <div className="flex items-center gap-2 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-sm material-symbols-fill">task_alt</span>
                  <span>Extrait de casier judiciaire B3 vierge</span>
                </div>
                <div className="flex items-center gap-2 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-sm material-symbols-fill">task_alt</span>
                  <span>Entretien physique d'évaluation validé</span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Tarif convenu</span>
                  <span className="font-serif font-bold text-lg text-primary">
                    {formula === 'monthly' ? '28 000 DA / mois' : `${providerRate} DA / heure`}
                  </span>
                </div>
                <span className="text-[11px] text-secondary font-bold bg-secondary-container/60 px-2.5 py-1 rounded-full">
                  0 DA en ligne
                </span>
              </div>
            </div>

            {/* Reassurance Box */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-[#ded7ca] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Accompagnement Téléphonique Garanti</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Après soumission de ce formulaire, notre coordinateur vous contacte sous 2h par téléphone pour valider l'horaire de la visite de présentation de 30 minutes.
              </p>
              <div className="pt-1">
                <a href={`tel:${ADMIN_CONTACT.phone}`} className="font-bold text-secondary hover:underline">
                  Permanence : {ADMIN_CONTACT.phone}
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STEPPER FORM */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-6">
            
            {error && (
              <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              
              {/* STEP 1: Famille & Coordonnées */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-[#ded7ca] pb-3">
                    <h2 className="font-serif font-bold text-lg text-on-surface">
                      Étape 1 : Vos Coordonnées à Alger
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Pour vous contacter directement et coordonner la mise en relation.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                      Nom et Prénom du Responsable Légal *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Mme Benali Amel"
                      className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                      Numéro de Téléphone (Mobile Algérien) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ex: 0550 12 34 56 ou 0770 00 11 22"
                      className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-[10px] text-on-surface-variant block">
                      Ce numéro servira au coordinateur pour vous appeler directement.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                        Commune d'Alger *
                      </label>
                      <select
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {ALGER_COMMUNES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                        Quartier / Repère
                      </label>
                      <input
                        type="text"
                        value={addressDetails}
                        onChange={(e) => setAddressDetails(e.target.value)}
                        placeholder="Ex: Val d'Hydra, près de l'école"
                        className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!clientName || !clientPhone) {
                          setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
                          return;
                        }
                        setError(null);
                        setCurrentStep(2);
                      }}
                      className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                    >
                      <span>Continuer vers les Détails de Garde</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Rythme & Enfants */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-[#ded7ca] pb-3">
                    <h2 className="font-serif font-bold text-lg text-on-surface">
                      Étape 2 : Rythme &amp; Informations Enfants
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Précisez vos besoins pour préparer au mieux la visite de présentation.
                    </p>
                  </div>

                  {/* Formule Radio Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                      Formule souhaitée
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setFormula('hourly')}
                        className={`p-3 rounded-2xl border text-center transition ${
                          formula === 'hourly'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'bg-[#FAF8F5] border-[#ded7ca] text-on-surface'
                        }`}
                      >
                        Ponctuelle
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormula('monthly')}
                        className={`p-3 rounded-2xl border text-center transition ${
                          formula === 'monthly'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'bg-[#FAF8F5] border-[#ded7ca] text-on-surface'
                        }`}
                      >
                        Mensuelle
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormula('evening')}
                        className={`p-3 rounded-2xl border text-center transition ${
                          formula === 'evening'
                            ? 'bg-primary text-white border-primary shadow-xs font-bold'
                            : 'bg-[#FAF8F5] border-[#ded7ca] text-on-surface'
                        }`}
                      >
                        Soirée
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                        Nombre d'Enfants
                      </label>
                      <select
                        value={childCount}
                        onChange={(e) => setChildCount(Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={1}>1 Enfant</option>
                        <option value={2}>2 Enfants</option>
                        <option value={3}>3 Enfants</option>
                        <option value={4}>4 Enfants ou plus</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                        Âges ou Classes
                      </label>
                      <input
                        type="text"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        placeholder="Ex: 18 mois et 4 ans"
                        className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                      Date de Début Souhaitée
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs sm:text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                      Consignes Particulières / Habitudes de l'Enfant
                    </label>
                    <textarea
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Ex: Sieste à 13h30, allergie aux arachides, devoirs de français..."
                      className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                    >
                      <span>Passer à la Confirmation Finale</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Confirmation & Dispatch */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-[#ded7ca] pb-3">
                    <h2 className="font-serif font-bold text-lg text-on-surface">
                      Étape 3 : Récapitulatif &amp; Envoi du Dossier
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Vérifiez votre demande avant la validation du coordinateur.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
                      <span className="text-on-surface-variant">Prestataire sélectionnée :</span>
                      <span className="font-bold text-on-surface">{providerName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
                      <span className="text-on-surface-variant">Famille &amp; Contact :</span>
                      <span className="font-bold text-on-surface">{clientName} ({clientPhone})</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
                      <span className="text-on-surface-variant">Lieu d'intervention :</span>
                      <span className="font-bold text-on-surface">{commune} ({addressDetails || 'Centre'})</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
                      <span className="text-on-surface-variant">Enfants :</span>
                      <span className="font-bold text-on-surface">{childCount} enfant ({childAge})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">Règlement :</span>
                      <span className="font-bold text-secondary">100% Espèces après accord direct (0 DA en ligne)</span>
                    </div>
                  </div>

                  {/* Charter Commitment */}
                  <div className="p-4 rounded-2xl bg-secondary-fixed/40 border border-secondary/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-secondary">
                      <span className="material-symbols-outlined text-sm material-symbols-fill">check_circle</span>
                      <span>Engagement de Sérénité Amana</span>
                    </div>
                    <p className="text-on-surface-variant">
                      Vous ne payez rien aujourd'hui. Le coordinateur vous contacte d'abord par téléphone pour valider l'adéquation du profil et organiser la première prise de contact.
                    </p>
                  </div>

                  {/* Error Alert on Step 3 directly above submit button */}
                  {error && (
                    <div className="p-4 rounded-2xl bg-error-container text-on-error-container text-xs font-semibold flex items-start gap-3 border border-red-300">
                      <span className="material-symbols-outlined text-lg text-error mt-0.5 shrink-0">error</span>
                      <div className="space-y-1">
                        <div className="font-bold text-sm">Échec de transmission de la demande :</div>
                        <div className="text-xs font-normal leading-relaxed">{error}</div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                    >
                      Modifier les détails
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                          <span>Transmission en cours...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">send</span>
                          <span>Confirmer &amp; Transmettre au Coordinateur</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>

          </div>

        </div>
      </section>

    </div>
  );
}
