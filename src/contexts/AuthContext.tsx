import React, { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';
import type { User } from '../types';

type RegisterFunction = (userData: Omit<User, 'id' | 'balance_in_cents' | 'created_at'> & { password: any, password_confirmation: any }) => Promise<void>;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: RegisterFunction;
  logout: () => void;
  updateBalance: (newBalanceInCents: number) => void;
  updateUserDetails: (newDetails: Partial<User>) => void;
  setDailyGameClaimed: () => void; // Nova função
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(response => { setUser(response.data.data.attributes); })
        .catch(() => { localStorage.removeItem('token'); })
        .finally(() => { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    localStorage.setItem('token', response.headers.authorization.split(' ')[1]);
    const profileResponse = await getProfile();
    setUser(profileResponse.data.data.attributes);
  };

  const register: RegisterFunction = async (userData) => {
    const response = await apiRegister(userData);
    localStorage.setItem('token', response.headers.authorization.split(' ')[1]);
    const profileResponse = await getProfile();
    setUser(profileResponse.data.data.attributes);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const updateBalance = useCallback((newBalanceInCents: number) => {
    setUser(currentUser => currentUser ? { ...currentUser, balance_in_cents: newBalanceInCents } : null);
  }, []);

  const updateUserDetails = useCallback((newDetails: Partial<User>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...newDetails } : null);
  }, []);
  
  // NOVA FUNÇÃO: Define que o jogo diário foi resgatado
  const setDailyGameClaimed = useCallback(() => {
    setUser(currentUser => currentUser ? { ...currentUser, can_claim_daily_game: false } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBalance, updateUserDetails, setDailyGameClaimed, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};