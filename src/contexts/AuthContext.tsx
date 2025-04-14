
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the User type
export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  level: number;
  totalReflections: number;
  chaptersRead: number;
  consecutiveDays: number;
  createdAt: Date;
};

// Define the AuthContextType
type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

// Mock user for development purposes
const MOCK_USER: User = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@exemplo.com",
  photoURL: "https://i.pravatar.cc/150?img=3",
  level: 2,
  totalReflections: 12,
  chaptersRead: 23,
  consecutiveDays: 5,
  createdAt: new Date("2024-01-15")
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // In a real app, this would check if the user is already authenticated
    // For now, we'll simulate auth state with localStorage
    const savedUser = localStorage.getItem('palavraViva_user');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  // Mock Google sign-in function
  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would connect to Google OAuth
      // For now, we'll use our mock user
      setCurrentUser(MOCK_USER);
      localStorage.setItem('palavraViva_user', JSON.stringify(MOCK_USER));
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    
    try {
      // Clear user data
      setCurrentUser(null);
      localStorage.removeItem('palavraViva_user');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
