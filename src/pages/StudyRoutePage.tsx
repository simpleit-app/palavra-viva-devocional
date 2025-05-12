
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PageTitle from '@/components/PageTitle';
import BibleVerseCard, { BibleVerse as BibleVerseCardType } from '@/components/BibleVerseCard';
import { bibleVerses } from '@/data/bibleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserReflection } from '@/data/bibleData';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Define a type for the location state
interface LocationState {
  scrollToVerse?: string;
}

// Constants
const FREE_PLAN_VERSE_LIMIT = 2;

// Map Bible Data verses to BibleVerseCard compatible format
const mapToBibleVerseCardType = (verse: typeof bibleVerses[0]): BibleVerseCardType => {
  return {
    id: verse.id,
    title: verse.book + " " + verse.chapter + ":" + verse.verse,
    subtitle: verse.summary,
    text: verse.text,
    book: verse.book,
    chapter: verse.chapter,
    verses: verse.verse.toString(),
    source: "Bible"
  };
};

const StudyRoutePage: React.FC = () => {
  const { currentUser, updateProfile, isPro } = useAuth();
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('unread');
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
      
      // Update profile only if needed to avoid cascade updates
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
      
      // Update only if consecutive_days changed
      if (needsUpdate) {
        await updateProfile({ consecutiveDays: newStreak });
      }
      
      // Update last_access only if it's a different day
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
      // First, check if there's a reflection for this verse (now required)
      const userReflection = reflections.find(
        (ref) => ref.verseId === verseId && ref.userId === currentUser.id
      );
      
      if (!userReflection) {
        toast({
          variant: "destructive",
          title: "Reflexão necessária",
          description: "Adicione uma reflexão antes de marcar o versículo como lido.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('read_verses')
        .insert({
          user_id: currentUser.id,
          verse_id: verseId
        });
        
      if (error) throw error;
      
      const updatedReadVerses = [...readVerses, verseId];
      setReadVerses(updatedReadVerses);
      
      const pointsUpdate = {
        chaptersRead: updatedReadVerses.length
      };
      
      await updateProfile(pointsUpdate);
      
      // Switch to read tab when a verse is marked as read
      setActiveTab('read');
      
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

  const handleDeleteReflection = async (reflectionId: string, verseId: string) => {
    if (!currentUser) return;
    
    try {
      // Delete the reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .delete()
        .eq('id', reflectionId)
        .eq('user_id', currentUser.id);
        
      if (reflectionError) throw reflectionError;
      
      // Remove the verse from read verses
      const { error: readVerseError } = await supabase
        .from('read_verses')
        .delete()
        .eq('verse_id', verseId)
        .eq('user_id', currentUser.id);
        
      if (readVerseError) throw readVerseError;
      
      // Update local state
      const updatedReflections = reflections.filter(ref => ref.id !== reflectionId);
      setReflections(updatedReflections);
      
      const updatedReadVerses = readVerses.filter(v => v !== verseId);
      setReadVerses(updatedReadVerses);
      
      // Update profile statistics
      await updateProfile({
        chaptersRead: updatedReadVerses.length,
        totalReflections: updatedReflections.length
      });
      
      // Switch to unread tab since verse is now unread
      setActiveTab('unread');
      
      toast({
        title: "Reflexão excluída",
        description: "A reflexão foi removida e o versículo marcado como não lido.",
      });
      
    } catch (error) {
      console.error("Error deleting reflection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir a reflexão.",
      });
    }
  };

  // Filter verses based on read status
  const availableVerses = isPro ? bibleVerses : bibleVerses.slice(0, FREE_PLAN_VERSE_LIMIT);
  
  // Separate verses into read and unread
  const readVersesData = availableVerses.filter(verse => readVerses.includes(verse.id));
  const unreadVersesData = availableVerses.filter(verse => !readVerses.includes(verse.id));

  const hasReachedFreeLimit = !isPro && readVerses.length >= FREE_PLAN_VERSE_LIMIT;
  
  // Handle refresh of data
  const handleRefreshData = () => {
    setDataLoaded(false);
    toast({
      title: "Atualizando dados",
      description: "Carregando informações mais recentes...",
    });
  };

  if (!currentUser) return null;

  return (
    <div className="container max-w-3xl py-6 px-4 md:px-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Rota de Estudo Bíblico"
          subtitle="Siga seu caminho personalizado de aprendizado bíblico."
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefreshData}
          title="Atualizar dados"
          disabled={loading}
        >
          <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="my-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread" className="flex gap-2">
              Não Lidos <span className="bg-background text-primary px-2 rounded-full text-xs">{unreadVersesData.length}</span>
            </TabsTrigger>
            <TabsTrigger value="read" className="flex gap-2">
              Lidos <span className="bg-background text-primary px-2 rounded-full text-xs">{readVersesData.length}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="mt-6 space-y-6">
            {unreadVersesData.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground mb-4">Parabéns! Você leu todos os versículos disponíveis.</p>
                <Button variant="outline" onClick={() => setActiveTab('read')}>
                  Ver versículos lidos
                </Button>
              </div>
            ) : (
              unreadVersesData.map((verse) => {
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
                      verse={mapToBibleVerseCardType(verse)}
                      isRead={false}
                      userReflection={userReflection}
                      onMarkAsRead={handleMarkAsRead}
                      onSaveReflection={handleSaveReflection}
                      onDeleteReflection={handleDeleteReflection}
                      highlight={scrollToVerseId === verse.id}
                    />
                  </div>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="read" className="mt-6 space-y-6">
            {readVersesData.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">Você ainda não leu nenhum versículo.</p>
              </div>
            ) : (
              readVersesData.map((verse) => {
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
                      verse={mapToBibleVerseCardType(verse)}
                      isRead={true}
                      userReflection={userReflection}
                      onMarkAsRead={handleMarkAsRead}
                      onSaveReflection={handleSaveReflection}
                      onDeleteReflection={handleDeleteReflection}
                      highlight={scrollToVerseId === verse.id}
                    />
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}

      {!isPro && bibleVerses.length > FREE_PLAN_VERSE_LIMIT && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Atualize para o plano Pro para acessar {bibleVerses.length - FREE_PLAN_VERSE_LIMIT} textos adicionais.
          </p>
          <SubscriptionUpgrade variant="inline" />
        </div>
      )}
    </div>
  );
};

export default StudyRoutePage;
