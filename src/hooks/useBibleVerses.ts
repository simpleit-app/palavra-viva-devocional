
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      
      // Check if we need more verses (less than 10 available)
      if ((data?.length || 0) < 10) {
        await generateMoreVerses();
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

  const generateMoreVerses = async () => {
    try {
      console.log('Generating more verses...');
      
      const { data, error } = await supabase.functions.invoke('generate-verse', {
        body: { count: 5 }
      });

      if (error) {
        console.error('Error generating verses:', error);
        return;
      }

      if (data?.success) {
        console.log('Successfully generated verses:', data.verses);
        // Refresh the verses list
        await fetchVerses();
        
        toast({
          title: "Novos versículos gerados",
          description: `${data.verses?.length || 5} novos versículos foram criados com IA.`,
        });
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
  }, []);

  return {
    verses,
    loading,
    fetchVerses,
    generateMoreVerses,
    getRandomVerse,
    getDailyVerse
  };
};
