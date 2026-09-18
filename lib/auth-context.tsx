'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types';
import { DataStore } from './store';
import { createClient, isSupabaseConfigured } from './supabase/client';
import { INITIAL_PROFILES } from './mock-data';
import { ADMIN_CONTACT } from './constants';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { 
    email: string; 
    password?: string; 
    full_name: string; 
    role: UserRole; 
    phone?: string; 
    location?: string;
  }) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, profileId?: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialisation de la session
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    let authSub: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      setLoading(true);
      if (configured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              setUser({ id: session.user.id, email: session.user.email });
              let p = await DataStore.getProfileById(session.user.id);
              if (!p) {
                const meta = session.user.user_metadata || {};
                p = {
                  id: session.user.id,
                  role: meta.role || 'client',
                  full_name: meta.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
                  phone: meta.phone || null,
                  location: meta.location || 'Alger Centre',
                  verification_status: meta.role === 'provider' ? 'en_attente_physique' : 'non_verifie',
                  created_at: new Date().toISOString(),
                };
              }
              setProfile(p);
              setRole(p.role);
            }

            // Écouter les changements d'état d'authentification (ex: confirmation par email)
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
              if (session?.user) {
                setUser({ id: session.user.id, email: session.user.email });
                const p = await DataStore.getProfileById(session.user.id);
                if (p) {
                  setProfile(p);
                  setRole(p.role);
                }
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setRole('client');
              }
            });
            authSub = subscription;
          } catch (err) {
            console.error('Erreur initialisation Supabase auth:', err);
          }
        }
      } else {
        // Mode test local (fallback)
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('sm_current_user_id') : null;
        if (storedUserId) {
          const profiles = await DataStore.getProfiles();
          const active = profiles.find(p => p.id === storedUserId);
          if (active) {
            setUser({ id: active.id, email: `${active.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com` });
            setProfile(active);
            setRole(active.role);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Écouter les changements de profil
    const handleDataChange = async () => {
      if (profile?.id) {
        const updated = await DataStore.getProfileById(profile.id);
        if (updated) {
          setProfile(updated);
          setRole(updated.role);
        }
      }
    };

    window.addEventListener('sm_data_change', handleDataChange);
    return () => {
      window.removeEventListener('sm_data_change', handleDataChange);
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (isConfigured) {
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          let msg = error.message;
          if (error.message.includes('Invalid login credentials')) {
            msg = 'Adresse e-mail ou mot de passe incorrect.';
          } else if (error.message.includes('Email not confirmed')) {
            msg = 'Votre adresse e-mail n\'a pas encore été confirmée. Veuillez cliquer sur le lien envoyé dans votre boîte de réception.';
          }
          return { success: false, error: msg };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          let p = await DataStore.getProfileById(data.user.id);
          if (!p) {
            const meta = data.user.user_metadata || {};
            p = {
              id: data.user.id,
              role: meta.role || 'client',
              full_name: meta.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
              phone: meta.phone || null,
              location: meta.location || 'Alger Centre',
              verification_status: meta.role === 'provider' ? 'en_attente_physique' : 'non_verifie',
              created_at: new Date().toISOString(),
            };
          }
          setProfile(p);
          setRole(p.role);
          setLoading(false);
          return { success: true };
        }
      }
    }

    // Mode Démo / Test Local
    const profiles = await DataStore.getProfiles();
    const found = profiles.find(p => 
      email.toLowerCase().includes(p.role) || 
      email.toLowerCase().includes(p.full_name.split(' ')[0].toLowerCase())
    ) || profiles[0];

    if (found) {
      if (typeof window !== 'undefined') localStorage.setItem('sm_current_user_id', found.id);
      setUser({ id: found.id, email });
      setProfile(found);
      setRole(found.role);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: true };
  };

  const signup = async (data: {
    email: string;
    password?: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    location?: string;
  }): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoading(true);

    if (isConfigured) {
      const supabase = createClient();
      if (supabase && data.password) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role,
              full_name: data.full_name,
              phone: data.phone,
              location: data.location,
            },
          },
        });

        if (error) {
          setLoading(false);
          let errorMsg = error.message;
          if (error.message.includes('User already registered')) {
            errorMsg = 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.';
          } else if (error.message.includes('Password should be at least')) {
            errorMsg = 'Le mot de passe doit comporter au moins 6 caractères.';
          } else if (error.message.includes('valid email')) {
            errorMsg = 'Veuillez saisir une adresse email valide.';
          }
          return { success: false, error: errorMsg };
        }

        if (authData.user) {
          // Si la confirmation par e-mail est requise par Supabase (session est null)
          if (!authData.session) {
            setLoading(false);
            return {
              success: true,
              requiresEmailConfirmation: true,
            };
          }

          // Si la session est active immédiatement (auto-confirmation)
          const newProf: Profile = {
            id: authData.user.id,
            role: data.role,
            full_name: data.full_name,
            phone: data.phone || null,
            location: data.location || 'Alger Centre',
            created_at: new Date().toISOString(),
            verification_status: data.role === 'provider' ? 'en_attente_physique' : 'non_verifie',
          };

          try {
            await DataStore.saveProfile(newProf);
          } catch (e) {
            console.warn('Création du profil déléguée au trigger SQL:', e);
          }

          setUser({ id: authData.user.id, email: authData.user.email });
          setProfile(newProf);
          setRole(data.role);
          setLoading(false);
          return { success: true, requiresEmailConfirmation: false };
        }
      }
    }

    // Mode Démo / Test Local
    const newId = `usr_${data.role}_${Date.now()}`;
    const newProf: Profile = {
      id: newId,
      role: data.role,
      full_name: data.full_name,
      phone: data.phone || ADMIN_CONTACT.phone,
      location: data.location || 'Alger Centre',
      avatar_url: data.role === 'provider' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      verification_status: data.role === 'provider' ? 'en_attente_physique' : 'non_verifie',
    };

    await DataStore.saveProfile(newProf);
    if (typeof window !== 'undefined') localStorage.setItem('sm_current_user_id', newId);
    setUser({ id: newId, email: data.email });
    setProfile(newProf);
    setRole(data.role);
    setLoading(false);
    return { success: true, requiresEmailConfirmation: false };
  };

  const logout = async () => {
    setLoading(true);
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') localStorage.removeItem('sm_current_user_id');
    setUser(null);
    setProfile(null);
    setRole('client');
    setLoading(false);
  };

  const switchDemoRole = async (targetRole: UserRole, profileId?: string) => {
    if (isSupabaseConfigured()) {
      console.warn('Role switching is disabled in production with live Supabase authentication.');
      return;
    }

    setLoading(true);
    const profiles = await DataStore.getProfiles();
    let target = profileId ? profiles.find(p => p.id === profileId) : profiles.find(p => p.role === targetRole);
    
    if (!target) {
      target = {
        id: `demo_${targetRole}`,
        role: targetRole,
        full_name: targetRole === 'admin' ? 'Coordinateur Alger' : targetRole === 'provider' ? 'Prestataire Démo' : 'Famille Démo',
        location: 'Alger Centre',
        verification_status: targetRole === 'provider' ? 'verifie_en_main_propre' : 'non_verifie',
        created_at: new Date().toISOString(),
      };
      await DataStore.saveProfile(target);
    }

    if (typeof window !== 'undefined') localStorage.setItem('sm_current_user_id', target.id);
    setUser({ id: target.id, email: `${targetRole}@tatawafa.dz` });
    setProfile(target);
    setRole(target.role);
    setLoading(false);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    const updated = await DataStore.saveProfile({ ...profile, ...data });
    setProfile(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      loading,
      isConfigured,
      login,
      signup,
      logout,
      switchDemoRole,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
