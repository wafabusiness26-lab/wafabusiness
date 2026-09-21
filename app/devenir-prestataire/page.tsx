'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { 
  Baby, 
  GraduationCap, 
  ShieldCheck, 
  Coins, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight,
  HeartHandshake,
  UserCheck2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TARIFS_INDICATIFS, PHYSICAL_CHECKLIST, VERIFICATION_DOCUMENTS_DETAILED, LEGALIZATION_NOTICE, ADMIN_CONTACT } from '@/lib/constants';
import { AdminCallCard } from '@/components/AdminCallCard';

export default function BecomeProviderPage() {
  const router = useRouter();
  const { user, profile, role } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      await DataStore.updateUserRole(user.id, 'provider');
      router.push('/provider/annonces');
    } catch (e: any) {
      alert("Erreur lors de l'activation : " + (e.message || e));
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-10">
      
      {/* Hero Prestataire */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-16 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Rejoignez le 1er réseau de confiance à Alger</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Devenez Nounou ou Enseignant Particulier Certifié
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Travaillez avec des familles respectueuses dans votre commune d'Alger. Fixez librement vos tarifs en Dinars Algériens (DA), vos disponibilités et recevez vos paiements directement en espèces de main à main.
            </p>

            {/* Si un utilisateur client est connecté, lui permettre de basculer en un clic */}
            {user && role === 'client' ? (
              <div className="p-5 bg-amber-500/20 border border-amber-400/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-200 text-xs font-bold">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>Compte Famille connecté ({profile?.full_name})</span>
                </div>
                <p className="text-xs text-slate-200">
                  Votre compte est actuellement configuré comme compte Famille. Pour publier une annonce et proposer vos services, activez votre profil Prestataire :
                </p>
                <div className="pt-1 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                    <span>{upgrading ? 'Activation en cours...' : 'Passer mon profil en Prestataire & Publier mon annonce'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/provider/annonces"
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg transition text-center flex items-center justify-center gap-2"
                >
                  <span>Publier mon annonce maintenant</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`tel:${ADMIN_CONTACT.phone}`}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition text-center flex items-center justify-center gap-2 border border-white/10"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Parler au coordinateur</span>
                </a>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Avantages Amana */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Vos Avantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Pourquoi exercer sur la plateforme Amana ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">100% de Vos Revenus en Espèces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zéro prélèvement bancaire ni commissions cachées en ligne. Les familles vous rémunèrent directement en espèces (DA) à chaque séance ou à la fin du mois.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Sécurité & Confidentialité Totale</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vos pièces d'identité et diplômes ne sont jamais publiés sur internet. Notre coordinateur vérifie vos documents en personne de main à main.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Liberté d'Horaires & de Communes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vous choisissez précisément vos communes d'intervention à Alger (Hydra, Kouba, Chéraga...) et vos plages horaires de disponibilité.
            </p>
          </div>
        </div>
      </section>

      {/* Grille indicative des rémunérations à Alger */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Estimation des Tarifs à Alger
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Combien pouvez-vous gagner ?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Barème indicatif constaté sur les communes de la wilaya d'Alger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                <Baby className="w-4 h-4 text-indigo-600" />
                Garde d'Enfants (Babysitting)
              </h4>
              <div className="space-y-2">
                {TARIFS_INDICATIFS.babysitting.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                    <span className="text-slate-700">{item.type}</span>
                    <strong className="text-indigo-700 font-bold">{item.tarif}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Cours Particuliers & Soutien
              </h4>
              <div className="space-y-2">
                {TARIFS_INDICATIFS.teaching.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs border border-slate-100">
                    <span className="text-slate-700">{item.type}</span>
                    <strong className="text-emerald-700 font-bold">{item.tarif}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist de vérification physique */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-50/80 rounded-3xl border border-indigo-200 p-8 sm:p-10 space-y-6">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-lg">
            <UserCheck2 className="w-6 h-6 text-indigo-600" />
            <span>Dossier physique d'agrément en main propre (7 pièces)</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Pour obtenir le <strong>Badge Certifié Amana</strong> et recevoir des demandes de familles, l'administrateur convient d'un rendez-vous avec vous pour inspecter vos pièces originales et constituer votre dossier d'agrément officiel :
          </p>

          {/* Note persistante obligatoire sur les copies légalisées */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-sm font-bold text-amber-950">
                Règle impérative : Copies obligatoirement légalisées
              </strong>
              <p className="text-amber-800 leading-relaxed text-xs">
                Chaque photocopie présentée lors de votre rendez-vous doit <strong>obligatoirement être une copie conforme légalisée par l'APC (Mairie)</strong>. Aucune photocopie simple non tamponnée n'est recevable.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {VERIFICATION_DOCUMENTS_DETAILED.map((doc) => (
              <div key={doc.number} className="flex items-start gap-3 text-xs text-slate-800 bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  {doc.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-slate-900 font-bold">{doc.title}</strong>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">
                      {doc.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {doc.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/provider/annonces"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Commencer mon inscription gratuite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
