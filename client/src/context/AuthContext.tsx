import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Language, translations } from '../i18n/translations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.uz) => string;
  loginAsRole: (role: UserRole) => Promise<void>;
  loginOneID: (pinfl: string, fullName: string) => Promise<void>;
  logout: () => void;
  acceptTerms: () => Promise<void>;
  showOneIdModal: boolean;
  setShowOneIdModal: (val: boolean) => void;
}

const defaultUser: User = {
  id: 'user-filial-mm',
  pinfl: '32502930050011',
  fullName: 'Bo\'riyev Komiljon Ergashovich',
  email: 'filial.mm@kadastr.uz',
  phone: '+998 97 777-88-99',
  role: 'FILIAL_DKP_MM',
  region: 'Toshkent shahri',
  district: 'Chilonzor tumani',
  department: 'Chilonzor tumani filiali manzil berish bo\'limi',
  isActive: true,
  termsAccepted: true,
  createdAt: '2026-01-15T08:30:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [token, setToken] = useState<string | null>('demo-token-123');
  const [language, setLanguage] = useState<Language>('uz');
  const [showOneIdModal, setShowOneIdModal] = useState<boolean>(false);

  useEffect(() => {
    // Attempt to fetch current user from storage or fallback
    const savedUser = localStorage.getItem('manzil_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const loginAsRole = async (targetRole: UserRole) => {
    try {
      const res = await api.switchRole(targetRole);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('manzil_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Role switch failed, updating locally', err);
      if (user) {
        const updated = { ...user, role: targetRole };
        setUser(updated);
        localStorage.setItem('manzil_user', JSON.stringify(updated));
      }
    }
  };

  const loginOneID = async (pinfl: string, fullName: string) => {
    try {
      const res = await api.oneIdLogin({ pinfl, fullName });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('manzil_user', JSON.stringify(res.user));
        setShowOneIdModal(false);
      }
    } catch (err) {
      console.error('OneID login error', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('manzil_user');
    // Default to citizen observer
    loginAsRole('CITIZEN');
  };

  const acceptTerms = async () => {
    if (!user) return;
    try {
      const res = await api.acceptTerms(user.id);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('manzil_user', JSON.stringify(res.user));
      }
    } catch (e) {
      const updated = { ...user, termsAccepted: true };
      setUser(updated);
    }
  };

  const t = (key: keyof typeof translations.uz): string => {
    return translations[language][key] || translations.uz[key] || String(key);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : 'CITIZEN',
        language,
        setLanguage,
        t,
        loginAsRole,
        loginOneID,
        logout,
        acceptTerms,
        showOneIdModal,
        setShowOneIdModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
