'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ServiceRequest } from '@/types';
import { DataStore } from '@/lib/store';
import { ADMIN_CONTACT } from '@/lib/constants';

export default function BookingConfirmationPage() {
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequest() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await DataStore.getRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-xs text-on-surface-variant">Chargement du bon de confirmation...</p>
      </div>
    );
  }

  const dossierCode = id ? `TW-ALG-${id.slice(-4).toUpperCase()}` : 'TW-ALG-4098';

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Main Confirmation Sanctuary Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 shadow-sm border border-[#ded7ca] text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none"></div>

          {/* Success Animated Icon */}
          <div className="w-20 h-20 bg-secondary-fixed text-secondary rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-4xl material-symbols-fill">task_alt</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fcf8ee] border border-[#D4A373] text-[#7d562d] text-xs font-bold">
              <span className="material-symbols-outlined text-sm text-[#b7895b] material-symbols-fill">verified</span>
              <span>Dossier Officiel {dossierCode} Enregistré</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Demande Transmise avec Succès !
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Votre dossier de garde a bien été transmis à notre cellule de coordination d'Alger. Vous allez être recontacté sous 2 heures.
            </p>
          </div>

          {/* Process Timeline */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Prochaines étapes de votre prise en charge :
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-secondary/30 space-y-1">
                <span className="font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm material-symbols-fill">check_circle</span>
                  <span>1. Dossier Reçu</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">Enregistré dans le système</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-primary/40 space-y-1">
                <span className="font-bold text-primary flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-sm">phone_in_talk</span>
                  <span>2. Appel Coordinateur</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">Sous 2h pour convenir de l'horaire</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#ded7ca] space-y-1">
                <span className="font-bold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">handshake</span>
                  <span>3. Visite &amp; Garde</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">1ère rencontre gratuite à domicile</p>
              </div>
            </div>
          </div>

          {/* Digital Voucher Recap */}
          <div className="p-6 rounded-2xl bg-[#f4f1ea]/80 border border-[#ded7ca] text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
              <span className="text-on-surface-variant">Intervenante sélectionnée :</span>
              <span className="font-bold text-on-surface">
                {request?.listing?.title || 'Assistante Maternelle Certifiée'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
              <span className="text-on-surface-variant">Commune d'intervention :</span>
              <span className="font-bold text-on-surface">{request?.address_details || 'Wilaya d\'Alger'}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#ded7ca]">
              <span className="text-on-surface-variant">Nombre d'enfants :</span>
              <span className="font-bold text-on-surface">
                {request?.child_count || 1} enfant ({request?.child_age_or_grade || '2 ans'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Mode de règlement convenu :</span>
              <span className="font-bold text-secondary">100% Espèces de main à main (0 DA en ligne)</span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${ADMIN_CONTACT.phone}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-secondary hover:bg-secondary-600 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">call</span>
              <span>Joindre le coordinateur ({ADMIN_CONTACT.phone})</span>
            </a>

            <Link
              href="/client/demandes"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              <span>Suivre dans mon Espace Famille</span>
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-primary font-semibold transition"
            >
              ← Retour à l'accueil TataWafa
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
