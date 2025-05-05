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
  subscriptionTier: string;
  subscriptionEnd: Date | null;
  nickname: string;
  points: number;
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
  refreshSubscription: () => Promise<void>;
  isPro: boolean;
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
  refreshSubscription: async () => {},
  isPro: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Helper function to convert Supabase user data to our User type
const formatUser = (user: SupabaseUser | null, profileData: any, subscriptionData: any): User | null => {
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
    subscriptionTier: subscriptionData?.subscription_tier || 'free',
    subscriptionEnd: subscriptionData?.subscription_end ? new Date(subscriptionData.subscription_end) : null,
    nickname: profileData.nickname || 'Anônimo',
    points: profileData.points || 0,
  };
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

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
              
              // Fetch subscription data
              const token = session.access_token;
              const subscriptionResponse = await supabase.functions.invoke('check-subscription', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (subscriptionResponse.error) {
                console.error("Error checking subscription:", subscriptionResponse.error);
              }
              
              const subscriptionData = subscriptionResponse.data;
              const user = formatUser(session.user, data, subscriptionData);
              setCurrentUser(user);
              setIsPro(subscriptionData?.subscription_tier === 'pro');
              
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
          setIsPro(false);
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
          
          // Fetch subscription data
          const token = session.access_token;
          const subscriptionResponse = await supabase.functions.invoke('check-subscription', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (subscriptionResponse.error) {
            console.error("Error checking subscription:", subscriptionResponse.error);
          }
          
          const subscriptionData = subscriptionResponse.data;
          const user = formatUser(session.user, data, subscriptionData);
          setCurrentUser(user);
          setIsPro(subscriptionData?.subscription_tier === 'pro');
          
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

  // Refresh subscription status
  const refreshSubscription = async () => {
    if (!session || !currentUser) return;
    
    try {
      const token = session.access_token;
      const subscriptionResponse = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (subscriptionResponse.error) {
        console.error("Error refreshing subscription:", subscriptionResponse.error);
        return;
      }
      
      const subscriptionData = subscriptionResponse.data;
      
      setCurrentUser(prev => prev ? {
        ...prev,
        subscriptionTier: subscriptionData?.subscription_tier || 'free',
        subscriptionEnd: subscriptionData?.subscription_end ? new Date(subscriptionData.subscription_end) : null,
      } : null);
      
      setIsPro(subscriptionData?.subscription_tier === 'pro');
      
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

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
    updateProfile,
    refreshSubscription,
    isPro
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
