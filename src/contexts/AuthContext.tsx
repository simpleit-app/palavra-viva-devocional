
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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

// Helper function to convert Supabase user data to our User type
const formatUser = (user: SupabaseUser | null, profileData: any): User | null => {
  if (!user || !profileData) return null;
  
  return {
    id: user.id,
    name: profileData.name,
    email: profileData.email,
    photoURL: profileData.photo_url,
    level: profileData.level,
    totalReflections: profileData.total_reflections,
    chaptersRead: profileData.chapters_read,
    consecutiveDays: profileData.consecutive_days,
    createdAt: new Date(profileData.created_at),
  };
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount and setup auth listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                console.error("Error fetching user profile:", error);
                return;
              }
              
              setCurrentUser(formatUser(session.user, data));
              
              // Update last_access time
              await supabase
                .from('profiles')
                .update({ last_access: new Date().toISOString() })
                .eq('id', session.user.id);
                
            } catch (error) {
              console.error("Error in auth state change:", error);
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }
          
          setCurrentUser(formatUser(session.user, data));
          
          // Update last_access time
          await supabase
            .from('profiles')
            .update({ last_access: new Date().toISOString() })
            .eq('id', session.user.id);
            
        } catch (error) {
          console.error("Error fetching profile on init:", error);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email/password
  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signInWithCredentials = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      // Map our User type to Supabase profile columns
      const profileData: any = {};
      if (data.name) profileData.name = data.name;
      if (data.photoURL) profileData.photo_url = data.photoURL;
      if (data.level !== undefined) profileData.level = data.level;
      if (data.totalReflections !== undefined) profileData.total_reflections = data.totalReflections;
      if (data.chaptersRead !== undefined) profileData.chapters_read = data.chaptersRead;
      if (data.consecutiveDays !== undefined) profileData.consecutive_days = data.consecutiveDays;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      
    } catch (error) {
      console.error("Error signing out:", error);
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
