'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/store';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ALGER_COMMUNES, ADMIN_CONTACT } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, role, loading: authLoading, updateProfile } = useAuth();

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>(ALGER_COMMUNES[0]);
  const [bio, setBio] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || ALGER_COMMUNES[0]);
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="text-xs text-on-surface-variant font-medium">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!user && !profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-primary-fixed/50 text-primary rounded-3xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">account_circle</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-on-surface">Connectez-vous à votre compte</h2>
        <p className="text-xs text-on-surface-variant">
          Vous devez être connecté pour consulter et modifier votre profil.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-2xl bg-surface-container-low border border-[#ded7ca] text-xs font-bold text-on-surface hover:bg-[#ede8df] transition"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        location,
        bio: bio.trim() || null,
      });
      setFeedback({ type: 'success', message: 'Votre profil a été mis à jour avec succès.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Erreur lors de la mise à jour de votre profil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeToProvider = async () => {
    if (!user) return;
    if (!confirm("Voulez-vous activer le rôle Prestataire sur votre compte ? Vous serez immédiatement redirigé pour rédiger votre première annonce de garde ou de soutien.")) {
      return;
    }
    setUpgrading(true);
    setFeedback(null);
    try {
      await DataStore.updateUserRole(user.id, 'provider');
      setFeedback({ type: 'success', message: 'Félicitations ! Votre profil Prestataire est activé. Redirection vers la rédaction de votre annonce...' });
      setTimeout(() => {
        router.push('/provider/annonces');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || "Impossible de mettre à jour le rôle." });
      setUpgrading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Profil */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-white font-bold text-2xl flex items-center justify-center shadow-xs shrink-0">
              {fullName?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">
                  {profile?.full_name || 'Mon Compte Amana'}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-secondary-fixed text-on-secondary-fixed-variant">
                  {role === 'admin' ? 'Coordinateur Admin' : role === 'provider' ? 'Prestataire' : 'Compte Famille'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                {user?.email || 'Compte vérifié'} • Inscrit sur la plateforme Amana Alger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === 'client' && (
              <Link
                href="/client/demandes"
                className="px-4 py-2 bg-surface-container-low hover:bg-[#ede8df] text-on-surface rounded-2xl text-xs font-bold border border-[#ded7ca] transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                <span>Mes Demandes</span>
              </Link>
            )}

            {role === 'provider' && (
              <Link
                href="/provider/dashboard"
                className="px-4 py-2 bg-secondary hover:bg-secondary-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span>Mon Espace Prestataire</span>
              </Link>
            )}

            {role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Panneau Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{feedback.message}</span>
          </div>
        )}

        {/* SECTION SPECIALE : PASSER EN PRESTATAIRE (VISIBLE POUR LES CLIENTS) */}
        {role === 'client' && (
          <div className="bg-gradient-to-br from-[#fcf8ee] via-amber-50 to-[#FAF8F5] rounded-3xl border-2 border-[#D4A373] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-2xl">assignment_ind</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                  Proposer vos services
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-on-surface">
                  Vous souhaitez devenir Nounou ou Enseignant particulier ?
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Basculez votre compte en profil <strong>Prestataire</strong>. Votre compte passera immédiatement en statut « En attente bureau » et vous serez redirigé pour rédiger votre première annonce de garde ou de cours de soutien. Votre annonce et votre candidature parviendront directement au panneau de contrôle de l'administrateur.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                disabled={upgrading}
                onClick={handleUpgradeToProvider}
                className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {upgrading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Activation du profil prestataire...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                    <span>Activer mon profil Prestataire &amp; Créer mon annonce</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-on-surface-variant italic text-center sm:text-left">
                0 DA en ligne • 100% Espèces de main à main
              </span>
            </div>
          </div>
        )}

        {/* STATUT DU PRESTATAIRE SI ROLE PROVIDER */}
        {role === 'provider' && (
          <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Statut de votre dossier :
                </span>
                <VerificationBadge status={profile?.verification_status || 'en_attente_physique'} size="sm" />
              </div>
              <p className="text-xs text-on-surface-variant">
                {profile?.verification_status === 'verifie_en_main_propre'
                  ? "Félicitations ! Vos 7 pièces ont été validées au bureau d'Alger. Votre Sceau Or est actif et votre annonce est visible."
                  : "Votre dossier physique est en attente d'examen au bureau d'Alger (photocopies obligatoirement légalisées à l'APC)."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/provider/annonces"
                className="px-4 py-2 bg-primary text-white hover:bg-primary-600 text-xs font-bold rounded-2xl shadow-xs transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span>Mon annonce</span>
              </Link>
              <Link
                href="/provider/verification"
                className="px-4 py-2 bg-[#FAF8F5] border border-[#ded7ca] text-on-surface hover:bg-[#ede8df] text-xs font-bold rounded-2xl transition"
              >
                Checklist 7 pièces
              </Link>
            </div>
          </div>
        )}

        {/* Formulaire de Modification des Coordonnées */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[#ded7ca] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#ded7ca] pb-4">
            <h2 className="font-serif text-lg font-bold text-on-surface">
              Coordonnées Personnelles &amp; Localisation
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Ces informations permettent aux familles et au coordinateur de vous joindre facilement.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nom Complet */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                  <span>Nom complet</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex : Karim Benali"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs text-on-surface focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">phone</span>
                  <span>Numéro de téléphone</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 XX XX XX XX / 06 / 07"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs text-on-surface focus:outline-none focus:border-primary transition font-mono"
                />
              </div>
            </div>

            {/* Commune Wilaya d'Alger */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                <span>Commune de résidence (Wilaya d'Alger)</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs text-on-surface focus:outline-none focus:border-primary transition"
              >
                {ALGER_COMMUNES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio / Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">description</span>
                <span>Présentation / Notes personnelles</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quelques mots sur vous, vos disponibilités ou vos besoins..."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#ded7ca] text-xs text-on-surface focus:outline-none focus:border-primary transition resize-none"
              />
            </div>

            {/* Bouton Sauvegarder */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Assistance Coordinateur */}
        <div className="p-5 rounded-3xl bg-[#f4f1ea] border border-[#ded7ca] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="font-bold text-on-surface">Besoin d'aide sur votre compte ?</span>
            <p className="text-on-surface-variant">
              Notre coordinateur permanent à Alger est disponible 7j/7 pour vous assister.
            </p>
          </div>
          <a
            href={`tel:${ADMIN_CONTACT.phone}`}
            className="px-4 py-2 bg-surface-container-lowest hover:bg-white text-primary font-bold rounded-2xl border border-[#ded7ca] transition flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-base">call</span>
            <span>{ADMIN_CONTACT.phone}</span>
          </a>
        </div>

      </div>
    </div>
  );
}
