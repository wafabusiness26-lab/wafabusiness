'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ServiceListing } from '@/types';
import { DataStore } from '@/lib/store';
import { ALGER_COMMUNES, ADMIN_CONTACT } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'babysitting' | 'teaching'>('babysitting');
  const [selectedCommune, setSelectedCommune] = useState('Hydra');
  const [selectedAge, setSelectedAge] = useState('0-3ans');
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('Bonjour, je recherche une nounou vérifiée sur Alger pour mes enfants.');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await DataStore.getListings();
        // Strict hand-to-hand verification rule: only verified providers can appear
        const verified = data.filter(item => item.provider?.verification_status === "verifie_en_main_propre");
        // Sort real-time best ranked services first
        verified.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        setListings(verified);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/services?category=${activeTab}&commune=${encodeURIComponent(selectedCommune)}`);
  };

  const openWhatsAppDirect = () => {
    const cleanPhone = ADMIN_CONTACT.whatsapp.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`;
    window.open(url, '_blank');
    setShowWhatsAppModal(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAF8F5]">
      
      {/* 1. HERO SECTION (Editorial Alabaster, Terracotta & Eucalyptus) */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-28">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[100%] rounded-full bg-primary-fixed/20 blur-[120px]"></div>
          <div className="absolute top-[10%] right-[-5%] w-[45%] h-[90%] rounded-full bg-secondary-fixed/25 blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Micro Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/40 mb-6">
            <span className="material-symbols-outlined text-primary text-base material-symbols-fill">verified_user</span>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
              Plateforme Éthique &amp; Hyper-Locale • Wilaya d'Alger
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-on-surface font-normal tracking-tight mb-6 max-w-4xl mx-auto leading-[1.15]">
            Confiez vos enfants à des mains chaleureuses, <span className="italic font-serif text-primary">vérifiées en personne</span> à Alger.
          </h1>

          <p className="text-[16px] sm:text-[18px] text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Babysitting bienveillant et soutien scolaire d'excellence. Rencontres en personne au bureau, contrôle rigoureux des pièces d'identité et diplômes, coordination téléphonique directe.
          </p>

          {/* Hyper-Local Search Bento Box */}
          <div className="max-w-3xl mx-auto bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(43,58,74,0.06)] border border-outline-variant/30 text-left">
            
            {/* Type Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-[#ede8df] rounded-2xl w-fit mb-6 border border-[#e4dec7]">
              <button
                type="button"
                onClick={() => setActiveTab('babysitting')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'babysitting'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">family_restroom</span>
                <span>Garde d'Enfants &amp; Nounous</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('teaching')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'teaching'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">school</span>
                <span>Soutien Scolaire à Domicile</span>
              </button>
            </div>

            {/* Form Filters Grid */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* Commune Select Input */}
              <div className="md:col-span-6 space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
                  Commune d'Alger (57 communes)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-lg pointer-events-none">
                    location_on
                  </span>
                  <select
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl pl-10 pr-8 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    {ALGER_COMMUNES.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune} (Wilaya d'Alger)
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Age / Level Range */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
                  {activeTab === 'babysitting' ? 'Âge des Enfants' : 'Niveau Scolaire'}
                </label>
                <div className="relative">
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl px-3.5 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                  >
                    {activeTab === 'babysitting' ? (
                      <>
                        <option value="0-3ans">Nourrisson (0-3 ans)</option>
                        <option value="3-6ans">Petite Enfance (3-6 ans)</option>
                        <option value="6-10ans">Périscolaire (6-10 ans)</option>
                        <option value="plus-10ans">+10 ans</option>
                      </>
                    ) : (
                      <>
                        <option value="primaire">Primaire (1AP - 5AP)</option>
                        <option value="cem">Moyen / BEM</option>
                        <option value="lycee">Secondaire / BAC</option>
                        <option value="langues">Langues (Français / Anglais)</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Search CTA */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  <span className="text-sm">Rechercher</span>
                </button>
              </div>
            </form>

            {/* Quick Commune Badges */}
            <div className="pt-5 border-t border-[#ded7ca]/60 mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-on-surface-variant font-medium">Communes très demandées :</span>
              {['Hydra', 'El Biar', 'Kouba', 'Chéraga', 'Dely Ibrahim', 'Rouiba'].map((com) => (
                <button
                  key={com}
                  type="button"
                  onClick={() => setSelectedCommune(com)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border transition ${
                    selectedCommune === com
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-on-surface-variant border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  {com}
                </button>
              ))}
            </div>

          </div>

          {/* Reassurance Indicators Strip */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-on-surface-variant text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg material-symbols-fill">shield_with_heart</span>
              <span>100% Vérifié en Main Propre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-lg material-symbols-fill">cloud_off</span>
              <span>Zéro Document sur Internet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg material-symbols-fill">payments</span>
              <span>0 DA en ligne • 100% Espèces</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">call</span>
              <span>Coordination Humaine 7j/7</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE 4 GOLDEN PILLARS OF TRUST (CHARTE TATAWAFA) */}
      <section className="py-16 md:py-24 bg-[#ede8df]/50 border-y border-[#e4dec7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
              Charte de Sérénité Familiale
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-on-surface font-semibold tracking-tight">
              Les 4 Piliers Inviolables de la Confiance TataWafa
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Une sécurité absolue pensée pour la tranquillité des foyers algérois, sans intermédiaire opaque.
            </p>
          </div>

          {/* Bento Grid for 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-[#ded7ca] hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl material-symbols-fill">how_to_reg</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface mb-2">
                100% Vérification en Main Propre
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Chaque nounou et tuteur est rencontré en personne au bureau d'Alger. CNI, casier judiciaire et diplômes originaux sont méticuleusement contrôlés.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-[#ded7ca] hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl material-symbols-fill">lock</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface mb-2">
                Zéro Document sur Internet
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Aucune pièce d'identité ni diplôme n'est stocké sur le cloud. Vos données et celles des intervenants restent strictement confidentielles et protégées.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-[#ded7ca] hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl material-symbols-fill">price_check</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface mb-2">
                Tarification Transparente (DA)
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tarifs clairs en Dinars Algériens (à l'heure, à la séance ou au mois). Zéro commission surprise, tout est convenu dès le départ.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-[#ded7ca] hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl material-symbols-fill">handshake</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface mb-2">
                Espèces &amp; Contact Direct
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pas besoin de carte bancaire : règlement direct de main à main. Le coordinateur vous accompagne par téléphone à chaque étape.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. PROFILES PREVIEW: FEATURED TATAS VERIFIEES */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary block">
                {listings.length > 0 ? 'Sélection Rigoureuse de la Semaine' : 'Vérification Physique en Main Propre'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-on-surface font-semibold tracking-tight">
                {listings.length > 0 ? 'Tatas et Éducatrices Vedettes à Alger' : 'Services et Annonces à Alger'}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {listings.length > 0
                  ? 'Profils certifiés en personne, évalués par les familles de leurs communes.'
                  : 'Seuls les profils dont l\'identité et les diplômes ont été contrôlés physiquement au bureau d\'Alger apparaissent ici.'}
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-[#ded7ca] transition"
            >
              <span>Voir tout l'annuaire certifié</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Real-time Best Ranked Services or Authentic Empty State */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                progress_activity
              </span>
              <p className="text-xs text-on-surface-variant">Recherche des profils vérifiés en temps réel...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-14 border border-[#ded7ca] text-center max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-[#f4f1ea] text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
                  Pas de services pour maintenant
                </h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Aucun prestataire n'a encore été validé. Seuls les profils dont l'identité et les diplômes ont été contrôlés physiquement en main propre au bureau apparaîtront ici.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/devenir-prestataire"
                  className="px-5 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Vous êtes nounou ou enseignant ? Rejoignez-nous</span>
                </Link>
                <a
                  href={`tel:${ADMIN_CONTACT.phone}`}
                  className="px-5 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-on-surface font-bold text-xs hover:bg-[#ede8df] transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>Permanence Alger : {ADMIN_CONTACT.phone}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {listings.slice(0, 3).map((item: any) => {
                const id = item.id;
                const name = item.provider?.full_name || item.title;
                const role = item.title;
                const commune = item.supported_communes?.[0] || item.location || 'Alger';
                const experience = item.experience_years ? `${item.experience_years} ans d'expérience` : 'Expérimentée';
                const photo = item.provider?.avatar_url || item.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
                const price = item.price || 1200;
                const priceUnit = item.price_unit || 'h';
                const rating = item.average_rating || 5.0;

                return (
                  <div
                    key={id}
                    className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-[#ded7ca] hover:shadow-xl transition flex flex-col group"
                  >
                    {/* Image Frame & Badges */}
                    <div className="relative h-60 w-full overflow-hidden bg-surface-container">
                      <img
                        src={photo}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Honey Gold Physical Verification Seal */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-[#D4A373]">
                        <span className="material-symbols-outlined text-[#b7895b] text-base material-symbols-fill">verified</span>
                        <span className="text-[10px] font-bold text-[#623f18] uppercase tracking-wide">
                          Vérifiée en Main Propre
                        </span>
                      </div>

                      {/* Commune Tag */}
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#ffb59e]">location_on</span>
                        <span>{commune}, Alger</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-lg font-bold text-on-surface">
                            {name}
                          </h3>
                          <div className="flex items-center gap-1 text-[#b7895b] text-xs font-bold">
                            <span className="material-symbols-outlined text-sm material-symbols-fill">star</span>
                            <span>{rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <p className="text-xs text-primary font-semibold">{role}</p>
                        <p className="text-xs text-on-surface-variant">{experience}</p>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="pt-4 border-t border-[#ded7ca] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                            Tarif convenu
                          </span>
                          <span className="font-bold text-sm text-primary">
                            {price.toLocaleString()} DA <span className="text-[11px] text-on-surface-variant font-normal">/ {priceUnit}</span>
                          </span>
                        </div>

                        <Link
                          href={`/services/${id}`}
                          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-sm transition"
                        >
                          Consulter Profil
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 4. INTERACTIVE COVERAGE: LES 57 COMMUNES D'ALGER */}
      <section className="py-16 bg-[#FAF8F5] border-t border-[#e4dec7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-sm border border-[#ded7ca]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                  Couverture Complète Wilaya d'Alger
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-on-surface font-semibold tracking-tight leading-snug">
                  Du Cœur de la Baie aux Collines du Sahel Algérois
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  TataWafa déploie des intervenantes de proximité directement dans votre quartier pour minimiser les temps de trajet et garantir une ponctualité exemplaire.
                </p>
                <div className="pt-2">
                  <Link
                    href="/tarifs-et-communes"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Consulter le détail des 57 communes et tarifs</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Zone 1 */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#ded7ca] space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-base">apartment</span>
                    <span>Alger Centre &amp; Collines</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Hydra, El Biar, Ben Aknoun, El Mouradia, Alger Centre, Kasbah, Bab El Oued, Bouzareah...
                  </p>
                  <span className="text-[10px] font-bold text-secondary block pt-1">100% de disponibilité</span>
                </div>

                {/* Zone 2 */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#ded7ca] space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-base">waves</span>
                    <span>Ouest &amp; Littoral</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Chéraga, Dely Ibrahim, Ouled Fayet, Zéralda, Staoueli, Ain Benian, Draria, Douera...
                  </p>
                  <span className="text-[10px] font-bold text-secondary block pt-1">Garde active &amp; Périscolaire</span>
                </div>

                {/* Zone 3 */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#ded7ca] space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <span className="material-symbols-outlined text-base">sunny</span>
                    <span>Est &amp; Mitidja</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Kouba, Hussein Dey, Bir Mourad Raïs, Mohammadia, Bordj El Kiffan, Rouiba, Reghaia...
                  </p>
                  <span className="text-[10px] font-bold text-secondary block pt-1">Soutien scolaire &amp; Nounous</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS: LE PARCOURS PARENTAL */}
      <section className="py-16 md:py-24 bg-[#ede8df]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
              Simplicité &amp; Sérénité
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-on-surface font-semibold tracking-tight">
              Comment Fonctionne la Mise en Relation
            </h2>
            <p className="text-sm text-on-surface-variant">
              Un accompagnement humain de A à Z par téléphone, sans carte bancaire ni démarche complexe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-[#ded7ca] relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Exprimez Votre Besoin
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Choisissez votre commune et le profil qui correspond aux besoins de vos enfants (garde ponctuelle, temps plein ou soutien scolaire).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-[#ded7ca] relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Validation &amp; Appel Direct
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Notre coordinateur vous contacte par téléphone sous 2 heures pour confirmer les détails et convenir d'une première rencontre à domicile.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-[#ded7ca] relative space-y-4">
              <div className="w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface">
                Garde &amp; Règlement en Espèces
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Votre nounou certifiée prend soin de vos enfants. Le règlement s'effectue directement en espèces (DA) sans aucun paiement en ligne.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ HYPER-LOCALE ALGER */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
              Questions Fréquentes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-on-surface font-semibold tracking-tight">
              Tout ce que les Familles d'Alger Veulent Savoir
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Comment sont vérifiées les pièces d\'identité et les diplômes ?',
                a: 'Chaque prestataire se présente physiquement à notre bureau d\'Alger avec ses originaux (Carte Nationale d\'Identité biométrique, extrait de casier judiciaire bulletin n°3, diplômes ou attestations). Aucun document n\'est numérisé ni téléversé sur Internet.'
              },
              {
                q: 'Pourquoi n\'y a-t-il aucun paiement par carte bancaire sur le site ?',
                a: 'En Algérie, la confiance et la flexibilité passent par le règlement direct en espèces (Dinars Algériens). Les familles règlent directement le prestataire convenu selon les modalités fixées lors de la réservation (à la séance ou en fin de mois).'
              },
              {
                q: 'Puis-je rencontrer la nounou avant de démarrer une garde régulière ?',
                a: 'Absolument. Nous encourageons systématiquement une première visite de présentation de 30 minutes à votre domicile afin que l\'enfant et les parents fassent connaissance avec la nounou en toute sérénité.'
              },
              {
                q: 'Que faire en cas d\'urgence ou de besoin immédiat ?',
                a: 'Notre permanence téléphonique est joignable 7 jours sur 7 au 0550 12 34 56 ou via WhatsApp. Nous mobilisons une nounou disponible dans votre commune en moins de 3 heures.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest rounded-2xl border border-[#ded7ca] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-on-surface hover:text-primary transition"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">
                    {openFaq === idx ? 'remove' : 'add'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-[#ded7ca]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION: DIRECT CONNECTION */}
      <section className="py-16 bg-[#17222d] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-fixed/20 border border-primary-fixed/30 text-primary-fixed text-xs font-bold">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>Permanence Téléphonique Alger 7j/7</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
            Prêt à trouver la personne idéale pour vos enfants ?
          </h2>

          <p className="text-sm sm:text-base text-[#ded7ca] max-w-2xl mx-auto font-normal">
            Appelez-nous directement ou échangez avec le coordinateur sur WhatsApp pour une réponse immédiate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href={`tel:${ADMIN_CONTACT.phone}`}
              className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              <span>Appeler le {ADMIN_CONTACT.phone}</span>
            </a>

            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span>Contacter sur WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* 8. WHATSAPP INTERACTIVE MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ded7ca] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">chat</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-on-surface">
                    Coordination WhatsApp
                  </h3>
                  <p className="text-xs text-on-surface-variant">Liaison directe avec Alger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 rounded-full text-on-surface-variant hover:bg-[#FAF8F5]"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Personnalisez votre message pour le coordinateur TataWafa. Nous vous répondrons dans les plus brefs délais :
            </p>

            <textarea
              value={whatsAppText}
              onChange={(e) => setWhatsAppText(e.target.value)}
              rows={4}
              className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none font-medium"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-[#FAF8F5]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={openWhatsAppDirect}
                className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <span>Ouvrir WhatsApp</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
