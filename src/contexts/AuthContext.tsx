
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  currentUser: {
    id: string;
    name: string;
    email: string;
    photoUrl: string;
    level: number;
    totalReflections: number;
    chaptersRead: number;
    consecutiveDays: number;
    points: number;
    nickname?: string;
    gender?: string;
    subscriptionEnd?: Date;
    createdAt?: Date;
  } | null;
  isPro: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithCredentials: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, gender?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<{
    name: string;
    photoUrl: string;
    totalReflections: number;
    chaptersRead: number;
    consecutiveDays: number;
    gender: string;
    nickname: string;
  }>) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthContextType['currentUser']>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          setIsLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;

        // Get subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_end')
          .eq('user_id', userId)
          .single();

        // Handle case with no subscription record
        const isSubscribed = subscriptionData?.subscribed || false;
        const subscriptionEnd = subscriptionData?.subscription_end || null;
        
        // Check if subscription is valid
        const isSubscriptionValid = isSubscribed && subscriptionEnd && new Date(subscriptionEnd) > new Date();
        
        setIsPro(isSubscriptionValid);
        
        if (profileData) {
          setCurrentUser({
            id: userId,
            name: profileData.name,
            email: profileData.email,
            photoUrl: profileData.photo_url,
            level: profileData.level,
            totalReflections: profileData.total_reflections,
            chaptersRead: profileData.chapters_read,
            consecutiveDays: profileData.consecutive_days,
            points: profileData.points,
            nickname: profileData.nickname,
            gender: profileData.gender,
            subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : undefined,
            createdAt: profileData.created_at ? new Date(profileData.created_at) : undefined
          });
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadSession();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsPro(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in:", error);
      throw new Error(error.message || "Erro ao fazer login.");
    }
  };

  // Alias for signIn for backward compatibility
  const signInWithCredentials = signIn;

  const signUp = async (name: string, email: string, password: string, gender: string = 'male') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            photo_url: '',
            level: 1,
            total_reflections: 0,
            chapters_read: 0,
            consecutive_days: 0,
            points: 0,
            gender
          }
        }
      });
      if (error) throw error;

      // Create a user profile in the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user?.id,
          name: name,
          email: email,
          photo_url: '',
          level: 1,
          total_reflections: 0,
          chapters_read: 0,
          consecutive_days: 0,
          points: 0,
          gender
        });

      if (profileError) throw profileError;
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw new Error(error.message || "Erro ao criar a conta.");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing out:", error);
      throw new Error(error.message || "Erro ao sair da conta.");
    }
  };

  const updateProfile = async (data: Partial<{
    name: string;
    photoUrl: string;
    totalReflections: number;
    chaptersRead: number;
    consecutiveDays: number;
    gender: string;
    nickname: string;
  }>) => {
    if (!currentUser) throw new Error("Usuário não autenticado.");

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          photo_url: data.photoUrl,
          total_reflections: data.totalReflections,
          chapters_read: data.chaptersRead,
          consecutive_days: data.consecutiveDays,
          gender: data.gender,
          nickname: data.nickname
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Refresh user data after updating profile
      await refreshUser();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw new Error(error.message || "Erro ao atualizar o perfil.");
    }
  };

  // Add refreshSubscription function
  const refreshSubscription = async () => {
    try {
      if (!currentUser) return;
      
      // Get subscription status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_end')
        .eq('user_id', currentUser.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error("Error fetching subscription:", subscriptionError);
        return;
      }

      // Handle case with no subscription record
      const isSubscribed = subscriptionData?.subscribed || false;
      const subscriptionEnd = subscriptionData?.subscription_end || null;
      
      // Check if subscription is valid
      const isSubscriptionValid = isSubscribed && subscriptionEnd && new Date(subscriptionEnd) > new Date();
      
      setIsPro(isSubscriptionValid);
      
      if (currentUser && subscriptionEnd) {
        setCurrentUser({
          ...currentUser,
          subscriptionEnd: new Date(subscriptionEnd)
        });
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  // Add refreshUser function
  const refreshUser = async () => {
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) return;
      
      const userId = sessionData.session.user.id;
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;

      // Get subscription status
      await refreshSubscription();
      
      if (profileData) {
        setCurrentUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            id: userId,
            name: profileData.name,
            email: profileData.email,
            photoUrl: profileData.photo_url,
            level: profileData.level,
            totalReflections: profileData.total_reflections,
            chaptersRead: profileData.chapters_read,
            consecutiveDays: profileData.consecutive_days,
            points: profileData.points,
            nickname: profileData.nickname,
            gender: profileData.gender,
            createdAt: profileData.created_at ? new Date(profileData.created_at) : undefined
          };
        });
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value = {
    currentUser,
    isPro,
    isAuthenticated: !!currentUser,
    loading: isLoading,
    signIn,
    signInWithCredentials,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    refreshSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Carregando...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
