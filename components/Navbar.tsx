'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Logo } from './Logo';
import { ADMIN_CONTACT } from '@/lib/constants';

// Les 5 pages phares de la plateforme (identiques à la barre de navigation desktop)
const CORE_5_PAGES = [
  {
    number: '01',
    title: 'Trouver une Nounou',
    subtitle: 'Garde d\'enfants vérifiée à domicile (0 à 10 ans)',
    href: '/services?category=babysitting',
    icon: 'child_care',
    badge: 'Nounous Vérifiées',
    color: 'bg-primary-fixed/60 text-primary',
  },
  {
    number: '02',
    title: 'Soutien Scolaire',
    subtitle: 'Enseignantes qualifiées & aide aux devoirs',
    href: '/services?category=teaching',
    icon: 'school',
    badge: 'Primaire • CEM • Lycée',
    color: 'bg-primary-fixed/60 text-primary',
  },
  {
    number: '03',
    title: 'Notre Charte de Vérification',
    subtitle: '100% vérifié en main propre au bureau d\'Alger',
    href: '/securite-et-confiance',
    icon: 'verified_user',
    badge: 'Zéro Document Web',
    color: 'bg-secondary-fixed/60 text-secondary',
  },
  {
    number: '04',
    title: 'Les 57 Communes & Tarifs',
    subtitle: 'Transparence totale en Dinars • 0 DA en ligne',
    href: '/tarifs-et-communes',
    icon: 'location_on',
    badge: 'Règlement Espèces',
    color: 'bg-amber-100/90 text-[#7d562d]',
  },
  {
    number: '05',
    title: 'Devenir Prestataire',
    subtitle: 'Postuler pour rejoindre notre réseau d\'élite',
    href: '/devenir-prestataire',
    icon: 'assignment_ind',
    badge: 'Dossier Physique',
    color: 'bg-secondary-fixed/60 text-secondary',
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || (path !== '/' && pathname.startsWith(path));
  };

  // Fermer le menu lors de la navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Écouter la touche Échap pour fermer le menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-[#ebdcd4] shadow-[0_1px_12px_rgba(43,58,74,0.05)]">
        {/* Top micro ribbon - Reassurance & Direct Coordination */}
        <div className="w-full bg-primary-fixed/40 px-3 sm:px-4 py-1.5 border-b border-primary-fixed/30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-on-primary-fixed-variant text-[11px] sm:text-[12px] font-medium">
              <span className="material-symbols-outlined text-primary text-[15px] sm:text-[17px] material-symbols-fill shrink-0">
                verified_user
              </span>
              <span className="truncate">Wilaya d'Alger • 100% Vérifié en main propre</span>
              <span className="hidden md:inline text-outline-variant">•</span>
              <span className="hidden md:inline text-on-surface-variant text-[12px]">
                Permanence : <strong className="text-on-surface font-semibold">{ADMIN_CONTACT.phone}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-secondary-container/80 text-on-secondary-fixed-variant px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0">
              <span className="material-symbols-outlined text-secondary text-[13px]">payments</span>
              <span>0 DA en ligne • 100% Espèces</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <Logo animatedEvery10s={true} className="h-10 sm:h-14 w-auto group-hover:scale-102 transition-transform" />
          </Link>

          {/* Desktop Organic Nav Pills (Visible on large screens) */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#ede8df] px-2 py-1.5 rounded-full shadow-[0_2px_8px_rgba(43,58,74,0.03)] border border-[#e4dec7]">
            <Link
              href="/services?category=babysitting"
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                pathname.includes('category=babysitting')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
              }`}
            >
              Trouver une Nounou
            </Link>

            <Link
              href="/services?category=teaching"
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                pathname.includes('category=teaching')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
              }`}
            >
              Soutien Scolaire
            </Link>

            <Link
              href="/securite-et-confiance"
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                isActive('/securite-et-confiance')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
              }`}
            >
              Notre Charte de Vérification
            </Link>

            <Link
              href="/tarifs-et-communes"
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                isActive('/tarifs-et-communes')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
              }`}
            >
              Les 57 Communes
            </Link>

            {role !== 'provider' && role !== 'admin' && (
              <Link
                href="/devenir-prestataire"
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  isActive('/devenir-prestataire')
                    ? 'bg-secondary text-white shadow-sm'
                    : 'text-secondary font-bold hover:bg-secondary-fixed/50'
                }`}
              >
                Devenir Prestataire
              </Link>
            )}

            {/* Role specific links for Desktop */}
            {role === 'client' && (
              <Link
                href="/client/demandes"
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  isActive('/client/demandes')
                    ? 'bg-primary text-white'
                    : 'text-primary hover:bg-primary-fixed/60'
                }`}
              >
                Mes Demandes
              </Link>
            )}

            {role === 'provider' && (
              <Link
                href="/provider/dashboard"
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  isActive('/provider')
                    ? 'bg-secondary text-white'
                    : 'text-secondary hover:bg-secondary-fixed/60'
                }`}
              >
                Espace Pro
              </Link>
            )}

            {role === 'admin' && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                  isActive('/admin')
                    ? 'bg-tertiary text-white'
                    : 'text-tertiary hover:bg-tertiary-fixed/60'
                }`}
              >
                Coordination Admin
              </Link>
            )}
          </nav>

          {/* Right Action Bar: Urgence Phone + Profile / Auth + 3-Dots Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Urgence Garde Direct Call Pill (visible from md and up) */}
            <a
              href={`tel:${ADMIN_CONTACT.phone}`}
              className="hidden md:flex items-center gap-2 bg-secondary-fixed/70 hover:bg-secondary-fixed text-on-secondary-fixed px-3.5 py-1.5 rounded-full shadow-[0_2px_6px_rgba(43,58,74,0.04)] border border-secondary-fixed-dim transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">call</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none">
                  Urgence Garde
                </span>
                <span className="text-[13px] font-bold leading-tight text-on-surface">
                  {ADMIN_CONTACT.phone}
                </span>
              </div>
            </a>

            {/* User Account / Profile */}
            {profile ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low pl-1 pr-2 sm:pr-3 py-1 rounded-full shadow-subtle border border-[#ded7ca]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                  {profile.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[12px] text-on-surface font-semibold leading-tight max-w-[100px] truncate">
                    {profile.full_name}
                  </span>
                  <span className="text-[10px] text-primary font-medium leading-none capitalize">
                    {role === 'admin' ? 'Coordinateur' : role === 'provider' ? 'Prestataire' : 'Famille'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Se déconnecter"
                  className="p-1 text-on-surface-variant hover:text-error transition"
                >
                  <span className="material-symbols-outlined text-[17px]">logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-600 rounded-full shadow-sm transition"
                >
                  Créer un compte
                </Link>
              </div>
            )}

            {/* The 3-Dots Button (Like famous websites) - Available on Mobile & Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                mobileMenuOpen
                  ? 'bg-primary text-white shadow-md rotate-90 scale-105'
                  : 'bg-[#ede8df] text-[#0d1d2c] hover:bg-white border border-[#ded7ca] shadow-xs active:scale-95'
              }`}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu des 5 pages principales"
              title="Menu des 5 pages"
            >
              <span className="material-symbols-outlined text-[24px] leading-none">
                {mobileMenuOpen ? 'close' : 'more_vert'}
              </span>
            </button>
          </div>

          {/* Floating 5-Pages Menu Sheet (Anchored directly under header) */}
          {mobileMenuOpen && (
            <div className="xl:hidden absolute top-full right-3 sm:right-6 w-[calc(100vw-24px)] max-w-[400px] max-h-[calc(100vh-100px)] overflow-y-auto bg-[#FAF8F5] border border-[#ded7ca] rounded-3xl shadow-[0_25px_60px_-12px_rgba(13,29,44,0.25)] z-50 p-4 sm:p-5 flex flex-col gap-3.5 mt-2 animate-in fade-in slide-in-from-top-3 duration-200">
              
              {/* Menu Header with Stamp */}
              <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-on-surface leading-tight font-serif">
                      Menu des 5 Pages
                    </h3>
                    <p className="text-[11px] text-on-surface-variant leading-none mt-0.5">
                      Wilaya d'Alger • Amana
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#ede8df] text-on-surface hover:bg-surface-container flex items-center justify-center transition"
                  aria-label="Fermer le menu"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {/* Quick Return to Home Link */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive('/')
                    ? 'bg-primary-fixed/50 text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-[#ede8df]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">home</span>
                  <span>Accueil Amana</span>
                </div>
                <span className="text-[10px] text-outline font-medium">Page d'accueil</span>
              </Link>

              {/* The List of 5 Pages */}
              <div className="space-y-1.5">
                <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                  Les 5 rubriques officielles
                </div>

                {CORE_5_PAGES.map((page) => {
                  const pageIsActive = isActive(page.href);
                  return (
                    <Link
                      key={page.number}
                      href={page.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                        pageIsActive
                          ? 'bg-white border-primary/40 shadow-sm ring-1 ring-primary/20'
                          : 'bg-[#FAF8F5] border-[#ebdcd4] hover:bg-white hover:border-[#ded7ca] hover:shadow-xs'
                      }`}
                    >
                      {/* Page Number & Icon Badge */}
                      <div className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0 ${page.color}`}>
                        <span className="material-symbols-outlined text-[20px] leading-none">
                          {page.icon}
                        </span>
                        <span className="text-[9px] font-extrabold leading-none mt-0.5 opacity-80">
                          {page.number}
                        </span>
                      </div>

                      {/* Title, Subtitle, & Tag */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className={`text-[13px] font-bold truncate leading-tight ${
                            pageIsActive ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                          }`}>
                            {page.title}
                          </h4>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ede8df] text-on-surface-variant font-medium shrink-0">
                            {page.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5 leading-snug">
                          {page.subtitle}
                        </p>
                      </div>

                      {/* Right Chevron */}
                      <span className={`material-symbols-outlined text-[18px] shrink-0 self-center transition-transform group-hover:translate-x-0.5 ${
                        pageIsActive ? 'text-primary' : 'text-outline-variant'
                      }`}>
                        chevron_right
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Personal Space for Logged In User */}
              {profile && (
                <div className="pt-2 border-t border-[#ebdcd4] space-y-1">
                  <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                    Mon Espace Personnel
                  </div>

                  {role === 'client' && (
                    <Link
                      href="/client/demandes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-primary-fixed/40 text-primary font-bold text-xs hover:bg-primary-fixed/60 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        <span>Mes Demandes de Garde</span>
                      </div>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  )}

                  {role === 'provider' && (
                    <div className="space-y-1">
                      <Link
                        href="/provider/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-secondary-fixed/40 text-secondary font-bold text-xs hover:bg-secondary-fixed/60 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">dashboard</span>
                          <span>Mon Espace Prestataire</span>
                        </div>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                      <Link
                        href="/provider/verification"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-base text-secondary">verified</span>
                        <span>Vérification physique en main propre</span>
                      </Link>
                    </div>
                  )}

                  {role === 'admin' && (
                    <div className="space-y-1">
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-tertiary-fixed/50 text-tertiary font-bold text-xs hover:bg-tertiary-fixed/70 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">support_agent</span>
                          <span>Dispatching Téléphonique</span>
                        </div>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                      <Link
                        href="/admin/prestataires"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-base text-tertiary">how_to_reg</span>
                        <span>Vérifications CNI & Diplômes</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Login / Signup for Guests (Compact & Clean on Mobile) */}
              {!profile && (
                <div className="pt-2 border-t border-[#ebdcd4] grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-[#ded7ca] text-xs font-semibold text-on-surface hover:bg-white transition text-center"
                  >
                    <span className="material-symbols-outlined text-[15px]">login</span>
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-600 transition text-center"
                  >
                    <span className="material-symbols-outlined text-[15px]">person_add</span>
                    <span>S'inscrire</span>
                  </Link>
                </div>
              )}

              {/* Direct Urgent Coordination Call */}
              <div className="pt-2 border-t border-[#ebdcd4]">
                <a
                  href={`tel:${ADMIN_CONTACT.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-secondary text-white font-bold text-xs shadow-sm hover:bg-secondary-600 active:scale-98 transition"
                >
                  <span className="material-symbols-outlined text-[17px]">call</span>
                  <span>Permanence Directe : {ADMIN_CONTACT.phone}</span>
                </a>
              </div>

            </div>
          )}
        </div>
      </header>

      {/* Backdrop overlay for outside click dismiss on mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0d1d2c]/40 backdrop-blur-xs z-40 xl:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
