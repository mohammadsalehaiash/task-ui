"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import apiClient from '@/types/apiClient';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get('/user')
      .then((res) => setUser(res.data.data))
      .catch(() => Cookies.remove('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiClient.post('/login', { email, password });
      const { token, user } = res.data.data;
      Cookies.set('auth_token', token, { expires: 7, sameSite: 'lax' });
      setUser(user);
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/logout');
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}