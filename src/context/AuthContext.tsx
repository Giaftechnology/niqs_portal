import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'probational' | 'graduate' | 'student' | 'admin';

export type User = {
  email: string;
  role: UserRole;
  onboardingComplete: boolean;
  profile?: {
    fullName?: string;
    phone?: string;
    department?: string;
  };
  tempPassword?: string; // mock temp password before first login confirmation
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, role: Exclude<UserRole, 'admin'>) => Promise<User>;
  signInAsAdmin?: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  completeOnboarding: (profile: NonNullable<User['profile']>) => Promise<User | null>;
  verifyTempPassword: (password: string) => Promise<boolean>;
  resendTempPassword: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'logbook_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock: if user exists in storage and email matches, return it; else create new pending onboarding
    let next: User;
    setUser((prev) => {
      next = prev && prev.email === email ? prev : { email, role: 'probational', onboardingComplete: false };
      return next;
    });
    return next!;
  }, []);

  const signUp = useCallback(async (email: string, _password: string, role: Exclude<UserRole, 'admin'>) => {
    // Mock create user and mark onboarding not complete; store temp password until confirmation
    const created: User = { email, role, onboardingComplete: false, tempPassword: _password };
    setUser(created);
    return created;
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const completeOnboarding = useCallback(async (profile: NonNullable<User['profile']>) => {
    let updated: User | null = null;
    setUser((prev) => {
      updated = prev ? { ...prev, profile, onboardingComplete: true } : prev;
      return updated;
    });
    return updated;
  }, []);

  const verifyTempPassword = useCallback(async (password: string) => {
    if (!user) return false;
    const ok = user.tempPassword === password;
    if (ok) {
      setUser({ ...user, tempPassword: undefined });
    }
    return ok;
  }, [user]);

  const resendTempPassword = useCallback(async () => {
    if (!user) return null;
    const generate = (length = 12) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      let res = '';
      for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
      return res;
    };
    const nextTemp = generate(12);
    setUser({ ...user, tempPassword: nextTemp });
    return nextTemp;
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, completeOnboarding, verifyTempPassword, resendTempPassword, signInAsAdmin: async (email: string, _password: string) => {
      const admin: User = { email, role: 'admin', onboardingComplete: true };
      setUser(admin);
      return admin;
    }}),
    [user, loading, signIn, signUp, signOut, completeOnboarding, verifyTempPassword, resendTempPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please log in.</div>;
  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <a href="/admin/login" className="block min-h-screen flex items-center justify-center">Redirecting…</a>;
  }
  return <>{children}</>;
};
