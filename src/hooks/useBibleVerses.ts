
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  summary: string;
  verse_order: number;
  is_generated: boolean;
  created_at?: string;
}

export const useBibleVerses = () => {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser, isPro } = useAuth();

  const fetchVerses = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .order('verse_order', { ascending: true });

      if (error) {
        console.error('Error fetching verses:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os versículos.",
        });
        return;
      }

      setVerses(data || []);
      
      // Check if we need more verses for Pro users
      if (isPro && currentUser) {
        await checkAndGenerateVersesForProUser(data || []);
      }
    } catch (error) {
      console.error('Error in fetchVerses:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro inesperado ao carregar versículos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerateVersesForProUser = async (allVerses: BibleVerse[]) => {
    if (!currentUser || !isPro) return;

    try {
      // Get user's read verses
      const { data: readVerses, error: readError } = await supabase
        .from('read_verses')
        .select('verse_id')
        .eq('user_id', currentUser.id);

      if (readError) {
        console.error('Error fetching read verses:', readError);
        return;
      }

      const readVerseIds = readVerses?.map(rv => rv.verse_id) || [];
      const unreadVerses = allVerses.filter(verse => !readVerseIds.includes(verse.id));

      console.log(`Pro user has ${unreadVerses.length} unread verses`);

      // If Pro user has less than 5 unread verses, generate more
      if (unreadVerses.length < 5) {
        console.log('Generating more verses for Pro user...');
        await generateMoreVerses(10); // Generate 10 new verses
        
        toast({
          title: "Novos versículos disponíveis",
          description: "Geramos novos versículos especialmente para você continuar seus estudos!",
        });
      }
    } catch (error) {
      console.error('Error checking verses for Pro user:', error);
    }
  };

  const generateMoreVerses = async (count: number = 5) => {
    try {
      console.log(`Generating ${count} new verses...`);
      
      const { data, error } = await supabase.functions.invoke('generate-verse', {
        body: { count }
      });

      if (error) {
        console.error('Error generating verses:', error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar versículos",
          description: "Não foi possível gerar novos versículos. Tente novamente mais tarde.",
        });
        return;
      }

      if (data?.success) {
        console.log('Successfully generated verses:', data.verses);
        // Refresh the verses list
        await fetchVerses();
      }
    } catch (error) {
      console.error('Error in generateMoreVerses:', error);
    }
  };

  const getRandomVerse = (): BibleVerse | null => {
    if (verses.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  };

  const getDailyVerse = (): BibleVerse | null => {
    if (verses.length === 0) return null;
    
    // Use today's date as seed for consistent daily verse
    const today = new Date().toISOString().split('T')[0];
    const hashDate = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    const dateHash = hashDate(today);
    const verseIndex = dateHash % verses.length;
    return verses[verseIndex];
  };

  useEffect(() => {
    fetchVerses();
  }, [currentUser, isPro]);

  return {
    verses,
    loading,
    fetchVerses,
    generateMoreVerses,
    getRandomVerse,
    getDailyVerse
  };
};
