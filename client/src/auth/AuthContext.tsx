import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { googleLogout } from '@react-oauth/google';
import type { User } from '../entities';
import { clearTokens, SESSION_EXPIRED_EVENT } from './tokenStorage';

const STORAGE_KEY = 'begoodit.auth.user';

type AuthContextValue = {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setUserState(readStoredUser());
    setIsInitialized(true);
  }, []);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUserState(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
    clearTokens();
  }, []);

  // When the session can't be refreshed anymore, tear it down completely and
  // let the router send the user back to the login screen.
  useEffect(() => {
    const handleSessionExpired = () => {
      googleLogout();
      logout();
      queryClient.clear();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [logout, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isInitialized, setUser, updateUser, logout }),
    [user, isInitialized, setUser, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('No authenticated user — render guards must protect this tree');
  return user;
}

export function useLogout(): () => void {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  return useCallback(() => {
    googleLogout();
    logout();
    queryClient.clear();
  }, [logout, queryClient]);
}
