import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import BibleVerseCard from '@/components/BibleVerseCard';
import { bibleVerses } from '@/data/bibleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserReflection } from '@/data/bibleData';

const StudyRoutePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
      updateUserStreak();
    }
  }, [currentUser]);

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
      
      if (currentUser.chaptersRead !== verseIds.length || 
          currentUser.totalReflections !== formattedReflections.length) {
        await updateProfile({
          chaptersRead: verseIds.length,
          totalReflections: formattedReflections.length
        });
      }
      
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
      
      if (lastAccess.getTime() === yesterday.getTime()) {
        newStreak += 1;
        await updateProfile({ consecutiveDays: newStreak });
      } 
      else if (lastAccess.getTime() < yesterday.getTime()) {
        newStreak = 1;
        await updateProfile({ consecutiveDays: newStreak });
      }
      
      await supabase
        .from('profiles')
        .update({ last_access: today.toISOString() })
        .eq('id', currentUser.id);
      
    } catch (error) {
      console.error("Error updating user streak:", error);
    }
  };

  const handleMarkAsRead = async (verseId: string) => {
    if (!currentUser) return;
    if (readVerses.includes(verseId)) return;
    
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
    
    try {
      const existingReflection = reflections.find(
        (ref) => ref.verseId === verseId && ref.userId === currentUser.id
      );
      
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

  if (!currentUser) return null;

  return (
    <div className="container max-w-3xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Rota de Estudo Bíblico"
        subtitle="Siga seu caminho personalizado de aprendizado bíblico."
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando seu progresso...</p>
        </div>
      ) : (
        <div className="my-6">
          {bibleVerses.map((verse) => {
            const isRead = readVerses.includes(verse.id);
            const userReflection = reflections.find(
              (ref) => ref.verseId === verse.id && ref.userId === currentUser.id
            );

            return (
              <BibleVerseCard
                key={verse.id}
                verse={verse}
                isRead={isRead}
                userReflection={userReflection}
                onMarkAsRead={handleMarkAsRead}
                onSaveReflection={handleSaveReflection}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyRoutePage;
