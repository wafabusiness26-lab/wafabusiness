'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { VerificationBadge } from '@/components/VerificationBadge';
import { AdminCallCard } from '@/components/AdminCallCard';
import { PHYSICAL_CHECKLIST, VERIFICATION_DOCUMENTS_DETAILED, LEGALIZATION_NOTICE, ADMIN_CONTACT } from '@/lib/constants';

export default function ProviderVerificationPage() {
  const { profile } = useAuth();
  const status = profile?.verification_status || 'en_attente_physique';
  const isVerified = status === 'verifie_en_main_propre';

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded7ca] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-sm material-symbols-fill">shield</span>
              <span>Agrément &amp; Charte de Confiance Alger</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
              Vérification des Pièces en Main Propre
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Protocole officiel de certification physique pour les prestataires de la Wilaya d'Alger.
            </p>
          </div>

          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface-container-lowest border border-[#ded7ca] text-on-surface text-xs font-bold hover:bg-[#ede8df] transition"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Tableau de bord</span>
          </Link>
        </div>

        {/* Statut actuel */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Votre Statut de Certification
            </span>
            <VerificationBadge status={status} size="md" />
          </div>

          {isVerified ? (
            <div className="p-4 rounded-2xl bg-secondary-fixed/40 border border-secondary/30 flex items-start gap-3 text-secondary">
              <span className="material-symbols-outlined text-xl material-symbols-fill shrink-0 mt-0.5">task_alt</span>
              <div className="text-xs space-y-1">
                <strong className="block text-sm text-on-surface">Félicitations ! Votre profil est officiellement certifié.</strong>
                <p className="text-on-surface-variant">
                  Vos pièces d'identité et diplômes originaux ont été vérifiés en main propre au bureau. Votre sceau de cire doré est actif et visible par toutes les familles algéroises.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#fcf8ee] border border-[#D4A373] flex items-start gap-3 text-[#7d562d]">
              <span className="material-symbols-outlined text-xl material-symbols-fill shrink-0 mt-0.5">info</span>
              <div className="text-xs space-y-1">
                <strong className="block text-sm text-[#422401]">Dossier en attente de contrôle visuel au bureau</strong>
                <p className="text-on-surface-variant leading-relaxed">
                  Afin de garantir la sécurité des enfants et la confidentialité de vos données, aucun document n'est accepté sur le web. Veuillez convenir d'un rendez-vous avec notre coordinateur à Alger pour le contrôle visuel de vos pièces originales.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Checklist des 7 documents physiques à préparer */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 font-serif font-bold text-base text-on-surface">
              <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
              <span>Dossier physique d'agrément (7 pièces obligatoires)</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-fixed/50 text-primary text-xs font-bold">
              Contrôle en main propre
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Lors de votre entretien de 15 minutes avec l'administrateur au bureau d'Alger, vous devez présenter le dossier complet comprenant les 7 pièces suivantes :
          </p>

          {/* Note persistante obligatoire sur les copies légalisées */}
          <div className="p-4 rounded-2xl bg-[#fcf8ee] border border-[#D4A373] flex items-start gap-3 text-xs text-[#7d562d]">
            <span className="material-symbols-outlined text-[#8c5828] text-xl material-symbols-fill shrink-0 mt-0.5">
              gavel
            </span>
            <div className="space-y-1">
              <strong className="block text-sm text-[#422401] font-bold">
                Règle d'Agrément Impérative : Copies Légalisées
              </strong>
              <p className="text-on-surface-variant leading-relaxed text-[11px]">
                Chaque photocopie présentée doit <strong>obligatoirement être une copie conforme légalisée par l'APC (Mairie)</strong>. Aucune photocopie simple non tamponnée n'est recevable pour l'attribution de votre badge officiel.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {VERIFICATION_DOCUMENTS_DETAILED.map((doc) => {
              const isItemVerified = profile ? Boolean((profile as any)[doc.key]) : false;
              return (
                <div key={doc.number} className={`flex items-start gap-3.5 p-4 rounded-2xl border text-xs transition ${
                  isItemVerified ? 'bg-secondary-fixed/20 border-secondary/40' : 'bg-[#FAF8F5] border-[#ded7ca]'
                }`}>
                  <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                    isItemVerified ? 'bg-secondary text-white' : 'bg-primary-fixed text-primary'
                  }`}>
                    {isItemVerified ? (
                      <span className="material-symbols-outlined text-sm material-symbols-fill">check</span>
                    ) : (
                      doc.number
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-on-surface font-bold text-xs sm:text-sm">{doc.title}</strong>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        isItemVerified ? 'bg-secondary-fixed text-secondary' : 'bg-[#ede8df] text-on-surface-variant'
                      }`}>
                        {isItemVerified ? 'Vérifié au bureau' : doc.badge}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed">
                      {doc.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lieu de permanence bureau Alger */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-on-surface">
            <span className="material-symbols-outlined text-secondary text-xl">location_on</span>
            <span>Permanence de Vérification Physique à Alger</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface-variant pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-1">
              <strong className="block text-on-surface">Adresse du Bureau :</strong>
              <p>Rue Didouche Mourad (proche Grande Poste)</p>
              <p>Alger Centre, Algérie</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] space-y-1">
              <strong className="block text-on-surface">Horaires d'accueil :</strong>
              <p>{ADMIN_CONTACT.workingHours}</p>
              <p>Sur rendez-vous téléphonique uniquement</p>
            </div>
          </div>
        </div>

        {/* Contact direct Admin */}
        <AdminCallCard
          title="Fixer votre rendez-vous de vérification"
          subtitle="Appelez directement l'administrateur pour convenir de l'heure de votre visite au bureau."
        />

      </div>
    </div>
  );
}
