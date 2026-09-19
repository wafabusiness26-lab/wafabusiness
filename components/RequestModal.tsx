'use client';

import React, { useState } from 'react';
import { ServiceListing } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatPrice, ADMIN_PHONE } from '@/lib/utils';
import Link from 'next/link';

interface RequestModalProps {
  listing: ServiceListing;
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted?: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  listing,
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const { user, profile } = useAuth();
  
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('14:00');
  const [note, setNote] = useState('');
  const [clientPhone, setClientPhone] = useState(profile?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      setError('Veuillez sélectionner une date souhaitée.');
      return;
    }

    if (!clientPhone) {
      setError('Veuillez renseigner votre numéro de téléphone afin que l\'administrateur puisse vous appeler.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (profile && clientPhone && clientPhone !== profile.phone) {
        try {
          await DataStore.saveProfile({ ...profile, phone: clientPhone });
        } catch (pErr) {
          console.warn('Notice mise à jour téléphone profil:', pErr);
        }
      }

      const combinedDatetime = new Date(`${preferredDate}T${preferredTime}:00`).toISOString();

      // Vérifier si l'utilisateur possède un UUID Supabase valide
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validClientId = (user?.id && uuidRegex.test(user.id)) 
        ? user.id 
        : (profile?.id && uuidRegex.test(profile.id)) 
          ? profile.id 
          : null;

      const created = await DataStore.createRequest({
        client_id: validClientId,
        client_name: profile?.full_name || 'Client TataWafa',
        client_phone: clientPhone.trim(),
        listing_id: listing.id,
        requested_datetime: combinedDatetime,
        note: note.trim() || undefined,
      });

      if (!created || !created.id) {
        throw new Error("Échec d'enregistrement : la base de données n'a retourné aucun identifiant.");
      }

      setSuccess(true);
      onRequestSubmitted?.();
    } catch (err: any) {
      console.error('Erreur soumission RequestModal:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi de votre demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          /* Écran de Confirmation */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Demande envoyée avec succès !</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Votre demande pour <strong>{listing.title}</strong> a été transmise à notre coordinateur de plateforme.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs uppercase tracking-wide">
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>Prochaine étape : Coordination Téléphonique</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                L'administrateur va vérifier les disponibilités du prestataire et vous appeler directement au{' '}
                <strong className="text-slate-900">{clientPhone || 'votre numéro'}</strong> pour confirmer le rendez-vous.
              </p>
              
              <div className="flex items-center gap-2 text-xs bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 text-indigo-900">
                <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Contact direct de l'administrateur : <strong>{ADMIN_PHONE}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Règlement en espèces et vérification d'identité effectués en main propre sur place.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/my-requests"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition text-center"
              >
                Suivre dans "Mes demandes"
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
              >
                Terminer
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de demande */
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Formulaire de réservation
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Demander un service de {listing.category === 'babysitting' ? 'Garde d\'enfants' : 'Cours particuliers'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Avec {listing.provider?.full_name || 'le prestataire'} • {formatPrice(listing.price, listing.price_unit || 'séance')}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Date et Heure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date souhaitée
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Heure souhaitée
                  </label>
                  <input
                    type="time"
                    required
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Téléphone du client */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  Votre Numéro de Téléphone (indispensable pour l'appel de coordination)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0550 00 00 00 / 0661 00 00 00"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Précisions / Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Précisions / Besoins spécifiques
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    listing.category === 'babysitting'
                      ? 'Ex: 2 enfants (âges 3 et 6 ans), garde en soirée de 18h à 22h, à Hydra.'
                      : 'Ex: Élève en 2ème année secondaire (Mathématiques), préparation pour devoir surveillé.'
                  }
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                />
              </div>

              {/* Notice de confiance */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Rappel sécurité & Paiement
                </div>
                <p className="text-slate-600">
                  L'envoi de cette demande est sans engagement financier en ligne. L'administrateur vous contactera par téléphone pour organiser la mise en relation. Le paiement s'effectue en espèces en main propre.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer la demande</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
