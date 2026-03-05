import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';

export type UserRole = 'student' | 'staff' | 'admin' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, subjectIds?: string[]) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('smartcampus_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthResponse = (userData: any, email: string) => {
    const userObj = userData.user || userData;
    const token = userData.token;
    const newUser: User = {
      id: userObj._id || userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role as UserRole,
      token,
      avatar: userObj.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    setUser(newUser);
    localStorage.setItem('smartcampus_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response && response.success) {
      handleAuthResponse(response.data, email);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, subjectIds?: string[]) => {
    const response = await authAPI.register({ name, email, password, role, subjectIds });
    if (response && response.success) {
      handleAuthResponse(response.data, email);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartcampus_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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