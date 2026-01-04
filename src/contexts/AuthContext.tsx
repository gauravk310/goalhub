"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession } from '@/types';
import { getSession, clearSession, authenticateUser, createUser, initializeUserData } from '@/lib/dataService';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const newSession = await authenticateUser(email, password);
    setSession(newSession);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const user = await createUser(email, password, name);
    initializeUserData(user.id);
    const newSession = await authenticateUser(email, password);
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
