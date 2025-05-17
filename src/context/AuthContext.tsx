import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { tokenService } from '../services/tokenService';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  setAuthToken: (token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(tokenService.getToken());
  
  const setAuthToken = (newToken: string) => {
    tokenService.saveToken(newToken);
    setToken(newToken);
  };
  
  const clearAuth = () => {
    tokenService.removeToken();
    setToken(null);
  };
  
  const value = {
    isAuthenticated: !!token,
    token,
    setAuthToken,
    clearAuth
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
