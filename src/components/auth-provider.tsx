'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { User } from '@/lib/auth';
import { mockLogin, mockSignup, mockLogout, mockUpdateProfile, mockChangePassword } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: typeof mockLogin;
  signup: typeof mockSignup;
  logout: () => void;
  loading: boolean;
  updateProfile: (data: Partial<User> & { pictureFile?: File }) => Promise<{ success: boolean, error?: string, user?: User }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean, error?: string }>;
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
  
  const updateProfile = async (data: Partial<User> & { pictureFile?: File }) => {
    if (!user) return { success: false, error: "Not logged in" };
    setLoading(true);
    const result = await mockUpdateProfile(user.uid, data);
    if (result.success && result.user) {
        setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const changePassword = async (oldPass: string, newPass: string) => {
      if (!user) return { success: false, error: "Not logged in" };
      setLoading(true);
      const result = await mockChangePassword(user.uid, oldPass, newPass);
      setLoading(false);
      if (result.success) {
        // Log user out for security after password change
        logout();
      }
      return result;
  }

  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    loading,
    updateProfile,
    changePassword
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
