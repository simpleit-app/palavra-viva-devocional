
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
  signInWithCredentials: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithCredentials: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
  updateProfile: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // Check if user is already authenticated from localStorage
    const savedUser = localStorage.getItem('palavraViva_user');
    
    if (savedUser) {
      try {
        // Parse the user data and validate it's a User object
        const userData = JSON.parse(savedUser);
        if (userData && userData.id && userData.email) {
          // Convert createdAt string back to Date object
          if (typeof userData.createdAt === 'string') {
            userData.createdAt = new Date(userData.createdAt);
          }
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Erro ao parsear dados do usuário:", error);
        localStorage.removeItem('palavraViva_user');
      }
    }
    
    setLoading(false);
  }, []);

  // Sign up with email/password
  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if email already exists in local storage
      const users = JSON.parse(localStorage.getItem('palavraViva_users') || '[]');
      const existingUser = users.find((user: any) => user.email === email);
      
      if (existingUser) {
        throw new Error("Este e-mail já está em uso.");
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        photoURL: `https://i.pravatar.cc/150?u=${email}`, // Use email to generate a random avatar
        level: 1,
        totalReflections: 0,
        chaptersRead: 0,
        consecutiveDays: 0,
        createdAt: new Date()
      };
      
      // Save password separately in a "secure" object
      const credentials = JSON.parse(localStorage.getItem('palavraViva_credentials') || '{}');
      credentials[email] = { password };
      localStorage.setItem('palavraViva_credentials', JSON.stringify(credentials));
      
      // Save user to users list
      users.push(newUser);
      localStorage.setItem('palavraViva_users', JSON.stringify(users));
      
      // Log user in
      setCurrentUser(newUser);
      localStorage.setItem('palavraViva_user', JSON.stringify(newUser));
      
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signInWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Get credentials
      const credentials = JSON.parse(localStorage.getItem('palavraViva_credentials') || '{}');
      const userCredential = credentials[email];
      
      if (!userCredential || userCredential.password !== password) {
        throw new Error("E-mail ou senha incorretos.");
      }
      
      // Get user data
      const users = JSON.parse(localStorage.getItem('palavraViva_users') || '[]');
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error("Usuário não encontrado.");
      }
      
      // Convert createdAt string back to Date object
      if (typeof user.createdAt === 'string') {
        user.createdAt = new Date(user.createdAt);
      }
      
      // Login successful
      setCurrentUser(user);
      localStorage.setItem('palavraViva_user', JSON.stringify(user));
      
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock Google sign-in function
  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would connect to Google OAuth
      // For now, we'll simulate it with a random Google user
      const randomId = Math.floor(Math.random() * 1000);
      const googleUser: User = {
        id: `google_${randomId}`,
        name: `Usuário Google ${randomId}`,
        email: `usuario${randomId}@gmail.com`,
        photoURL: `https://i.pravatar.cc/150?img=${randomId % 70}`,
        level: 1,
        totalReflections: 0,
        chaptersRead: 0,
        consecutiveDays: 0,
        createdAt: new Date()
      };
      
      // Save to users list if not exists
      const users = JSON.parse(localStorage.getItem('palavraViva_users') || '[]');
      if (!users.find((u: any) => u.id === googleUser.id)) {
        users.push(googleUser);
        localStorage.setItem('palavraViva_users', JSON.stringify(users));
      }
      
      setCurrentUser(googleUser);
      localStorage.setItem('palavraViva_user', JSON.stringify(googleUser));
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    
    try {
      if (!currentUser) throw new Error("Nenhum usuário logado.");
      
      // Update current user
      const updatedUser = { ...currentUser, ...data };
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('palavraViva_users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === currentUser.id ? { ...u, ...data } : u
      );
      
      localStorage.setItem('palavraViva_users', JSON.stringify(updatedUsers));
      localStorage.setItem('palavraViva_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
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
    signInWithCredentials,
    signUp,
    signOut,
    isAuthenticated: !!currentUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
