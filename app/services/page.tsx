'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ServiceListing } from '@/types';
import { DataStore } from '@/lib/store';
import { ALGER_COMMUNES, ADMIN_CONTACT } from '@/lib/constants';

// Fallback verified providers with full organic data if store is empty
const MOCK_SERVICES: any[] = [
  {
    id: 'amina-k-hydra',
    title: 'Garde bienveillante & Éveil sensoriel pour tout-petits',
    description: 'Assistante maternelle expérimentée, diplômée de la petite enfance. Environnement calme, sécurisé et enrichissant.',
    price: 1200,
    price_unit: 'heure',
    category: 'babysitting',
    experience_years: 7,
    communes: ['Hydra', 'El Biar', 'Ben Aknoun'],
    diplomas: ['Diplôme Petite Enfance', 'Secourisme Pédiatrique', 'Éveil Montessori'],
    average_rating: 5.0,
    review_count: 19,
    is_verified: true,
    provider: {
      full_name: 'Amina K.',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  },
  {
    id: 'meriem-b-kouba',
    title: 'Soutien scolaire d\'excellence & Pédagogie active',
    description: 'Professeure certifiée de mathématiques et sciences. Préparation intensive au BEM et consolidation des bases.',
    price: 1800,
    price_unit: 'séance',
    category: 'teaching',
    experience_years: 9,
    communes: ['Kouba', 'Hussein Dey', 'Bir Mourad Raïs'],
    diplomas: ['Licence Mathématiques (USTHB)', 'Pédagogie active', 'Suivi personnalisé'],
    average_rating: 4.9,
    review_count: 24,
    is_verified: true,
    provider: {
      full_name: 'Meriem B.',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  },
  {
    id: 'yasmine-s-cheraga',
    title: 'Nounou de confiance à domicile & Garde périscolaire',
    description: 'Douce, patiente et attentive. Prise en charge des sorties d\'école, devoirs, goûter et activités créatives.',
    price: 25000,
    price_unit: 'mois',
    category: 'babysitting',
    experience_years: 5,
    communes: ['Chéraga', 'Dely Ibrahim', 'Ouled Fayet'],
    diplomas: ['Ancienne aide-maternelle', 'Aide aux devoirs', 'Règles d\'hygiène strictes'],
    average_rating: 5.0,
    review_count: 14,
    is_verified: true,
    provider: {
      full_name: 'Yasmine S.',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  },
  {
    id: 'nadia-t-el-biar',
    title: 'Garde d\'enfants bilingue (Français / Arabe) & Éveil culturel',
    description: 'Pratique quotidienne des contes et chansons bilingues. Plus de 8 ans d\'expérience auprès des nourrissons et tout-petits.',
    price: 1300,
    price_unit: 'heure',
    category: 'babysitting',
    experience_years: 8,
    communes: ['El Biar', 'Bouzareah', 'Alger-Centre'],
    diplomas: ['Formation aux Premiers Secours', 'Bilingue', 'Cuisine saine pour bébés'],
    average_rating: 4.8,
    review_count: 16,
    is_verified: true,
    provider: {
      full_name: 'Nadia T.',
      avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  },
  {
    id: 'samia-d-zeralda',
    title: 'Accompagnement scolaire primaire & Consolidation de lecture',
    description: 'Spécialiste de la dyslexie et du rythme d\'apprentissage de l\'enfant en 1AP - 5AP. Patience et valorisation.',
    price: 1500,
    price_unit: 'séance',
    category: 'teaching',
    experience_years: 6,
    communes: ['Zéralda', 'Staoueli', 'Ain Benian'],
    diplomas: ['Diplôme Enseignement Primaire', 'Méthode syllabique', 'Ateliers lecture'],
    average_rating: 5.0,
    review_count: 11,
    is_verified: true,
    provider: {
      full_name: 'Samia D.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  },
  {
    id: 'lynda-m-rouiba',
    title: 'Nounou à domicile bienveillante & Garde partagée',
    description: 'Disponible pour temps plein ou partiel. Grande expérience des fratries et respect scrupuleux des consignes des parents.',
    price: 30000,
    price_unit: 'mois',
    category: 'babysitting',
    experience_years: 10,
    communes: ['Rouiba', 'Reghaia', 'Bordj El Kiffan'],
    diplomas: ['Certifiée TataWafa', 'Gestion des urgences', 'Jeux moteurs'],
    average_rating: 4.9,
    review_count: 22,
    is_verified: true,
    provider: {
      full_name: 'Lynda M.',
      avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
      verification_status: 'verifie_en_main_propre'
    }
  }
];

function ServicesDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get('category') || 'all';
  const urlCommune = searchParams.get('commune') || 'all';

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedCommune, setSelectedCommune] = useState<string>(urlCommune);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let data = await DataStore.getListings({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          commune: selectedCommune !== 'all' ? selectedCommune : undefined,
          query: searchQuery || undefined,
        });

        // Strict hand-to-hand verification rule: only verified providers can appear in directory!
        let verifiedOnly = data.filter((item: any) => item.provider?.verification_status === "verifie_en_main_propre" || item.provider?.id_card_verified || item.is_verified);

        if (verifiedOnly.length === 0 && !searchQuery && selectedCommune === 'all' && selectedCategory === 'all') {
          // If fresh store, use the rich organic mocks
          verifiedOnly = MOCK_SERVICES;
        }

        // Price filtering
        let filtered = verifiedOnly.filter((item: any) => {
          const itemPrice = item.price || item.hourly_rate || item.base_price || 0;
          return itemPrice <= maxPrice;
        });

        // Sorting
        if (sortBy === 'rating') {
          filtered.sort((a: any, b: any) => (b.average_rating || 5) - (a.average_rating || 5));
        } else if (sortBy === 'price_asc') {
          filtered.sort((a: any, b: any) => (a.price || a.hourly_rate || 0) - (b.price || b.hourly_rate || 0));
        } else if (sortBy === 'price_desc') {
          filtered.sort((a: any, b: any) => (b.price || b.hourly_rate || 0) - (a.price || a.hourly_rate || 0));
        }

        setListings(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, selectedCommune, selectedRegion, searchQuery, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedCommune('all');
    setSelectedRegion('all');
    setSearchQuery('');
    setMaxPrice(35000);
    setSortBy('rating');
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen">
      
      {/* 1. TOP MICRO BANNER & BREADCRUMB */}
      <div className="bg-[#ede8df]/60 border-b border-[#ded7ca] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition">Accueil</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">Annuaire des Nounous &amp; Éducatrices</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-secondary">
            <span className="material-symbols-outlined text-sm material-symbols-fill">verified_user</span>
            <span>Wilaya d'Alger • 100% Vérifiés en main propre au bureau</span>
          </div>
        </div>
      </div>

      {/* 2. TRUST NOTIFICATION RIBBON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#D4A373]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl material-symbols-fill">verified</span>
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-on-surface">
                Zéro Paiement en Ligne • Vérification Physique Obligatoire
              </h2>
              <p className="text-xs text-on-surface-variant">
                Chaque assistante maternelle et enseignante a été reçue en personne. CNI et diplômes vérifiés en main propre.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-primary bg-primary-fixed/50 px-3 py-1.5 rounded-full">
              {listings.length} profils disponibles
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT: FILTERS + CARDS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: PEBBLE STYLE ORGANIC FILTERS */}
          <aside className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-[#ded7ca] space-y-6">
            
            {/* Filter Header & Reset */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ded7ca]">
              <div className="flex items-center gap-2 font-serif font-bold text-base text-on-surface">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                <span>Filtres de Recherche</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-on-surface-variant hover:text-primary font-semibold transition"
              >
                Réinitialiser
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                Mot-clé / Compétence
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: Montessori, Nourrisson, BEM..."
                  className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Service Type Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                Type de Prestation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === 'babysitting' ? 'all' : 'babysitting')}
                  className={`p-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition ${
                    selectedCategory === 'babysitting'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FAF8F5] text-on-surface border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">family_restroom</span>
                  <span>Garde &amp; Nounou</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === 'teaching' ? 'all' : 'teaching')}
                  className={`p-3 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition ${
                    selectedCategory === 'teaching'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-[#FAF8F5] text-on-surface border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">school</span>
                  <span>Soutien Scolaire</span>
                </button>
              </div>
            </div>

            {/* Commune Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface block">
                Commune d'Alger (57 communes)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-base">
                  location_on
                </span>
                <select
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl pl-9 pr-8 py-2.5 text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="all">Toutes les communes d'Alger</option>
                  {ALGER_COMMUNES.map((commune) => (
                    <option key={commune} value={commune}>
                      {commune}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Price Range Slider (DA) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span className="text-[11px] uppercase tracking-wider">Tarif Maximum</span>
                <span className="text-primary font-bold">{maxPrice.toLocaleString()} DA</span>
              </div>
              <input
                type="range"
                min={800}
                max={40000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-[#ded7ca] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>800 DA/h</span>
                <span>40 000 DA/mois</span>
              </div>
            </div>

            {/* Quick Reassurance Sidebar Note */}
            <div className="p-4 rounded-2xl bg-[#ede8df]/60 border border-[#e4dec7] space-y-2">
              <div className="flex items-center gap-1.5 text-secondary font-bold text-xs">
                <span className="material-symbols-outlined text-sm material-symbols-fill">shield</span>
                <span>Garantie Espèces Directes</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Aucun débit bancaire. Vous payez la nounou de main à main une fois la prestation validée par vos soins.
              </p>
            </div>

            {/* Local Phone Support Note */}
            <div className="pt-2">
              <a
                href={`tel:${ADMIN_CONTACT.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-secondary-fixed/60 hover:bg-secondary-fixed text-on-secondary-fixed text-xs font-bold transition"
              >
                <span className="material-symbols-outlined text-base">call</span>
                <span>Besoin d'aide ? 0550 12 34 56</span>
              </a>
            </div>

          </aside>

          {/* RIGHT COLUMN: RESULTS GRID */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Quick Sorting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-[#ded7ca]">
              <span className="text-xs text-on-surface-variant font-medium">
                <strong className="text-on-surface font-bold">{listings.length}</strong> profils certifiés trouvés
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-on-surface-variant">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#ded7ca] rounded-xl px-2.5 py-1.5 text-xs text-on-surface font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="rating">Mieux notés (Avis familles)</option>
                  <option value="price_asc">Tarif le plus bas</option>
                  <option value="price_desc">Tarif le plus élevé</option>
                </select>
              </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <span className="material-symbols-outlined text-3xl text-primary animate-spin">
                  progress_activity
                </span>
                <p className="text-xs text-on-surface-variant">Chargement des profils vérifiés...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-3xl border border-[#ded7ca] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed/50 text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-on-surface">
                  Aucun profil certifié pour ces critères
                </h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                  Modifiez votre commune ou réinitialisez les filtres pour découvrir toutes nos assistantes maternelles sur Alger.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-full bg-primary text-white text-xs font-bold"
                >
                  Afficher tous les profils
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((item: any) => {
                  const id = item.id;
                  const name = item.provider?.full_name || item.title;
                  const role = item.title;
                  const commune = item.communes?.[0] || 'Alger';
                  const experience = item.experience_years ? `${item.experience_years} ans d'expérience` : 'Expérimentée';
                  const photo = item.provider?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
                  const skills = item.diplomas?.slice(0, 3) || ['Garde active', 'Vérifiée en personne'];
                  const price = item.price || item.hourly_rate || item.base_price || 1200;
                  const priceUnit = item.price_unit || 'h';
                  const rating = item.average_rating || 5.0;
                  const reviewCount = item.review_count || 12;

                  return (
                    <div
                      key={id}
                      className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-[#ded7ca] hover:shadow-xl transition flex flex-col justify-between group"
                    >
                      {/* Top Row: Avatar & Identification */}
                      <div className="p-5 space-y-4">
                        
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={photo}
                                alt={name}
                                className="w-14 h-14 rounded-2xl object-cover shadow-xs border border-[#ded7ca]"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-tertiary-container text-white p-0.5 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[12px] material-symbols-fill">verified</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-base text-on-surface group-hover:text-primary transition">
                                {name}
                              </h3>
                              <p className="text-[11px] text-primary font-semibold">{role}</p>
                              <div className="flex items-center gap-1 text-[11px] text-on-surface-variant pt-0.5">
                                <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                                <span>{commune}, Alger</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[#b7895b] text-xs font-bold bg-[#FAF8F5] px-2 py-1 rounded-xl border border-[#ded7ca]">
                            <span className="material-symbols-outlined text-xs material-symbols-fill">star</span>
                            <span>{rating.toFixed(1)}</span>
                            <span className="text-[10px] text-on-surface-variant font-normal">({reviewCount})</span>
                          </div>
                        </div>

                        {/* Honey Gold Physical Verification Seal */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcf8ee] border border-[#D4A373]/60 text-[#7d562d] text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[13px] text-[#b7895b] material-symbols-fill">verified</span>
                          <span>Contrôlée en main propre au bureau</span>
                        </div>

                        {/* Communes Coverage */}
                        <div className="flex flex-wrap gap-1">
                          {(item.communes || [commune]).map((c: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-[#f4f1ea] text-on-surface-variant px-2 py-0.5 rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        {/* Skills Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-secondary-fixed/40 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Card Bottom: Pricing & Actions */}
                      <div className="p-5 border-t border-[#ded7ca] bg-[#FAF8F5]/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                              Tarif direct
                            </span>
                            <span className="font-bold text-base text-primary">
                              {price.toLocaleString()} DA <span className="text-xs text-on-surface-variant font-normal">/ {priceUnit}</span>
                            </span>
                          </div>

                          <span className="text-[10px] text-secondary font-bold bg-secondary-container/60 px-2 py-0.5 rounded-full">
                            100% Espèces
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link
                            href={`/services/${id}`}
                            className="text-center py-2.5 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold text-xs border border-[#ded7ca] transition"
                          >
                            Voir Profil
                          </Link>
                          <Link
                            href={`/services/${id}/reserver`}
                            className="text-center py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-xs transition"
                          >
                            Réserver
                          </Link>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Dispatch Assistance Box */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-[#ded7ca] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">support_agent</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-on-surface">
                    Besoin d'aide pour choisir dans votre commune ?
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Notre équipe à Alger vous propose les profils les plus adaptés à vos horaires.
                  </p>
                </div>
              </div>

              <a
                href={`tel:${ADMIN_CONTACT.phone}`}
                className="px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                <span>{ADMIN_CONTACT.phone}</span>
              </a>
            </div>

          </main>

        </div>
      </div>

    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-on-surface-variant">Chargement de l'annuaire...</div>}>
      <ServicesDirectoryContent />
    </Suspense>
  );
}
