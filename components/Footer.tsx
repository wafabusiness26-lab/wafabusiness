import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { ADMIN_CONTACT } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#17222d] text-[#ded7ca] pt-16 pb-12 border-t border-[#233241] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-[#2d3e50]">
          
          {/* Brand & Mission Statement */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Logo className="h-10 w-auto" variant="white" />
            </Link>
            <p className="text-[13px] text-[#b3c2d1] leading-relaxed pr-4">
              Plateforme humaine et chaleureuse dédiée à la garde d'enfants et au soutien scolaire à Alger. Chaque assistante et tuteur est rigoureusement certifié en main propre dans nos bureaux.
            </p>
            <div className="pt-2 space-y-2 text-[12px] text-[#eef4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-clay text-base">call</span>
                <span className="font-bold tracking-wide">{ADMIN_CONTACT.phone}</span>
                <span className="text-[#899cae]">• Coordination humaine 7j/7</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                <span>Permanence Alger Centre • 57 Communes</span>
              </div>
            </div>
          </div>

          {/* Services & Nounous */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-[15px] tracking-wide">
              Services à Alger
            </h4>
            <ul className="space-y-2 text-[13px] text-[#b3c2d1]">
              <li>
                <Link href="/services?category=babysitting" className="hover:text-white transition">
                  Garde d'enfants & Nounous à domicile
                </Link>
              </li>
              <li>
                <Link href="/services?category=teaching" className="hover:text-white transition">
                  Soutien scolaire (Primaire, CEM, Lycée)
                </Link>
              </li>
              <li>
                <Link href="/tarifs-et-communes" className="hover:text-white transition">
                  Grille des tarifs en Dinars (DA)
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition">
                  Recherche dans les 57 communes
                </Link>
              </li>
            </ul>
          </div>

          {/* Confiance & Charte */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-[15px] tracking-wide">
              Charte de Confiance
            </h4>
            <ul className="space-y-2 text-[13px] text-[#b3c2d1]">
              <li>
                <Link href="/securite-et-confiance" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                  <span>100% Vérification en main propre</span>
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-white transition">
                  Comment fonctionne la mise en relation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  Foire aux questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contacter le coordinateur
                </Link>
              </li>
            </ul>
          </div>

          {/* Espace Prestataire & Membre */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-white text-[15px] tracking-wide">
              Espaces Membres
            </h4>
            <ul className="space-y-2 text-[13px] text-[#b3c2d1]">
              <li>
                <Link href="/devenir-prestataire" className="text-clay hover:underline font-semibold transition">
                  Devenir Nounou ou Enseignant
                </Link>
              </li>
              <li>
                <Link href="/client/demandes" className="hover:text-white transition">
                  Espace Famille
                </Link>
              </li>
              <li>
                <Link href="/provider/dashboard" className="hover:text-white transition">
                  Espace Prestataire
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-wax-gold hover:underline font-medium transition">
                  Espace Coordinateur
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 57 Communes Strip by Zone */}
        <div className="py-8 border-b border-[#2d3e50] space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-[#899cae] font-bold">
            Couverture Hyper-Locale • Wilaya d'Alger (57 Communes)
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-[#899cae]">
            <span className="text-white font-semibold">Alger Centre & Collines :</span>
            <span>Hydra • El Biar • Ben Aknoun • Alger-Centre • El Madania • El Mouradia • Sidi M'Hamed • Kasbah • Bab El Oued • Bouzareah</span>
            <span className="text-white font-semibold ml-2">Ouest & Sahel :</span>
            <span>Chéraga • Dely Ibrahim • Ouled Fayet • Zéralda • Staoueli • Ain Benian • Douera • Draria • Baba Hassen • Saoula • Birtouta</span>
            <span className="text-white font-semibold ml-2">Est & Baie :</span>
            <span>Kouba • Hussein Dey • Bir Mourad Raïs • Birkhadem • Mohammadia • Bordj El Kiffan • Bordj El Bahri • Ain Taya • Rouiba • Reghaia • Baraki</span>
          </div>
        </div>

        {/* Bottom Legal & Guarantees */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#899cae] gap-4">
          <p>© {new Date().getFullYear()} Amana. Tous droits réservés • Wilaya d'Alger, Algérie.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-[#c6ebd7]">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>Zéro Document sur Internet</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#ffdcbd]">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              <span>100% Espèces (0 DA en ligne)</span>
            </span>
            <span>•</span>
            <span>Coordination téléphonique humaine</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
