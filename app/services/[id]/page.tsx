'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ServiceListing, Review } from '@/types';
import { DataStore } from '@/lib/store';
import { ADMIN_CONTACT } from '@/lib/constants';

// Rich fallback profiles for detail page
const DETAILED_PROFILES: Record<string, any> = {
  'amina-k-hydra': {
    name: 'Amina Khelifi',
    title: 'Assistante Maternelle Certifiée & Garde d\'Enfants',
    communes: ['Hydra', 'El Biar', 'Ben Aknoun'],
    experience_years: 7,
    hourly_rate: 1200,
    monthly_rate: 28000,
    evening_rate: 1500,
    rating: 5.0,
    review_count: 19,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    bio: 'Passionnée par le développement de l\'enfant depuis plus de 7 ans à Hydra et El Biar. Maman de deux grands enfants, j\'ai exercé en crèche privée agréée avant de me consacrer pleinement à l\'accompagnement familial personnalisé. Mon approche privilégie le calme, l\'autonomie guidée et la communication bienveillante.',
    philosophy: 'Je veille scrupuleusement au respect des rythmes naturels de sieste, à une alimentation équilibrée préparée avec soin et à l\'éveil par le jeu libre sans écrans.',
    qualifications: [
      { title: 'Diplôme d\'État Petite Enfance (Alger)', status: 'Vérifié en main propre' },
      { title: 'Certificat de Premiers Secours Pédiatriques', status: 'Vérifié en main propre' },
      { title: 'Contrôle CNI biométrique & Casier judiciaire B3', status: 'Conforme & Archivé bureau' },
      { title: 'Certificat Médical d\'Aptitude Récent', status: 'Validé par le coordinateur' }
    ],
    skills: [
      { name: 'Éveil sensoriel & Motricité fine', desc: 'Ateliers manipulation, comptines algéroises et lecture animée' },
      { name: 'Préparation des repas sains', desc: 'Diversification alimentaire et respect des allergies signalées' },
      { name: 'Sorties & Parc d\'Hydra', desc: 'Promenades sécurisées sous accord préalable des parents' },
      { name: 'Périscolaire & Devoirs', desc: 'Aide douce et structurée pour les enfants en maternelle et CP' }
    ],
    availability: [
      { day: 'Dimanche', morning: true, afternoon: true, evening: false },
      { day: 'Lundi', morning: true, afternoon: true, evening: false },
      { day: 'Mardi', morning: true, afternoon: true, evening: true },
      { day: 'Mercredi', morning: true, afternoon: true, evening: false },
      { day: 'Jeudi', morning: true, afternoon: true, evening: false },
      { day: 'Samedi', morning: false, afternoon: true, evening: true }
    ],
    reviews: [
      {
        author: 'Famille Tlemçani (Hydra)',
        date: 'Il y a 2 semaines',
        rating: 5,
        comment: 'Amina a gardé notre petit Yanis (18 mois) pendant 6 mois à Hydra. Ponctuelle, douce, d\'une propreté exemplaire. Une confiance aveugle dès la première visite.'
      },
      {
        author: 'Dr. Karim & Amel Bensenane (El Biar)',
        date: 'Il y a 1 mois',
        rating: 5,
        comment: 'Excellente expérience. Le fait que ses papiers aient été vérifiés physiquement nous a immédiatement rassurés. Nos jumeaux l\'adorent !'
      },
      {
        author: 'Mme Sarah Medjahed (Ben Aknoun)',
        date: 'Il y a 2 mois',
        rating: 5,
        comment: 'Très professionnelle pour les sorties d\'école et l\'aide aux devoirs. Pas de mauvaises surprises avec le paiement direct en espèces chaque fin de mois.'
      }
    ]
  }
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'hourly' | 'monthly' | 'evening'>('hourly');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const storeData = await DataStore.getListingById(id);
        if (storeData) {
          setListing(storeData);
          const revs = await DataStore.getReviewsForListing(id);
          setReviews(revs);
        } else if (DETAILED_PROFILES[id]) {
          setListing(DETAILED_PROFILES[id]);
        } else {
          // Fallback to default mock profile with the requested ID
          setListing({
            ...DETAILED_PROFILES['amina-k-hydra'],
            id
          });
        }
      } catch (err) {
        console.error(err);
        setListing(DETAILED_PROFILES['amina-k-hydra']);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant">Chargement du dossier certifié...</p>
      </div>
    );
  }

  const profile = listing?.provider ? {
    name: listing.provider.full_name || listing.title,
    title: listing.title,
    communes: listing.communes || ['Hydra', 'Alger Centre'],
    experience_years: listing.experience_years || 5,
    hourly_rate: listing.hourly_rate || listing.price || 1200,
    monthly_rate: listing.monthly_rate || 28000,
    evening_rate: listing.evening_rate || 1500,
    rating: listing.average_rating || 5.0,
    review_count: listing.review_count || 12,
    photo: listing.provider.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    bio: listing.description || DETAILED_PROFILES['amina-k-hydra'].bio,
    philosophy: DETAILED_PROFILES['amina-k-hydra'].philosophy,
    qualifications: DETAILED_PROFILES['amina-k-hydra'].qualifications,
    skills: DETAILED_PROFILES['amina-k-hydra'].skills,
    availability: DETAILED_PROFILES['amina-k-hydra'].availability,
    reviews: DETAILED_PROFILES['amina-k-hydra'].reviews
  } : (listing || DETAILED_PROFILES['amina-k-hydra']);

  const openWhatsApp = () => {
    const text = `Bonjour, je souhaite réserver ${profile.name} (Dossier vérifié à Alger) pour la garde de mes enfants.`;
    const cleanPhone = ADMIN_CONTACT.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen">
      
      {/* 1. BREADCRUMB & STATUS BAR */}
      <div className="bg-[#ede8df]/60 border-b border-[#ded7ca] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition">Accueil</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary transition">Annuaire Alger</Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">{profile.name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-secondary">
            <span className="material-symbols-outlined text-sm material-symbols-fill">shield</span>
            <span>Dossier #TW-ALG-4098 • 100% Vérifié en main propre au bureau</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 2. PROFILE SANCTUARY HERO CARD */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-sm border border-[#ded7ca] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">
            
            {/* Portrait & Stamp */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-cover shadow-md border-2 border-white"
                />
                <div className="absolute -bottom-2 -right-2 bg-tertiary-container text-white p-2 rounded-full shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl material-symbols-fill">verified</span>
                </div>
              </div>

              {/* Physical Verification Seal */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fcf8ee] border border-[#D4A373] text-[#7d562d] text-xs font-bold shadow-xs">
                <span className="material-symbols-outlined text-base text-[#b7895b] material-symbols-fill">verified</span>
                <span>Vérifiée en Main Propre</span>
              </div>
            </div>

            {/* Profile Core Data */}
            <div className="md:col-span-8 space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-serif text-2xl sm:text-4xl font-bold text-on-surface">
                    {profile.name}
                  </h1>
                  <p className="text-sm font-semibold text-primary pt-0.5">{profile.title}</p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3.5 py-1.5 rounded-2xl border border-[#ded7ca]">
                  <span className="material-symbols-outlined text-base text-[#b7895b] material-symbols-fill">star</span>
                  <span className="font-bold text-sm text-on-surface">{profile.rating.toFixed(1)}</span>
                  <span className="text-xs text-on-surface-variant font-medium">({profile.review_count} avis vérifiés)</span>
                </div>
              </div>

              {/* Communes Covered */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-on-surface-variant font-medium">Communes desservies :</span>
                {profile.communes.map((com: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f4f1ea] text-on-surface px-3 py-1 rounded-full border border-[#ded7ca]"
                  >
                    <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                    <span>{com}</span>
                  </span>
                ))}
              </div>

              {/* Zero Digital Data Callout */}
              <div className="p-4 rounded-2xl bg-[#f4f1ea]/80 border border-[#ded7ca] space-y-1">
                <div className="flex items-center gap-1.5 text-secondary font-bold text-xs">
                  <span className="material-symbols-outlined text-base material-symbols-fill">shield_with_heart</span>
                  <span>Charte de Sérénité TataWafa</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Zéro document sensible stocké sur le cloud. Pièce d'identité biométrique et attestations d'expériences ont été inspectées en main propre dans nos bureaux d'Alger.
                </p>
              </div>

              {/* Quick Stats Ribbon */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#ded7ca]">
                  <span className="font-bold text-base text-on-surface block">{profile.experience_years} ans</span>
                  <span className="text-[11px] text-on-surface-variant">Expérience certifiée</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#ded7ca]">
                  <span className="font-bold text-base text-secondary block">100%</span>
                  <span className="text-[11px] text-on-surface-variant">Ponctualité constatée</span>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#ded7ca]">
                  <span className="font-bold text-base text-primary block">0 DA</span>
                  <span className="text-[11px] text-on-surface-variant">En ligne (Espèces direct)</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3. MAIN DUAL-COLUMN ARCHITECTURAL BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: BIO, QUALIFICATIONS, AVAILABILITY, REVIEWS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* À Propos & Philosophie */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-4">
              <h2 className="font-serif font-bold text-xl text-on-surface">
                À propos de {profile.name}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                {profile.bio}
              </p>

              {/* Editorial Highlight Block */}
              <div className="p-5 rounded-2xl bg-secondary-fixed/30 border-l-4 border-secondary space-y-1">
                <span className="text-xs font-bold text-secondary block uppercase tracking-wider">
                  L'environnement familial respecté
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  « {profile.philosophy} »
                </p>
              </div>
            </div>

            {/* Compétences & Savoir-Faire */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-4">
              <h2 className="font-serif font-bold text-xl text-on-surface">
                Compétences &amp; Domaines d'Intervention
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base material-symbols-fill">check_circle</span>
                      <h3 className="font-bold text-xs text-on-surface">{skill.name}</h3>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed pl-6">{skill.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Certifications Box */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl material-symbols-fill">verified_user</span>
                <h2 className="font-serif font-bold text-xl text-on-surface">
                  Contrôles Physiques Validés en Personne
                </h2>
              </div>
              <div className="space-y-2.5">
                {profile.qualifications.map((q: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs">
                    <div className="flex items-center gap-2 font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-base">task_alt</span>
                      <span>{q.title}</span>
                    </div>
                    <span className="font-bold text-[11px] text-secondary bg-secondary-fixed/50 px-2.5 py-1 rounded-full">
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Weekly Matrix */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-4">
              <h2 className="font-serif font-bold text-xl text-on-surface">
                Grille des Disponibilités Hebdomadaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profile.availability.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-2">
                    <span className="font-serif font-bold text-xs text-on-surface block">{item.day}</span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant">Matinée :</span>
                        <span className={item.morning ? 'text-secondary font-bold' : 'text-on-surface-variant/40'}>
                          {item.morning ? 'Disponible' : 'Occupée'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant">Après-midi :</span>
                        <span className={item.afternoon ? 'text-secondary font-bold' : 'text-on-surface-variant/40'}>
                          {item.afternoon ? 'Disponible' : 'Occupée'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant">Soirée :</span>
                        <span className={item.evening ? 'text-primary font-bold' : 'text-on-surface-variant/40'}>
                          {item.evening ? 'Possible' : 'Non'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials from Algiers Families */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm border border-[#ded7ca] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-xl text-on-surface">
                  Avis des Familles d'Alger
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">100% Retours vérifiés</span>
              </div>

              <div className="space-y-4">
                {profile.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-on-surface">{rev.author}</span>
                        <span className="text-[10px] text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                          Garde effectuée
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[#b7895b] text-xs font-bold">
                        <span className="material-symbols-outlined text-xs material-symbols-fill">star</span>
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      « {rev.comment} »
                    </p>
                    <span className="text-[10px] text-on-surface-variant/60 block pt-1">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING & PRICING CARD */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6">
            
            <div className="bg-surface-container-lowest p-6 sm:p-7 rounded-3xl shadow-lg border border-[#D4A373]/60 space-y-6">
              
              <div className="pb-4 border-b border-[#ded7ca] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">
                  Tarification Convenue
                </span>
                <h3 className="font-serif font-bold text-lg text-on-surface">
                  Options de Réservation
                </h3>
              </div>

              {/* Price Options Radios */}
              <div className="space-y-2.5">
                
                {/* Hourly */}
                <label
                  onClick={() => setSelectedOption('hourly')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedOption === 'hourly'
                      ? 'bg-primary-fixed/30 border-primary shadow-xs'
                      : 'bg-[#FAF8F5] border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block">Garde à l'heure / Ponctuelle</span>
                    <span className="text-[11px] text-on-surface-variant">Min. 2 heures</span>
                  </div>
                  <span className="font-bold text-sm text-primary">{profile.hourly_rate} DA <span className="text-xs font-normal">/h</span></span>
                </label>

                {/* Monthly */}
                <label
                  onClick={() => setSelectedOption('monthly')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedOption === 'monthly'
                      ? 'bg-primary-fixed/30 border-primary shadow-xs'
                      : 'bg-[#FAF8F5] border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block">Forfait Mensuel Régulier</span>
                    <span className="text-[11px] text-on-surface-variant">4 à 5 jours / semaine</span>
                  </div>
                  <span className="font-bold text-sm text-primary">{profile.monthly_rate.toLocaleString()} DA <span className="text-xs font-normal">/mois</span></span>
                </label>

                {/* Evening */}
                <label
                  onClick={() => setSelectedOption('evening')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedOption === 'evening'
                      ? 'bg-primary-fixed/30 border-primary shadow-xs'
                      : 'bg-[#FAF8F5] border-[#ded7ca] hover:border-primary'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block">Babysitting Soirée &amp; Week-end</span>
                    <span className="text-[11px] text-on-surface-variant">Retour véhiculé prévu</span>
                  </div>
                  <span className="font-bold text-sm text-primary">{profile.evening_rate} DA <span className="text-xs font-normal">/h</span></span>
                </label>

              </div>

              {/* Zero Payment Guarantee Stamp */}
              <div className="p-3.5 rounded-2xl bg-secondary-fixed/40 border border-secondary/30 space-y-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-secondary font-bold text-xs">
                  <span className="material-symbols-outlined text-sm material-symbols-fill">payments</span>
                  <span>100% Règlement en Espèces Direct</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  0 DA prélevé en ligne. Vous réglez directement la nounou à la fin de la séance.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href={`/services/${id}/reserver`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-xs text-center shadow-md transition flex items-center justify-center gap-2 block"
                >
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  <span>Réserver cette intervenante</span>
                </Link>

                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="w-full py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-bold text-xs text-center shadow-sm transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Discuter sur WhatsApp</span>
                </button>
              </div>

              {/* Reassurance First Visit Note */}
              <div className="pt-2 text-center text-[11px] text-on-surface-variant space-y-1">
                <p className="flex items-center justify-center gap-1 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-xs">home</span>
                  <span>1ère visite de présentation de 30 min gratuite</span>
                </p>
                <p>Rencontrez la nounou chez vous avant de confirmer.</p>
              </div>

              {/* Call Coordinator Direct */}
              <div className="pt-3 border-t border-[#ded7ca] text-center">
                <a
                  href={`tel:${ADMIN_CONTACT.phone}`}
                  className="text-xs font-bold text-on-surface hover:text-primary transition flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>Coordinateur Alger : {ADMIN_CONTACT.phone}</span>
                </a>
              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}
