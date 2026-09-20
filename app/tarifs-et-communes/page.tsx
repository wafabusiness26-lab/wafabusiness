'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ALGER_COMMUNES, TARIFS_INDICATIFS } from '@/lib/constants';
import { 
  MapPin, 
  Coins, 
  Search, 
  Baby, 
  GraduationCap, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AdminCallCard } from '@/components/AdminCallCard';

export default function TarifsAndCommunesPage() {
  const [searchCommune, setSearchCommune] = useState('');

  const filteredCommunes = ALGER_COMMUNES.filter(c =>
    c.toLowerCase().includes(searchCommune.toLowerCase().trim())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Couverture Géographique & Tarifs
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Les 57 Communes d'Alger & Grille Tarifaire en DA
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Amana dessert l'ensemble des communes de la Wilaya d'Alger avec des tarifs clairs, transparents et réglés directement en espèces de main à main.
        </p>
      </div>

      {/* Grille des tarifs indicatifs en Dinars Algériens */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="flex items-center gap-2.5 text-slate-900 font-bold text-xl">
          <Coins className="w-6 h-6 text-amber-500" />
          <span>Barème Indicatif des Tarifs à Alger (Dinars Algériens - DA)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Babysitting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-base border-b border-slate-100 pb-2">
              <Baby className="w-5 h-5 text-indigo-600" />
              <span>Garde d'Enfants (Babysitting & Nounous)</span>
            </div>
            <div className="space-y-2.5">
              {TARIFS_INDICATIFS.babysitting.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-700 font-medium">{item.type}</span>
                  <strong className="text-indigo-700 font-black text-sm">{item.tarif}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Soutien Scolaire */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base border-b border-slate-100 pb-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              <span>Cours Particuliers & Soutien Scolaire</span>
            </div>
            <div className="space-y-2.5">
              {TARIFS_INDICATIFS.teaching.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-700 font-medium">{item.type}</span>
                  <strong className="text-emerald-700 font-black text-sm">{item.tarif}</strong>
                </div>
              ))}
            </div>
          </div>

        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          * Les tarifs peuvent varier légèrement selon le quartier précis, l'expérience de l'intervenant et le nombre d'enfants. Le tarif final est toujours convenu et validé par téléphone lors de la coordination.
        </p>
      </div>

      {/* Annuaire des 57 Communes d'Alger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
              <MapPin className="w-6 h-6 text-rose-500" />
              <span>Répertoire des 57 Communes de la Wilaya d'Alger</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cliquez sur une commune pour afficher immédiatement les annonces et prestataires disponibles.
            </p>
          </div>

          {/* Recherche rapide de commune */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Chercher une commune..."
              value={searchCommune}
              onChange={(e) => setSearchCommune(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredCommunes.map((commune) => (
            <Link
              key={commune}
              href={`/services?commune=${encodeURIComponent(commune)}`}
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200/80 text-xs font-semibold text-slate-800 hover:text-indigo-700 transition flex items-center justify-between group"
            >
              <span className="truncate">{commune}</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      <AdminCallCard />

    </div>
  );
}
