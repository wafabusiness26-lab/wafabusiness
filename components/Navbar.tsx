'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Logo } from './Logo';
import { ADMIN_CONTACT } from '@/lib/constants';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-[#ebdcd4] shadow-[0_1px_12px_rgba(43,58,74,0.05)]">
      {/* Top micro ribbon - Reassurance & Direct Coordination */}
      <div className="w-full bg-primary-fixed/40 px-4 py-1.5 border-b border-primary-fixed/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-on-primary-fixed-variant text-[12px] font-medium">
            <span className="material-symbols-outlined text-primary text-[17px] material-symbols-fill">verified_user</span>
            <span>Wilaya d'Alger • 100% Vérifié en main propre au bureau</span>
            <span className="hidden md:inline text-outline-variant">•</span>
            <span className="hidden md:inline text-on-surface-variant text-[12px]">
              Coordination directe : <strong className="text-on-surface font-semibold">{ADMIN_CONTACT.phone}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary-container/80 text-on-secondary-fixed-variant px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <span className="material-symbols-outlined text-secondary text-[14px]">payments</span>
            <span>0 DA en ligne • Règlement direct en espèces</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <Logo className="h-10 w-auto group-hover:scale-102 transition-transform" />
        </Link>

        {/* Desktop Organic Nav Pills */}
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

          {/* Role specific links */}
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

        {/* Right Action: Urgence Phone + Profile / Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Urgence Garde Direct Call Pill */}
          <a
            href="tel:0550123456"
            className="hidden sm:flex items-center gap-2 bg-secondary-fixed/70 hover:bg-secondary-fixed text-on-secondary-fixed px-3.5 py-1.5 rounded-full shadow-[0_2px_6px_rgba(43,58,74,0.04)] border border-secondary-fixed-dim transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">call</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider leading-none">
                Urgence Garde
              </span>
              <span className="text-[13px] font-bold leading-tight text-on-surface">
                0550 12 34 56
              </span>
            </div>
          </a>

          {/* User Account / Profile */}
          {profile ? (
            <div className="flex items-center gap-2 bg-surface-container-low pl-1.5 pr-3 py-1.5 rounded-full shadow-subtle border border-[#ded7ca]">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] text-on-surface font-semibold leading-tight max-w-[110px] truncate">
                  {profile.full_name}
                </span>
                <span className="text-[10px] text-primary font-medium leading-none capitalize">
                  {role === 'admin' ? 'Coordinateur' : role === 'provider' ? 'Prestataire' : 'Famille'}
                </span>
              </div>
              <button
                onClick={() => logout()}
                title="Se déconnecter"
                className="ml-1 p-1 text-on-surface-variant hover:text-error transition"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-600 rounded-full shadow-sm transition"
              >
                Créer un compte
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-full text-on-surface hover:bg-surface-container transition"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#ebdcd4] bg-[#FAF8F5] px-4 pt-4 pb-8 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link
              href="/services?category=babysitting"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              <span>Trouver une Nounou à Alger</span>
              <span className="material-symbols-outlined text-primary text-base">arrow_forward</span>
            </Link>
            <Link
              href="/services?category=teaching"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              <span>Soutien Scolaire à Domicile</span>
              <span className="material-symbols-outlined text-primary text-base">arrow_forward</span>
            </Link>
            <Link
              href="/securite-et-confiance"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              <span>Notre Charte de Vérification Physique</span>
              <span className="material-symbols-outlined text-secondary text-base">shield</span>
            </Link>
            <Link
              href="/tarifs-et-communes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              <span>Les 57 Communes & Tarifs en DA</span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">map</span>
            </Link>
            <Link
              href="/comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              <span>Comment ça marche</span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">help</span>
            </Link>
            <Link
              href="/devenir-prestataire"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-secondary hover:bg-secondary-fixed/50"
            >
              <span>Devenir Prestataire Vérifiée</span>
              <span className="material-symbols-outlined text-secondary text-base">person_add</span>
            </Link>
          </div>

          {/* User Spaces in Mobile */}
          {role === 'client' && (
            <div className="pt-2 border-t border-[#ded7ca]">
              <Link
                href="/client/demandes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-fixed/50 text-primary font-bold text-sm"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                <span>Mes Demandes de Garde</span>
              </Link>
            </div>
          )}

          {role === 'provider' && (
            <div className="pt-2 border-t border-[#ded7ca] space-y-1">
              <Link
                href="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary-fixed/50 text-secondary font-bold text-sm"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>Mon Espace Prestataire</span>
              </Link>
              <Link
                href="/provider/verification"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Vérification physique en main propre</span>
              </Link>
            </div>
          )}

          {role === 'admin' && (
            <div className="pt-2 border-t border-[#ded7ca] space-y-1">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-tertiary-fixed/60 text-tertiary font-bold text-sm"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Dispatching Téléphonique</span>
              </Link>
              <Link
                href="/admin/prestataires"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                <span>Vérifications CNI & Diplômes</span>
              </Link>
              <Link
                href="/admin/avis"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">reviews</span>
                <span>Modération des Avis</span>
              </Link>
            </div>
          )}

          {/* Quick Call in Mobile */}
          <div className="pt-2">
            <a
              href="tel:0550123456"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-secondary text-white font-bold text-sm shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              <span>Appeler le coordinateur (0550 12 34 56)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
