'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck2, 
  PhoneCall, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  HeartHandshake,
  UserCheck2,
  ArrowRight
} from 'lucide-react';
import { SAFETY_PILLARS, PHYSICAL_CHECKLIST, ADMIN_CONTACT } from '@/lib/constants';
import { AdminCallCard } from '@/components/AdminCallCard';

export default function SecurityAndTrustPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-bold border border-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Charte de Sécurité & Protection des Familles à Alger</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          La Sécurité par le Contact Humain
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Parce que la garde d'enfants et les cours à domicile touchent à ce qu'il y a de plus précieux, nous avons banni le tout-digital au profit d'un protocole physique strict et vérifié.
        </p>
      </div>

      {/* Les 4 Piliers Fondamentaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAFETY_PILLARS.map((pillar, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              {idx + 1}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{pillar.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </div>

      {/* Protocole de vérification physique en main propre */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
          <FileCheck2 className="w-5 h-5" />
          <span>Contrôle physique des pièces originales</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black">
          Comment chaque intervenant est contrôlé avant d'entrer chez vous
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Contrairement aux plateformes classiques qui acceptent de simples photos ou scans facilement falsifiables, notre équipe administrative rencontre chaque candidat en personne à Alger Centre pour un contrôle visuel et tactile des 7 pièces obligatoires :
        </p>

        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-xs">
            <strong>Exigence d'agrément officiel :</strong> Chaque photocopie présentée fait l'objet d'une vérification stricte de sa <strong>conformité légalisée auprès de l'APC (Mairie)</strong>. Aucune copie simple non tamponnée n'est acceptée.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {PHYSICAL_CHECKLIST.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conseils aux Familles pour la première rencontre */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
          <HeartHandshake className="w-6 h-6 text-indigo-600" />
          <span>Nos recommandations pour la première séance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-2">
            <strong className="text-slate-900 text-sm block">1. Demandez la pièce d'identité</strong>
            <p className="leading-relaxed">
              À l'arrivée du prestataire, vérifiez que son visage et son identité correspondent bien à la fiche et au numéro confirmés par l'administrateur.
            </p>
          </div>

          <div className="space-y-2">
            <strong className="text-slate-900 text-sm block">2. Soyez présent(e) au début</strong>
            <p className="leading-relaxed">
              Consacrez 10 à 15 minutes pour faire visiter la maison, expliquer les habitudes de l'enfant et poser le cadre en toute bienveillance.
            </p>
          </div>

          <div className="space-y-2">
            <strong className="text-slate-900 text-sm block">3. Règlement direct en espèces</strong>
            <p className="leading-relaxed">
              Remettez le montant exact en Dinars Algériens (DA) convenu lors de la coordination téléphonique, sans aucun supplément imprévu.
            </p>
          </div>
        </div>
      </div>

      <AdminCallCard />

    </div>
  );
}
