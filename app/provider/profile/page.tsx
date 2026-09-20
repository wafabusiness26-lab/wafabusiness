'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { ServiceListing, Review } from '@/types';
import { StarRating } from '@/components/StarRating';
import { formatPrice, formatDateShort, ADMIN_PHONE } from '@/lib/utils';
import { 
  BookOpen, 
  MapPin, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  PhoneCall, 
  Edit3, 
  Loader2
} from 'lucide-react';

export default function ProviderProfilePage() {
  const { profile, user } = useAuth();
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const providerId = profile?.id || user?.id || 'usr_provider_guest';

  const loadData = async () => {
    setLoading(true);
    try {
      const l = await DataStore.getProviderListing(providerId);
      setListing(l);
      const revs = await DataStore.getReviewsForProvider(providerId);
      setReviews(revs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('sm_data_change', handleDataChange);
    return () => window.removeEventListener('sm_data_change', handleDataChange);
  }, [providerId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Résumé Profil */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-indigo-100 shadow-sm shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{profile?.full_name || 'Prestataire'}</h1>
                <span title="Vérification effectuée">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{profile?.phone || 'Téléphone non renseigné'}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile?.location || 'Alger'}
                </span>
              </p>
              <div className="mt-2">
                <StarRating rating={avgRating} count={reviews.length} showCount size="sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/provider/annonces"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Gérer mon annonce</span>
            </Link>
          </div>

        </div>

        {profile?.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Présentation :</strong>
            {profile.bio}
          </div>
        )}
      </div>

      {/* Notice de coordination */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-3.5">
        <PhoneCall className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <h4 className="font-bold text-sm">Mode de fonctionnement des réservations</h4>
          <p className="text-amber-800 leading-relaxed">
            Sur Amana, les demandes des familles sont transmises à l'administrateur. Vous serez contacté directement par téléphone (<strong>{profile?.phone || 'votre numéro'}</strong>) par l'administrateur pour organiser chaque mission.
          </p>
        </div>
      </div>

      {/* Aperçu de l'annonce publiée */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Votre Annonce Publiée
          </h2>
          {listing && (
            <Link
              href={`/services/${listing.id}`}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Voir la fiche publique →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
          </div>
        ) : !listing ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-slate-600 font-medium">Vous n'avez pas encore publié d'annonce de service.</p>
            <Link
              href="/provider/annonces"
              className="inline-block px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Publier une annonce maintenant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {listing.photo_url ? (
                <img src={listing.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-400 font-bold text-xs">
                  {listing.category === 'babysitting' ? 'Garde d\'enfants' : 'Soutien scolaire'}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {listing.category === 'babysitting' ? 'Garde d\'enfants' : 'Cours particuliers'}
              </span>
              <h3 className="text-base font-bold text-slate-900">{listing.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{listing.description}</p>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                <span>{formatPrice(listing.price, listing.price_unit || 'séance')}</span>
                <span>•</span>
                <span>{listing.location} (Alger)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avis reçus */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              Avis et Évaluations Reçus ({reviews.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Avis certifiés laissés par les familles après prestation.</p>
          </div>
          <StarRating rating={avgRating} count={reviews.length} showCount size="md" />
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Aucun avis reçu pour le moment.</p>
            <p className="text-xs text-slate-400">Vos évaluations apparaîtront ici après la réalisation de vos premières prestations.</p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {rev.client?.full_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.client?.full_name || 'Client'}</p>
                      <p className="text-[10px] text-slate-400">{formatDateShort(rev.created_at)}</p>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} size="sm" />
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-700 leading-relaxed pl-10">"{rev.comment}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
