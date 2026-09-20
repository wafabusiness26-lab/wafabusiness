'use client';

import React, { useState } from 'react';
import { ADMIN_CONTACT, ALGER_COMMUNES } from '@/lib/constants';
import { 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState<string>(ALGER_COMMUNES[0]);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Permanence & Écoute
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Contacter l'Équipe Amana
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Notre coordinateur de plateforme est à votre disposition par téléphone, WhatsApp ou directement à notre permanence d'Alger Centre.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Coordonnées Directes */}
        <div className="space-y-4 lg:col-span-1">
          
          <a
            href={`tel:${ADMIN_CONTACT.phone}`}
            className="block p-6 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-200">Appel Téléphonique Direct</span>
              <PhoneCall className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition" />
            </div>
            <strong className="text-2xl font-black block">{ADMIN_CONTACT.phone}</strong>
            <span className="text-xs text-indigo-100 block">7j/7 de 08:00 à 21:00</span>
          </a>

          <a
            href={ADMIN_CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-200">WhatsApp Dédié</span>
              <MessageCircle className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition" />
            </div>
            <strong className="text-lg font-bold block">Écrire sur WhatsApp</strong>
            <span className="text-xs text-emerald-100 block">Réponse rapide de coordination</span>
          </a>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Permanence d'accueil :</strong>
                <span>{ADMIN_CONTACT.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Disponibilité :</strong>
                <span>{ADMIN_CONTACT.workingHours}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Courriel :</strong>
                <span>{ADMIN_CONTACT.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Colonne Formulaire de Message */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          
          {sent ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message bien reçu !</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Notre coordinateur a bien reçu votre demande et vous appellera très rapidement au <strong>{phone}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">Envoyer un message au coordinateur</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pour une demande spécifique ou des questions sur nos prestataires à Alger.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Votre Nom Complet
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yasmine Belkacem"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Votre Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0550 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Votre Commune à Alger
                </label>
                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {ALGER_COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Votre Message ou Demande
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Expliquez-nous votre besoin particulier, vos contraintes horaires ou vos questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer mon message</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
