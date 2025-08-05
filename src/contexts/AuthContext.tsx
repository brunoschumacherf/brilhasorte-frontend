import React, { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';
import { type User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalanceInCents: number) => void; // Nova função
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (useEffect e outras funções existentes)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(response => {
          setUser(response.data.data.attributes);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
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
  
  const register = async (userData: any) => {
    const response = await apiRegister(userData);
    localStorage.setItem('token', response.headers.authorization.split(' ')[1]);
    const profileResponse = await getProfile();
    setUser(profileResponse.data.data.attributes);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  // Função para atualizar o saldo do usuário no estado global
  const updateBalance = useCallback((newBalanceInCents: number) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return { ...currentUser, balance_in_cents: newBalanceInCents };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateBalance, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// ... (hook useAuth existente)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};