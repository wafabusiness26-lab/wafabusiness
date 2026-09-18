'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Logo } from '@/components/Logo';
import { ADMIN_CONTACT } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirection après connexion réussie
        router.push('/');
      } else {
        setError(res.error || 'Adresse e-mail ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    setSubmitting(true);
    await switchDemoRole(targetRole);
    setSubmitting(false);
    if (targetRole === 'admin') router.push('/admin');
    else if (targetRole === 'provider') router.push('/provider/dashboard');
    else router.push('/client/demandes');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-10 shadow-card space-y-6">
        
        {/* En-tête & Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <Logo className="h-10 w-auto mx-auto group-hover:scale-102 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Connexion à votre compte
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Accédez à votre espace Famille, Prestataire ou Coordination
            </p>
          </div>
        </div>

        {/* Alerte d'Erreur */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">error</span>
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Adresse E-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                mail
              </span>
              <input
                type="email"
                required
                placeholder="nom@exemple.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none font-medium transition"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Mot de passe
              </label>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                lock
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none font-medium transition"
              />
            </div>
          </div>

          {/* Bouton de Connexion */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pt-2"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>

        </form>

        {/* Accès rapide en mode démo / test hors ligne */}
        {!isConfigured && (
          <div className="pt-4 border-t border-[#ebdcd4] space-y-2">
            <span className="text-[10px] font-bold text-outline block text-center uppercase tracking-wider">
              Accès Rapide Test Local (1-Clic)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('client')}
                className="px-2 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#ede8df] border border-[#ded7ca] text-on-surface text-xs font-semibold transition text-center"
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('provider')}
                className="px-2 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#ede8df] border border-[#ded7ca] text-secondary text-xs font-bold transition text-center"
              >
                Nounou
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-2 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition text-center"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Lien vers Inscription */}
        <div className="pt-2 text-center text-xs text-on-surface-variant space-y-2">
          <div>
            Vous n'avez pas encore de compte ?{' '}
            <Link href="/auth/signup" className="font-bold text-primary hover:underline">
              Créer un compte
            </Link>
          </div>
          <div className="text-[11px] text-outline">
            Besoin d'assistance ? Permanence Alger :{' '}
            <a href={`tel:${ADMIN_CONTACT.phone}`} className="font-semibold text-secondary hover:underline">
              {ADMIN_CONTACT.phone}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
