import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (role: 'operador' | 'mecanico') => void;
}

const USERS: Record<string, { pass: string; user: User }> = {
  operador: {
    pass: 'operador123',
    user: {
      id: 'usr-operador-1',
      username: 'operador',
      name: 'João Silva',
      role: 'operador',
      cargo: 'Operador de Produção',
      setor: 'Linha de Estamparia & Usinagem',
    },
  },
  mecanico: {
    pass: 'mecanico123',
    user: {
      id: 'usr-mecanico-1',
      username: 'mecanico',
      name: 'Carlos Andrade',
      role: 'mecanico',
      cargo: 'Mecânico de Manutenção Industrial',
      setor: 'Oficina Central de Manutenção',
    },
  },
};

const STORAGE_KEY_AUTH = 'techchamados_logged_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erro ao recuperar usuário:', e);
    }
    // Inicia deslogado para exibir a tela de login profissional
    return null;
  });

  const login = (usernameInput: string, passwordInput: string) => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const target = USERS[cleanUser];

    if (!target) {
      return {
        success: false,
        error: 'Usuário não encontrado. Use "operador" ou "mecanico".',
      };
    }

    if (target.pass !== passwordInput) {
      return {
        success: false,
        error: 'Senha incorreta para este usuário.',
      };
    }

    setCurrentUser(target.user);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(target.user));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  const switchUser = (role: 'operador' | 'mecanico') => {
    const target = USERS[role];
    if (target) {
      setCurrentUser(target.user);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(target.user));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
