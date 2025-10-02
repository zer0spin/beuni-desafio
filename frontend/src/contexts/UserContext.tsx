import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, setAuthToken } from '@/lib/api';
import type { User } from '@/types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  updateUser: () => {},
  refreshUser: () => {},
  isLoading: true,
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do cookie
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // Atualizar dados do usuário
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    // Se a imagem foi atualizada, adicionar timestamp para forçar refresh
    if (userData.imagemPerfil) {
      userData = { 
        ...userData, 
        imagemPerfil: userData.imagemPerfil,
        imageTimestamp: Date.now()
      };
    }

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Atualizar cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('beuni_token='))
      ?.split('=')[1];
    
    if (token) {
      setAuthToken(token, updatedUser);
    }
  };

  // Recarregar usuário do cookie
  const refreshUser = () => {
    const currentUser = getUser();
    setUser(currentUser);
  };

  const value = {
    user,
    setUser,
    updateUser,
    refreshUser,
    isLoading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};