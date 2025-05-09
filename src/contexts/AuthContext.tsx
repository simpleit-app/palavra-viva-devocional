
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  level: number;
  totalReflections: number;
  chaptersRead: number;
  consecutiveDays: number;
  points: number;
  nickname: string | null;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  isPro: boolean;
  isLoading: boolean;
  currentUser: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Omit<UserProfile, 'id' | 'email'>>) => Promise<void>;
  accessCustomerPortal: () => Promise<string>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (session?.user) {
        setIsAuthenticated(true);
        // Defer fetching user profile with setTimeout to avoid Supabase auth hooks deadlock
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        setIsAuthenticated(true);
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verify subscription status whenever auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
        return;
      }

      setCurrentUser({
        id: data.id,
        name: data.name,
        email: data.email,
        photoURL: data.photo_url,
        level: data.level,
        totalReflections: data.total_reflections,
        chaptersRead: data.chapters_read,
        consecutiveDays: data.consecutive_days,
        points: data.points,
        nickname: data.nickname
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }
      
      setIsPro(response?.subscribed || false);
      
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // In case of error, assume user is not Pro
      setIsPro(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: error.message,
        });
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso",
        description: "Sua conta foi criada com sucesso. Seja bem-vindo!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to landing page instead of login
      navigate('/');
      
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<Omit<UserProfile, 'id' | 'email'>>) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', currentUser.id);

      if (error) throw error;

      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const accessCustomerPortal = async (): Promise<string> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error('No portal URL returned');
      }
      
      return data.url;
      
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPro,
        isLoading,
        currentUser,
        signIn,
        signUp,
        signOut,
        updateProfile,
        accessCustomerPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
