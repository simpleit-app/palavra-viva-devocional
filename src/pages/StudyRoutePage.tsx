
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PageTitle from '@/components/PageTitle';
import BibleVerseCard from '@/components/BibleVerseCard';
import { bibleVerses } from '@/data/bibleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserReflection } from '@/data/bibleData';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// Define a type for the location state
interface LocationState {
  scrollToVerse?: string;
}

// Constants
const FREE_PLAN_VERSE_LIMIT = 2;

const StudyRoutePage: React.FC = () => {
  const { currentUser, updateProfile, isPro } = useAuth();
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const location = useLocation();
  const hasTriggeredRefresh = useRef(false);

  // Extract scrollToVerse from location state
  const locationState = location.state as LocationState;
  const scrollToVerseId = locationState?.scrollToVerse;

  useEffect(() => {
    if (currentUser && !dataLoaded) {
      loadUserData();
      updateUserStreak();
    }
  }, [currentUser, dataLoaded]);

  // Handle scrolling to a specific verse when it's specified in the location state
  useEffect(() => {
    if (scrollToVerseId && verseRefs.current[scrollToVerseId] && !loading) {
      setTimeout(() => {
        verseRefs.current[scrollToVerseId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [scrollToVerseId, loading]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const { data: readVersesData, error: readVersesError } = await supabase
        .from('read_verses')
        .select('verse_id')
        .eq('user_id', currentUser.id);
        
      if (readVersesError) {
        throw readVersesError;
      }
      
      const verseIds = readVersesData.map(item => item.verse_id);
      setReadVerses(verseIds);
      
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (reflectionsError) {
        throw reflectionsError;
      }
      
      const formattedReflections = reflectionsData.map(item => ({
        id: item.id,
        userId: item.user_id,
        verseId: item.verse_id,
        text: item.text,
        createdAt: new Date(item.created_at)
      }));
      
      setReflections(formattedReflections);
      
      // Só atualiza o perfil se realmente precisa para evitar atualizações em cascata
      if (currentUser.chaptersRead !== verseIds.length || 
          currentUser.totalReflections !== formattedReflections.length) {
        await updateProfile({
          chaptersRead: verseIds.length,
          totalReflections: formattedReflections.length
        });
      }
      
      setDataLoaded(true);
      
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados. Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStreak = async () => {
    if (!currentUser) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('last_access, consecutive_days')
        .eq('id', currentUser.id)
        .single();
        
      if (profileError) throw profileError;
      
      const lastAccess = new Date(profileData.last_access);
      const today = new Date();
      
      lastAccess.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      let newStreak = profileData.consecutive_days;
      let needsUpdate = false;
      
      if (lastAccess.getTime() === yesterday.getTime()) {
        newStreak += 1;
        needsUpdate = true;
      } 
      else if (lastAccess.getTime() < yesterday.getTime()) {
        newStreak = 1;
        needsUpdate = true;
      }
      
      // Só atualiza se realmente houver mudança no consecutive_days
      if (needsUpdate) {
        await updateProfile({ consecutiveDays: newStreak });
      }
      
      // Atualiza o last_access apenas se for um dia diferente
      if (lastAccess.getTime() !== today.getTime()) {
        await supabase
          .from('profiles')
          .update({ last_access: today.toISOString() })
          .eq('id', currentUser.id);
      }
      
    } catch (error) {
      console.error("Error updating user streak:", error);
    }
  };

  // Restante do código do componente permanece igual...
  const handleMarkAsRead = async (verseId: string) => {
    if (!currentUser) return;
    if (readVerses.includes(verseId)) return;
    
    // Check if user has reached the free plan limit
    if (!isPro && readVerses.length >= FREE_PLAN_VERSE_LIMIT) {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: "Você atingiu o limite de textos do plano gratuito. Atualize para o plano Pro para continuar.",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('read_verses')
        .insert({
          user_id: currentUser.id,
          verse_id: verseId
        });
        
      if (error) throw error;
      
      const updatedReadVerses = [...readVerses, verseId];
      setReadVerses(updatedReadVerses);
      
      await updateProfile({
        chaptersRead: updatedReadVerses.length
      });
      
      toast({
        title: "Versículo marcado como lido!",
        description: "Seu progresso foi atualizado.",
      });
      
    } catch (error) {
      console.error("Error marking verse as read:", error);
      toast({
        variant: "destructive",
        title: "Erro ao marcar como lido",
        description: "Não foi possível atualizar seu progresso. Tente novamente mais tarde.",
      });
    }
  };

  const handleSaveReflection = async (verseId: string, text: string) => {
    if (!currentUser) return;
    
    // Check if user has reached the free plan limit for reflections
    const existingReflection = reflections.find(
      (ref) => ref.verseId === verseId && ref.userId === currentUser.id
    );
    
    if (!existingReflection && !isPro && reflections.length >= FREE_PLAN_VERSE_LIMIT) {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: "Você atingiu o limite de reflexões do plano gratuito. Atualize para o plano Pro para continuar.",
      });
      return;
    }
    
    try {
      if (existingReflection) {
        const { error } = await supabase
          .from('reflections')
          .update({
            text,
            created_at: new Date().toISOString()
          })
          .eq('id', existingReflection.id);
          
        if (error) throw error;
        
        const updatedReflections = reflections.map(ref => 
          ref.id === existingReflection.id 
            ? { ...ref, text, createdAt: new Date() } 
            : ref
        );
        
        setReflections(updatedReflections);
        
      } else {
        const { data, error } = await supabase
          .from('reflections')
          .insert({
            user_id: currentUser.id,
            verse_id: verseId,
            text
          })
          .select()
          .single();
          
        if (error) throw error;
        
        const newReflection = {
          id: data.id,
          userId: data.user_id,
          verseId: data.verse_id,
          text: data.text,
          createdAt: new Date(data.created_at)
        };
        
        const updatedReflections = [...reflections, newReflection];
        setReflections(updatedReflections);
        
        await updateProfile({
          totalReflections: updatedReflections.length
        });
      }
      
      toast({
        title: "Reflexão salva com sucesso!",
        description: "Sua reflexão foi armazenada.",
      });
      
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua reflexão.",
      });
    }
  };

  // Filter verses for free tier users
  const displayVerses = isPro 
    ? bibleVerses 
    : bibleVerses.slice(0, FREE_PLAN_VERSE_LIMIT);

  const hasReachedFreeLimit = !isPro && readVerses.length >= FREE_PLAN_VERSE_LIMIT;

  if (!currentUser) return null;

  return (
    <div className="container max-w-3xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Rota de Estudo Bíblico"
        subtitle="Siga seu caminho personalizado de aprendizado bíblico."
      />

      {!isPro && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Você está no plano gratuito com limite de {FREE_PLAN_VERSE_LIMIT} textos e {FREE_PLAN_VERSE_LIMIT} reflexões.
          </AlertDescription>
        </Alert>
      )}

      {hasReachedFreeLimit && (
        <div className="mb-6">
          <SubscriptionUpgrade />
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando seu progresso...</p>
        </div>
      ) : (
        <div className="my-6">
          {displayVerses.map((verse) => {
            const isRead = readVerses.includes(verse.id);
            const userReflection = reflections.find(
              (ref) => ref.verseId === verse.id && ref.userId === currentUser.id
            );

            return (
              <div 
                key={verse.id}
                ref={el => verseRefs.current[verse.id] = el}
                className={scrollToVerseId === verse.id ? "scroll-mt-20" : ""}
              >
                <BibleVerseCard
                  verse={verse}
                  isRead={isRead}
                  userReflection={userReflection}
                  onMarkAsRead={handleMarkAsRead}
                  onSaveReflection={handleSaveReflection}
                  highlight={scrollToVerseId === verse.id}
                />
              </div>
            );
          })}
          
          {!isPro && bibleVerses.length > FREE_PLAN_VERSE_LIMIT && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Atualize para o plano Pro para acessar {bibleVerses.length - FREE_PLAN_VERSE_LIMIT} textos adicionais.
              </p>
              <SubscriptionUpgrade variant="inline" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyRoutePage;
