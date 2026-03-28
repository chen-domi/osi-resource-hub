import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'osi_auth_user';

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic shape validation
    if (
      typeof parsed.name !== 'string' ||
      typeof parsed.email !== 'string' ||
      !Array.isArray(parsed.organizations) ||
      typeof parsed.currentOrg !== 'string' ||
      typeof parsed.isOSIAdmin !== 'boolean'
    ) return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadSession);

  const login = useCallback((u: AuthUser) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
