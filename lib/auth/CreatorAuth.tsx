'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Creator {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active';
}

interface AuthContext {
  creator: Creator | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; wechat?: string; portfolio?: string; art_style?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContext>({
  creator: null,
  loading: true,
  refreshAuth: async () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

export function CreatorAuthProvider({ children }: { children: ReactNode }) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setCreator(json.data);
      } else {
        setCreator(null);
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) {
      setCreator(json.data);
      return { success: true };
    }
    return { success: false, message: json.message };
  }

  async function register(data: Parameters<AuthContext['register']>[0]) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      // Don't set creator state — account is pending approval
      // Creator must wait for admin approval then login manually
      return { success: true, pending: true };
    }
    return { success: false, message: json.message };
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCreator(null);
    window.location.href = '/login';
  }

  async function refreshAuth() {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const json = await res.json();
      setCreator(json.data);
    }
  }

  return (
    <AuthContext.Provider value={{ creator, loading, refreshAuth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCreatorAuth() {
  return useContext(AuthContext);
}
