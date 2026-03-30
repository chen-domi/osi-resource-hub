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
  joinOrg: (orgName: string, pin: string) => Promise<'member' | 'eboard'>;
  leaveOrg: (orgName: string) => Promise<void>;
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
    if (supabaseUser) {
      supabase.from('profiles').update({ current_org: org }).eq('id', supabaseUser.id);
    }
    setUser((prev) => prev ? { ...prev, currentOrg: org } : prev);
  }, [supabaseUser]);

  const joinOrg = useCallback(async (orgName: string, pin: string): Promise<'member' | 'eboard'> => {
    const { data } = await supabase
      .from('organizations')
      .select('member_pin, eboard_pin')
      .eq('name', orgName)
      .single();
    let role: 'member' | 'eboard';
    if (data) {
      if (pin === data.eboard_pin) role = 'eboard';
      else if (pin === data.member_pin) role = 'member';
      else throw new Error('Incorrect PIN');
    } else {
      // Org not in DB yet — accept default PIN 0000
      if (pin !== '0000') throw new Error('Incorrect PIN');
      role = 'eboard';
    }
    const existing = (user?.organizations ?? []).filter((o) => o.org !== orgName);
    const newOrgs = [...existing, { org: orgName, role }];
    const newCurrentOrg = user?.currentOrg || orgName;
    if (supabaseUser) {
      await supabase.from('profiles').update({ organizations: newOrgs, current_org: newCurrentOrg }).eq('id', supabaseUser.id);
    }
    setUser((prev) => prev ? { ...prev, organizations: newOrgs, currentOrg: newCurrentOrg } : prev);
    return role;
  }, [user, supabaseUser]);

  const leaveOrg = useCallback(async (orgName: string) => {
    const newOrgs = (user?.organizations ?? []).filter((o) => o.org !== orgName);
    const newCurrentOrg = user?.currentOrg === orgName ? (newOrgs[0]?.org ?? '') : (user?.currentOrg ?? '');
    if (supabaseUser) {
      await supabase.from('profiles').update({ organizations: newOrgs, current_org: newCurrentOrg }).eq('id', supabaseUser.id);
    }
    setUser((prev) => prev ? { ...prev, organizations: newOrgs, currentOrg: newCurrentOrg } : prev);
  }, [user, supabaseUser]);

  const devLogin = useCallback(() => {
    setUser({
      id: 'dev-user',
      name: 'Test User',
      email: 'testuser@bc.edu',
      organizations: [
        { org: 'UGBC', role: 'eboard' },
        { org: 'BC Debate Society', role: 'eboard' },
        { org: 'BC Surf Club', role: 'eboard' },
        { org: 'Finance Club', role: 'eboard' },
      ],
      currentOrg: 'UGBC',
      isOSIAdmin: false,
    });
    setNeedsProfileSetup(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, needsProfileSetup, completeProfileSetup, logout, switchOrg, joinOrg, leaveOrg, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
