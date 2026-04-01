import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('admin_token')
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string }>('/auth/login', { email, password });
    localStorage.setItem('admin_token', res.data.token);
    setToken(res.data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
