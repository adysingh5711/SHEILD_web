'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { User } from '@/lib/auth';
import { mockLogin, mockSignup, mockLogout } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: typeof mockLogin;
  signup: typeof mockSignup;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const result = await mockLogin(email, pass);
    if (result.success) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const signup = async (name:string, email: string, pass: string, picture?: File) => {
    setLoading(true);
    const result = await mockSignup(name, email, pass, picture);
    if (result.success) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const logout = () => {
    setLoading(true);
    mockLogout();
    setUser(null);
    setLoading(false);
  };
  
  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    loading
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
