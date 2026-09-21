'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { ALGER_COMMUNES, ADMIN_CONTACT } from '@/lib/constants';
import { Logo } from '@/components/Logo';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get('role');
  const { signup } = useAuth();
  
  const [role, setRole] = useState<UserRole>(queryRole === 'provider' ? 'provider' : 'client');

  useEffect(() => {
    if (queryRole === 'provider') {
      setRole('provider');
    }
  }, [queryRole]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<string>('Alger Centre');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Veuillez renseigner un numéro de téléphone pour la coordination téléphonique.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await signup({
        email,
        password,
        full_name: fullName,
        role,
        phone,
        location,
      });

      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setEmailSent(true);
        } else {
          if (role === 'provider') {
            router.push('/provider/dashboard');
          } else {
            router.push('/client/demandes');
          }
        }
      } else {
        setError(res.error || 'Impossible de créer le compte.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // ÉCRAN DE SUCCÈS : CONFIRMATION D'EMAIL ENVOYÉE
  // --------------------------------------------------------------------------
  if (emailSent) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-8 shadow-card space-y-6 text-center animate-in fade-in duration-300">
          
          <div className="w-16 h-16 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-3xl material-symbols-fill">mark_email_read</span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary block">
              Vérification de Compte
            </span>
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              Vérifiez votre boîte e-mail
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Un e-mail de confirmation vient d'être envoyé à l'adresse{' '}
              <strong className="text-on-surface font-semibold">{email}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ebdcd4] text-xs text-on-surface-variant space-y-2 text-left">
            <div className="flex items-center gap-2 text-secondary font-bold">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Instructions d'activation :</span>
            </div>
            <p className="leading-relaxed">
              1. Ouvrez votre messagerie et cliquez sur le lien d'activation reçu.<br />
              2. Pensez à vérifier vos <strong>courriers indésirables (spams)</strong> si l'e-mail tarde à apparaître.<br />
              3. Revenez ensuite sur Amana pour vous connecter.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Accéder à la page de connexion</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>

            <a
              href={`tel:${ADMIN_CONTACT.phone}`}
              className="text-xs text-on-surface-variant hover:text-primary transition flex items-center justify-center gap-1.5 pt-1"
            >
              <span className="material-symbols-outlined text-sm">support_agent</span>
              <span>Besoin d'aide ? Contactez le coordinateur au {ADMIN_CONTACT.phone}</span>
            </a>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FORMULAIRE D'INSCRIPTION ORGANIC STITCH
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-xl w-full bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-10 shadow-card space-y-6">
        
        {/* En-tête & Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <Logo className="h-10 w-auto mx-auto group-hover:scale-102 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Créer votre compte Amana
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto">
              Rejoignez le réseau familial de confiance pour la garde d'enfants et les cours particuliers à Alger.
            </p>
          </div>
        </div>

        {/* Message d'Erreur */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">error</span>
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Sélecteur de Rôle Organique */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Vous rejoignez Amana en tant que :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option Client / Famille */}
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  role === 'client'
                    ? 'border-primary bg-primary-fixed/30 ring-1 ring-primary text-on-surface'
                    : 'border-[#ded7ca] bg-[#FAF8F5] hover:bg-white text-on-surface-variant'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'client' ? 'bg-primary text-white' : 'bg-[#ede8df] text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl material-symbols-fill">family_restroom</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Famille / Parent</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    Trouver une nounou ou un prof vérifié pour mes enfants
                  </p>
                </div>
              </button>

              {/* Option Prestataire */}
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  role === 'provider'
                    ? 'border-secondary bg-secondary-fixed/30 ring-1 ring-secondary text-on-surface'
                    : 'border-[#ded7ca] bg-[#FAF8F5] hover:bg-white text-on-surface-variant'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  role === 'provider' ? 'bg-secondary text-white' : 'bg-[#ede8df] text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-xl material-symbols-fill">assignment_ind</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Intervenante / Nounou</h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    Postuler et proposer mes services de garde ou soutien
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Grille des Champs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nom Complet */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Nom Complet
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Yasmine Belkacem"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none font-medium transition"
                />
              </div>
            </div>

            {/* Téléphone (Crucial pour la coordination à Alger) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Téléphone Mobile (Coordination)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none">
                  call
                </span>
                <input
                  type="tel"
                  required
                  placeholder="0550 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-secondary/20 focus:bg-white outline-none font-medium transition"
                />
              </div>
            </div>

            {/* Commune de Résidence */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Commune d'Alger
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-lg pointer-events-none">
                  location_on
                </span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-[#FAF8F5] border border-[#ded7ca] rounded-2xl text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none font-medium appearance-none cursor-pointer"
                >
                  {ALGER_COMMUNES.map((com) => (
                    <option key={com} value={com}>
                      {com}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1 sm:col-span-2">
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
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-on-surface uppercase tracking-wider">
                Mot de Passe (6 caractères min.)
              </label>
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

          </div>

          {/* Rassurance Piliers Amana */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ebdcd4] flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-xl shrink-0 material-symbols-fill">
              verified_user
            </span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              <strong>Engagement de confidentialité :</strong> Vos coordonnées téléphoniques restent strictement protégées. Zéro document sensible en ligne, coordination humaine directe par téléphone.
            </p>
          </div>

          {/* Bouton de Soumission */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-primary hover:bg-primary-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                <span>Création de votre compte en cours...</span>
              </>
            ) : (
              <>
                <span>Créer mon compte {role === 'provider' ? 'Prestataire' : 'Famille'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>

        </form>

        {/* Lien de Connexion */}
        <div className="pt-2 text-center text-xs text-on-surface-variant">
          Vous possédez déjà un compte ?{' '}
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-[#FAF8F5] flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary">
            progress_activity
          </span>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
