'use client';

import React, { useState } from 'react';
import { FAQ_ITEMS } from '@/lib/constants';
import { AdminCallCard } from '@/components/AdminCallCard';
import { HelpCircle, ChevronDown, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaq = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    item.a.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Centre d'Aide & Réponses
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Foire Aux Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Toutes les réponses à vos questions sur le fonctionnement d'Amana à Alger, la vérification physique des intervenants et le règlement en espèces.
        </p>

        {/* Barre de recherche FAQ */}
        <div className="pt-2 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher une question (paiement, vérification, annulation)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Liste des questions accordéons */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 p-6 sm:p-8 shadow-sm">
        {filteredFaq.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Aucune question ne correspond à votre recherche.
          </div>
        ) : (
          filteredFaq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 group"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition">
                    {item.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed pl-3 border-l-2 border-indigo-600 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AdminCallCard />

    </div>
  );
}
