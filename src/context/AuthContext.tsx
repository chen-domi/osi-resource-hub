import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthUser } from '../types';

export interface ProfileSetupData {
  organizations: Array<{ org: string; role: 'eboard' }>;
  currentOrg: string;
  isOSIAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  needsProfileSetup: boolean;
  completeProfileSetup: (data: ProfileSetupData) => Promise<void>;
  logout: () => Promise<void>;
  switchOrg: (org: string) => void;
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
    name: data.name,
    email: data.email,
    organizations: data.organizations,
    currentOrg: data.current_org,
    isOSIAdmin: data.is_osi_admin,
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
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  async function handleSupabaseUser(su: SupabaseUser) {
    setSupabaseUser(su);
    const profile = await fetchProfile(su);
    if (profile) {
      setUser(profile);
      setNeedsProfileSetup(false);
    } else {
      setUser(null);
      setNeedsProfileSetup(true);
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
        setNeedsProfileSetup(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completeProfileSetup = useCallback(async (data: ProfileSetupData) => {
    if (!supabaseUser) throw new Error('No authenticated user');
    const name = deriveName(supabaseUser);
    const { error } = await supabase.from('profiles').insert({
      id: supabaseUser.id,
      name,
      email: supabaseUser.email!,
      organizations: data.organizations,
      current_org: data.currentOrg,
      is_osi_admin: data.isOSIAdmin,
    });
    if (error) throw error;
    setUser({ name, email: supabaseUser.email!, organizations: data.organizations, currentOrg: data.currentOrg, isOSIAdmin: data.isOSIAdmin });
    setNeedsProfileSetup(false);
  }, [supabaseUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setNeedsProfileSetup(false);
  }, []);

  const switchOrg = useCallback((org: string) => {
    setUser((prev) => prev ? { ...prev, currentOrg: org } : prev);
  }, []);

  const devLogin = useCallback(() => {
    setUser({
      name: 'Test User',
      email: 'testuser@bc.edu',
      organizations: [{ org: 'BC Debate Society', role: 'eboard' }],
      currentOrg: 'BC Debate Society',
      isOSIAdmin: false,
    });
    setNeedsProfileSetup(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, needsProfileSetup, completeProfileSetup, logout, switchOrg, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
