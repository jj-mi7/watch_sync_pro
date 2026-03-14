import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Platform, Linking } from 'react-native';
import { storage } from './storage';

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  return '';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await storage.getAuthToken();
      if (!token) { setIsLoading(false); return; }
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
      else { await storage.setAuthToken(null); setUser(null); }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = useCallback(async () => {
    const apiBase = getApiBaseUrl();
    if (!apiBase) return;
    try {
      if (Platform.OS === 'web') {
        window.location.href = `${apiBase}/api/login`;
      } else {
        await Linking.openURL(`${apiBase}/api/login`);
      }
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    const token = await storage.getAuthToken();
    const apiBase = getApiBaseUrl();
    try {
      if (token && apiBase) {
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    await storage.setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
