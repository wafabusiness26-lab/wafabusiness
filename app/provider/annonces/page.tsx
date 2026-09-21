'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { ServiceListing, ServiceCategory, PriceUnit } from '@/types';
import { ALGER_COMMUNES } from '@/lib/constants';
import { ADMIN_PHONE } from '@/lib/utils';
import { 
  Baby, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  PhoneCall,
  ShieldCheck,
  FileCheck2,
  Coins,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProviderAnnoncesPage() {
  const router = useRouter();
  const { profile, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [listingId, setListingId] = useState<string | null>(null);
  const [category, setCategory] = useState<ServiceCategory>('babysitting');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(2000);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('séance');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState<string>(ALGER_COMMUNES[0]);
  const [supportedCommunes, setSupportedCommunes] = useState<string[]>([]);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [photoUrl, setPhotoUrl] = useState('');

  // 1. Redirection automatique si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signup?role=provider');
    }
  }, [authLoading, user, router]);

  // 2. Chargement de l'annonce existante pour l'utilisateur authentifié
  useEffect(() => {
    if (authLoading || !user) return;
    const providerId = user.id;

    const loadListing = async () => {
      setLoading(true);
      try {
        const existing = await DataStore.getProviderListing(providerId);
        if (existing) {
          const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing.id);
          if (isRealUuid) {
            setListingId(existing.id);
          } else {
            setListingId(null);
          }
          setCategory(existing.category);
          setTitle(existing.title);
          setDescription(existing.description || '');
          setPrice(existing.price);
          setPriceUnit(existing.price_unit || 'séance');
          setAvailability(existing.availability || '');
          setLocation(existing.location || ALGER_COMMUNES[0]);
          setSupportedCommunes(existing.supported_communes || [existing.location || ALGER_COMMUNES[0]]);
          setPhotoUrl(existing.photo_url || '');
        } else {
          setTitle('Nounou bienveillante et expérimentée');
          setAvailability('Du dimanche au jeudi après-midi, et weekends');
          setLocation(profile?.location || 'Alger Centre');
          setSupportedCommunes(['Alger Centre', 'Hydra', 'El Biar']);
        }
        if (profile?.phone) {
          setPhone(profile.phone);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [user, authLoading, profile]);

  const toggleCommune = (commune: string) => {
    if (supportedCommunes.includes(commune)) {
      if (supportedCommunes.length > 1) {
        setSupportedCommunes(supportedCommunes.filter(c => c !== commune));
      }
    } else {
      setSupportedCommunes([...supportedCommunes, commune]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.replace('/auth/signup?role=provider');
      return;
    }

    if (!phone) {
      setError('Veuillez renseigner votre numéro de téléphone afin que le coordinateur puisse vous joindre.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (profile) {
        await DataStore.saveProfile({
          ...profile,
          phone: phone.trim(),
          location,
        });
      }

      await DataStore.saveListing({
        id: listingId || undefined,
        provider_id: user.id,
        category,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        price_unit: priceUnit,
        availability: availability.trim(),
        location: location.trim(),
        supported_communes: supportedCommunes,
        photo_url: photoUrl.trim() || undefined,
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement de votre annonce.');
    } finally {
      setSaving(false);
    }
  };

  const samplePhotos = {
    babysitting: [
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    ],
    teaching: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    ]
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant font-medium">Vérification de votre session prestataire...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface-container-lowest rounded-3xl border border-[#ded7ca] text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-primary-fixed/40 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">account_circle</span>
        </div>
        <h2 className="font-serif text-xl font-bold text-on-surface">Compte Prestataire Requis</h2>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Vous devez être connecté à votre compte pour publier ou modifier votre annonce de service. Redirection en cours...
        </p>
        <div className="pt-2">
          <Link
            href="/auth/signup?role=provider"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition shadow-xs"
          >
            <span>Créer mon compte prestataire</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            Gestionnaire d'Annonce
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {listingId ? 'Modifier mon annonce de service' : 'Créer mon annonce de service'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Définissez votre spécialité, vos tarifs en DA et vos communes d'intervention à Alger.
          </p>
        </div>

        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tableau de bord</span>
        </Link>
      </div>

      {submittedSuccess ? (
        /* Écran de confirmation de soumission */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Votre annonce a été enregistrée avec succès !
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votre profil est maintenant configuré. Pour activer votre badge certifié officiel, préparez votre dossier complet de 7 pièces (photocopies obligatoirement légalisées par l'APC) pour la rencontre avec l'administrateur.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
              <PhoneCall className="w-4 h-4 text-indigo-600" />
              <span>Contact direct coordinateur Amana</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              L'administrateur va vous appeler au <strong>{phone}</strong> pour valider votre dossier en personne. Vous pouvez également le joindre directement au :
            </p>
            <div className="text-center py-2 bg-indigo-600 text-white rounded-xl font-black text-sm">
              📞 {ADMIN_PHONE}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/provider/verification"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Consulter la checklist des 7 pièces légalisées
            </Link>
            <Link
              href="/provider/dashboard"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Retour à mon tableau de bord
            </Link>
          </div>
        </div>
      ) : (
        /* Formulaire */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Choix de catégorie */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Domaine d'intervention
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCategory('babysitting')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  category === 'babysitting'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${category === 'babysitting' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Garde d'Enfants (Babysitting)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Nourrissons, enfants scolarisés, sorties d'école</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('teaching')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  category === 'teaching'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${category === 'teaching' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cours & Soutien Scolaire</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Primaire, CEM (BEM), Lycée (BAC), Matières scientifiques & langues</p>
                </div>
              </button>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Titre accrocheur de votre annonce
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Nounou douce et attentive à Hydra / Enseignant de Mathématiques CEM & Lycée"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Téléphone & Commune Principale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                Numéro de Téléphone (Obligatoire)
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 0550 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Commune Principale de Résidence
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
              >
                {ALGER_COMMUNES.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Communes Desservies (Multi-sélection) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Autres communes d'Alger où vous pouvez vous déplacer ({supportedCommunes.length} sélectionnée(s))
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {ALGER_COMMUNES.map((commune) => {
                const isSelected = supportedCommunes.includes(commune);
                return (
                  <button
                    key={commune}
                    type="button"
                    onClick={() => toggleCommune(commune)}
                    className={`px-2.5 py-1.5 rounded-lg text-left transition truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {commune}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarifs en Dinars Algériens (DA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Tarif demandé (en Dinars - DA)
              </label>
              <input
                type="number"
                required
                min={500}
                step={100}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fréquence / Unité de tarif
              </label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="séance">DA / Séance</option>
                <option value="mois">DA / Mois</option>
                <option value="heure">DA / Heure</option>
              </select>
            </div>
          </div>

          {/* Disponibilités */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Horaires & Jours de disponibilité
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Du dimanche au jeudi après 16h, ou vendredis et samedis complets"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Présentation détaillée de vos compétences & Expérience
            </label>
            <textarea
              rows={4}
              required
              placeholder="Décrivez votre parcours, vos diplômes, votre méthode d'accompagnement ou les tranches d'âges avec lesquelles vous êtes la plus à l'aise."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none leading-relaxed"
            />
          </div>

          {/* Photo */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Photo d'illustration
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
            <div className="flex items-center gap-3">
              {samplePhotos[category].map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition ${
                    photoUrl === url ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-slate-200'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Rappel de vérification physique */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-900 space-y-1">
            <span className="font-bold block">🔒 Contrôle d'identité en main propre</span>
            <p className="text-slate-600">
              Aucun document d'identité n'est téléversé sur le site. Notre coordinateur vous contactera pour convenir d'un rendez-vous de vérification physique à Alger avant d'activer votre badge de certification.
            </p>
          </div>

          {/* Bouton de validation */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer mon annonce</span>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
