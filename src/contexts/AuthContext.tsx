import React, { createContext, useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    const loadSession = async () => {
      try {
        setIsLoading(true);
        console.log('🔵 Carregando sessão inicial...');
        
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('🔵 Dados da sessão:', sessionData);
        
        if (!sessionData.session) {
          console.log('🟡 Nenhuma sessão encontrada');
          setIsLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        console.log('🔵 ID do usuário da sessão:', userId);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        console.log('🔵 Dados do perfil:', profileData);
        console.log('🔵 Erro do perfil:', profileError);

        if (profileError) throw profileError;

        // Get subscription status by calling check-subscription function
        console.log('🔵 Verificando status de assinatura...');
        const { data: subscriptionResponse, error: subscriptionError } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        });

        console.log('🔵 Resposta da verificação de assinatura:', subscriptionResponse);
        console.log('🔵 Erro da verificação de assinatura:', subscriptionError);

        // Handle subscription data
        const isSubscribed = subscriptionResponse?.subscribed || false;
        const subscriptionEnd = subscriptionResponse?.subscription_end || null;
        
        setIsPro(isSubscribed);
        console.log('🔵 Status Pro definido:', isSubscribed);
        
        if (profileData) {
          const user = {
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
          };
          
          console.log('🟢 Usuário carregado:', user);
          console.log('🟢 Status Pro final:', isSubscribed);
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("🔴 Erro ao carregar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Mudança no estado de autenticação:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🟢 Usuário logado, carregando perfil...');
        
        // Wait a moment for the trigger to create the profile
        setTimeout(async () => {
          try {
            console.log('🔵 Buscando perfil após login...');
            
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            console.log('🔵 Perfil encontrado:', profileData);
            console.log('🔵 Erro ao buscar perfil:', profileError);
            
            if (profileError) {
              console.error('🔴 Perfil não encontrado, trigger pode ter falhado:', profileError);
              return;
            }

            if (profileData) {
              console.log('🟢 Perfil carregado após signup/login:', profileData);
              
              // Check subscription status
              console.log('🔵 Verificando assinatura após login...');
              const { data: subscriptionResponse, error: subscriptionError } = await supabase.functions.invoke('check-subscription', {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });

              console.log('🔵 Resposta da assinatura após login:', subscriptionResponse);
              
              const isSubscribed = subscriptionResponse?.subscribed || false;
              const subscriptionEnd = subscriptionResponse?.subscription_end || null;
              
              setIsPro(isSubscribed);
              console.log('🔵 Status Pro após login:', isSubscribed);
              
              const user = {
                id: session.user.id,
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
              };
              
              console.log('🟢 Definindo usuário atual:', user);
              setCurrentUser(user);
            }
          } catch (error) {
            console.error('🔴 Erro ao carregar perfil após signup/login:', error);
          }
        }, 2000);
      } else if (event === 'SIGNED_OUT') {
        console.log('🟡 Usuário deslogado');
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
      console.log('🔵 Tentativa de login para:', email);
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('🔴 Erro no login:', error);
        throw error;
      }
      
      console.log('🟢 Login realizado com sucesso');
    } catch (error: any) {
      console.error("🔴 Erro ao fazer login:", error);
      throw new Error(error.message || "Erro ao fazer login.");
    }
  };

  // Alias for signIn for backward compatibility
  const signInWithCredentials = signIn;

  const signUp = async (name: string, email: string, password: string, gender: string = 'male') => {
    try {
      console.log('🔵 Iniciando processo de signup para:', email);
      console.log('🔵 Dados do usuário:', { name, email, gender });
      
      // First, create the user account
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
      
      if (error) {
        console.error('🔴 Erro no signup:', error);
        throw error;
      }

      console.log('🟢 Signup realizado com sucesso:', data);
      console.log('🔵 Usuário criado:', data.user?.id);
      console.log('🔵 Sessão criada:', data.session ? 'SIM' : 'NÃO');
      
      if (data.user) {
        console.log('🔵 Usuário criado, aguardando trigger criar perfil...');
        
        // Se não há sessão, significa que precisa confirmar email
        if (!data.session) {
          console.log('🟡 Email de confirmação necessário');
          throw new Error('Por favor, confirme seu email antes de continuar. Verifique sua caixa de entrada.');
        }
      }
      
    } catch (error: any) {
      console.error("🔴 Erro ao criar conta:", error);
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
      
      console.log('🔵 Atualizando status de assinatura...');
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) return;
      
      const { data: subscriptionResponse, error: subscriptionError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      console.log('🔵 Resposta da atualização de assinatura:', subscriptionResponse);

      if (subscriptionError) {
        console.error("Error refreshing subscription:", subscriptionError);
        return;
      }

      const isSubscribed = subscriptionResponse?.subscribed || false;
      const subscriptionEnd = subscriptionResponse?.subscription_end || null;
      
      setIsPro(isSubscribed);
      console.log('🔵 Status Pro atualizado:', isSubscribed);
      
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
