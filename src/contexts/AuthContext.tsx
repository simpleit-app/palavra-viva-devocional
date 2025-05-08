
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isPro: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (name: string, email: string, password: string, gender: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  updateProfile: (fields: Partial<UserProfile>) => Promise<void>;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  subscribed?: boolean;
  subscriptionEnd?: string;
  subscriptionTier?: string;
  consecutiveDays: number;
  chaptersRead: number;
  totalReflections: number;
  level: number;
  points: number;
  nickname?: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        const userData = await fetchUserProfile(session.user);
        setCurrentUser(userData);
        checkSubscription(userData);
      } else {
        setCurrentUser(null);
        setIsPro(false);
      }
      
      setLoading(false);
    });
    
    // Initial session check
    fetchInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        const userData = await fetchUserProfile(session.user);
        setCurrentUser(userData);
        checkSubscription(userData);
      }
    } catch (error) {
      console.error("Error fetching initial session:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (subscriptionError) throw subscriptionError;
      
      return {
        id: user.id,
        email: user.email || profileData.email,
        name: profileData.name || user.user_metadata?.name || 'Usuário',
        photoUrl: profileData.photo_url,
        consecutiveDays: profileData.consecutive_days || 0,
        chaptersRead: profileData.chapters_read || 0,
        totalReflections: profileData.total_reflections || 0,
        level: profileData.level || 1,
        points: profileData.points || 0,
        nickname: profileData.nickname,
        gender: profileData.gender,
        subscribed: subscriptionData?.subscribed || false,
        subscriptionEnd: subscriptionData?.subscription_end,
        subscriptionTier: subscriptionData?.subscription_tier,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Return minimal user profile
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Usuário',
        consecutiveDays: 0,
        chaptersRead: 0,
        totalReflections: 0,
        level: 1,
        points: 0,
      };
    }
  };

  const checkSubscription = async (user: UserProfile) => {
    try {
      setIsPro(false); // Reset while checking
      
      if (user.subscribed && user.subscriptionEnd) {
        const subscriptionEndDate = new Date(user.subscriptionEnd);
        const isActive = subscriptionEndDate > new Date();
        setIsPro(isActive);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsPro(false);
    }
  };

  const refreshSubscription = async () => {
    if (!currentUser) return;
    
    try {
      const { data: subscriptionData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (subscriptionData) {
        const updatedUser = {
          ...currentUser,
          subscribed: subscriptionData.subscribed,
          subscriptionEnd: subscriptionData.subscription_end,
          subscriptionTier: subscriptionData.subscription_tier,
        };
        
        setCurrentUser(updatedUser);
        checkSubscription(updatedUser);
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  const updateProfile = async (fields: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      // Only update fields that can be updated in the profile table
      const profileFields: any = {};
      
      // Map UserProfile fields to database field names
      if (fields.name !== undefined) profileFields.name = fields.name;
      if (fields.photoUrl !== undefined) profileFields.photo_url = fields.photoUrl;
      if (fields.consecutiveDays !== undefined) profileFields.consecutive_days = fields.consecutiveDays;
      if (fields.chaptersRead !== undefined) profileFields.chapters_read = fields.chaptersRead;
      if (fields.totalReflections !== undefined) profileFields.total_reflections = fields.totalReflections;
      if (fields.level !== undefined) profileFields.level = fields.level;
      if (fields.points !== undefined) profileFields.points = fields.points;
      if (fields.nickname !== undefined) profileFields.nickname = fields.nickname;
      if (fields.gender !== undefined) profileFields.gender = fields.gender;
      
      // Only update if there are fields to update
      if (Object.keys(profileFields).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileFields)
          .eq('id', currentUser.id);
          
        if (error) throw error;
        
        // Update local state
        setCurrentUser({
          ...currentUser,
          ...fields,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signUp = async (name: string, email: string, password: string, gender: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            gender: gender,
          },
        },
      });
      
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsPro(false);
      window.location.href = '/'; // Use window.location instead of navigate
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      loading,
      isPro,
      signIn,
      signUp,
      signOut,
      refreshSubscription,
      updateProfile,
    }}>
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
