import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthUser } from '../types';

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  needsOrgSelection: boolean;
  authError: string | null;
  selectOrg: (orgName: string, role: 'eboard') => void;
  logout: () => Promise<void>;
  switchOrg: (org: string) => void;
  joinOrg: (orgName: string, pin: string) => Promise<'eboard'>;
  /** @deprecated No-op in session-based auth model. Use switchOrg instead. */
  leaveOrg: (orgName: string) => Promise<void>;
  clearAuthError: () => void;
  devLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(su: SupabaseUser): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', su.id)
    .single();
  if (error || !data) return null;
  return {
    id: su.id,
    name: data.name,
    email: data.email,
    organizations: data.organizations ?? [],
    currentOrg: data.current_org ?? '',
    isOSIAdmin: data.is_osi_admin ?? false,
  };
}

function deriveName(su: SupabaseUser): string {
  if (su.user_metadata?.full_name) return su.user_metadata.full_name;
  const prefix = (su.email ?? '').split('@')[0];
  return prefix.split(/[.\-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOrgSelection, setNeedsOrgSelection] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleSupabaseUser(su: SupabaseUser) {
    setSupabaseUser(su);

    // Validate @bc.edu domain — set error state BEFORE signing out to avoid race
    if (!su.email?.toLowerCase().endsWith('@bc.edu')) {
      setAuthError('Only @bc.edu accounts are allowed. Please use your Boston College email.');
      setUser(null);
      setSupabaseUser(null);
      setLoading(false);
      supabase.auth.signOut(); // fire-and-forget, no await
      return;
    }

    let profile = await fetchProfile(su);

    if (!profile) {
      // Auto-create a minimal profile for new users (no PIN required at this step)
      const name = deriveName(su);
      const { error } = await supabase.from('profiles').insert({
        id: su.id,
        name,
        email: su.email!,
        organizations: [],
        current_org: '',
        is_osi_admin: false,
      });
      if (!error) {
        profile = {
          id: su.id,
          name,
          email: su.email!,
          organizations: [],
          currentOrg: '',
          isOSIAdmin: false,
        };
      }
    }

    if (!profile) {
      // Profile creation failed — sign out
      await supabase.auth.signOut();
      setAuthError('Failed to create your profile. Please try again.');
      setLoading(false);
      return;
    }

    setUser(profile);

    // OSI admins skip org selection entirely
    if (profile.isOSIAdmin) {
      setNeedsOrgSelection(false);
      setLoading(false);
      return;
    }

    // Skip PIN if user has previously verified an org (current_org set in DB)
    if (profile.currentOrg) {
      // Prefer localStorage (reflects most recent switch), fall back to DB
      const storedOrg = localStorage.getItem('currentOrg');
      const restoredOrg = storedOrg || profile.currentOrg;
      localStorage.setItem('currentOrg', restoredOrg);
      localStorage.setItem('currentRole', 'eboard');
      setUser((prev) => prev ? { ...prev, currentOrg: restoredOrg } : prev);
      setNeedsOrgSelection(false);
    } else {
      setNeedsOrgSelection(true);
    }

    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else {
        setUser(null);
        setSupabaseUser(null);
        setNeedsOrgSelection(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Called after successful PIN entry — stores org in localStorage and persists to DB
  const selectOrg = useCallback((orgName: string, role: 'eboard') => {
    localStorage.setItem('currentOrg', orgName);
    localStorage.setItem('currentRole', role);
    if (supabaseUser) {
      supabase.from('profiles').update({ current_org: orgName }).eq('id', supabaseUser.id);
    }
    setUser((prev) => prev ? { ...prev, currentOrg: orgName } : prev);
    setNeedsOrgSelection(false);
  }, [supabaseUser]);

  const logout = useCallback(async () => {
    localStorage.removeItem('currentOrg');
    localStorage.removeItem('currentRole');
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setNeedsOrgSelection(false);
    setAuthError(null);
  }, []);

  const switchOrg = useCallback((org: string) => {
    if (!org) return;
    localStorage.setItem('currentOrg', org);
    localStorage.setItem('currentRole', 'eboard');
    if (supabaseUser) {
      supabase.from('profiles').update({ current_org: org }).eq('id', supabaseUser.id);
    }
    setUser((prev) => prev ? { ...prev, currentOrg: org } : prev);
  }, [supabaseUser]);

  const joinOrg = useCallback(async (orgName: string, pin: string): Promise<'eboard'> => {
    const { data } = await supabase
      .from('organizations')
      .select('eboard_pin')
      .eq('name', orgName)
      .single();

    if (!data) throw new Error('Organization not found. Please try again.');
    if (pin !== data.eboard_pin) throw new Error('Incorrect PIN. Please try again.');
    return 'eboard';
  }, []);

  // No-op: org membership is now session-scoped via localStorage, not stored in profile
  const leaveOrg = useCallback(async (_orgName: string) => {
    // In the current auth model, "leaving" an org means switching to a different one.
    // Use switchOrg() for that. This stub exists for backward compatibility.
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const devLogin = useCallback(() => {
    localStorage.setItem('currentOrg', 'UGBC');
    localStorage.setItem('currentRole', 'eboard');
    setUser({
      id: 'dev-user',
      name: 'Test User',
      email: 'testuser@bc.edu',
      organizations: [{ org: 'UGBC', role: 'eboard' }],
      currentOrg: 'UGBC',
      isOSIAdmin: false,
    });
    setNeedsOrgSelection(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, needsOrgSelection, authError,
      selectOrg, logout, switchOrg, joinOrg, leaveOrg, clearAuthError, devLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
