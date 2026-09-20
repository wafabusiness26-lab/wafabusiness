'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Baby, 
  GraduationCap, 
  Search, 
  PhoneCall, 
  ShieldCheck, 
  Coins, 
  UserCheck2, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { AdminCallCard } from '@/components/AdminCallCard';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Transparence & Simplicité
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Comment fonctionne Amana ?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Un modèle conçu spécialement pour Alger : allier la modernité de la recherche locale à la sécurité irremplaçable du contact humain et de la vérification de main à main.
        </p>
      </div>

      {/* Parcours Familles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pour les Familles & Parents</h2>
            <p className="text-xs text-slate-500">Trouver une garde d'enfants ou un enseignant en 3 étapes simples</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="font-bold text-sm text-slate-900">1. Choisissez et Réservez</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consultez les profils dans votre commune d'Alger. Remplissez le formulaire avec la date, l'heure et vos besoins. Zéro paiement en ligne.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-bold text-sm text-slate-900">2. Appel de Coordination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              L'administrateur vous contacte par téléphone et appelle le prestataire pour convenir de l'horaire précis et valider les détails.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-bold text-sm text-slate-900">3. Prestation & Règlement (DA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Le prestataire présente sa pièce d'identité à son arrivée. Vous réglez directement en espèces (DA) à la fin de la séance ou du mois.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <span>Explorer les annonces à Alger</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Parcours Prestataires */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <UserCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pour les Nounous & Enseignants</h2>
            <p className="text-xs text-slate-500">Valoriser votre savoir-faire et travailler en toute sécurité</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="font-bold text-sm text-slate-900">1. Publication de l'Annonce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Créez votre profil en 2 minutes en fixant vos tarifs (DA / Séance ou Mois) et vos communes d'intervention. Aucun document requis en ligne.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-bold text-sm text-slate-900">2. Contrôle des Pièces en Main Propre</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              L'administrateur vous appelle pour convenir d'un rendez-vous physique à Alger et contrôler visuellement votre CNI originale et diplômes.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-bold text-sm text-slate-900">3. Certification & Missions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Votre Badge Certifié est activé. Vous recevez des missions régulières et percevez 100% de vos gains directement en espèces.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/devenir-prestataire"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <span>Devenir prestataire sur Amana</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AdminCallCard />

    </div>
  );
}
