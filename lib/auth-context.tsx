'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types';
import { DataStore } from './store';
import { createClient, isSupabaseConfigured } from './supabase/client';
import { INITIAL_PROFILES } from './mock-data';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password?: string; full_name: string; role: UserRole; phone?: string; location?: string }) => Promise<{ success: boolean; error?: string }>;
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

  // Initialize auth state
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    const initAuth = async () => {
      setLoading(true);
      if (configured) {
        const supabase = createClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            const p = await DataStore.getProfileById(session.user.id);
            if (p) {
              setProfile(p);
              setRole(p.role);
            }
          }
        }
      } else {
        // Load demo user from localStorage or default to client
        const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('sm_current_user_id') : null;
        const profiles = await DataStore.getProfiles();
        const active = profiles.find(p => p.id === storedUserId) || profiles.find(p => p.role === 'client') || INITIAL_PROFILES[5];
        
        if (active) {
          setUser({ id: active.id, email: `${active.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com` });
          setProfile(active);
          setRole(active.role);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to local data changes
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
    return () => window.removeEventListener('sm_data_change', handleDataChange);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    if (isConfigured) {
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          const p = await DataStore.getProfileById(data.user.id);
          if (p) {
            setProfile(p);
            setRole(p.role);
          }
          setLoading(false);
          return { success: true };
        }
      }
    }

    // Demo / fallback mode login
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
  }): Promise<{ success: boolean; error?: string }> => {
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
          return { success: false, error: error.message };
        }
        if (authData.user) {
          const newProf: Profile = {
            id: authData.user.id,
            role: data.role,
            full_name: data.full_name,
            phone: data.phone,
            location: data.location,
            created_at: new Date().toISOString(),
          };
          await DataStore.saveProfile(newProf);
          setUser({ id: authData.user.id, email: authData.user.email });
          setProfile(newProf);
          setRole(data.role);
          setLoading(false);
          return { success: true };
        }
      }
    }

    // Demo mode signup
    const newId = `usr_${data.role}_${Date.now()}`;
    const newProf: Profile = {
      id: newId,
      role: data.role,
      full_name: data.full_name,
      phone: data.phone || '0550 12 34 56',
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
    return { success: true };
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
    // Production Safety: Never permit demo role switching when connected to live backend
    if (isSupabaseConfigured()) {
      console.warn('Role switching is disabled in production with live Supabase authentication.');
      return;
    }

    setLoading(true);
    const profiles = await DataStore.getProfiles();
    let target = profileId ? profiles.find(p => p.id === profileId) : profiles.find(p => p.role === targetRole);
    
    if (!target) {
      target = INITIAL_PROFILES.find(p => p.role === targetRole);
    }

    if (target) {
      if (typeof window !== 'undefined') localStorage.setItem('sm_current_user_id', target.id);
      setUser({ id: target.id, email: `${target.full_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com` });
      setProfile(target);
      setRole(target.role);
    }
    setLoading(false);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    await DataStore.saveProfile(updated);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
