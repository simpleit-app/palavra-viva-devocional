
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
  const [isGenerating, setIsGenerating] = useState(false);
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
      
      // Only check and generate if not already generating and we have few verses
      if (!isGenerating && data && data.length < 20) {
        await checkAndGenerateVersesIfNeeded(data);
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

  const checkAndGenerateVersesIfNeeded = async (allVerses: BibleVerse[]) => {
    if (isGenerating) {
      console.log('Already generating verses, skipping...');
      return;
    }

    try {
      const totalVerses = allVerses.length;
      console.log(`Total verses in database: ${totalVerses}`);

      // Generate more verses if we have less than 20 total
      if (totalVerses < 20) {
        const versesToGenerate = 20 - totalVerses;
        console.log(`Need to generate ${versesToGenerate} verses for all users`);
        await generateMoreVerses(versesToGenerate);
        return;
      }

      // For Pro users, also check unread verses
      if (currentUser && isPro && totalVerses >= 20) {
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

        console.log(`Pro user has ${unreadVerses.length} unread verses out of ${totalVerses} total`);

        // If Pro user has less than 10 unread verses, generate more
        if (unreadVerses.length < 10) {
          console.log('Generating more verses for Pro user...');
          await generateMoreVerses(15);
        }
      }
    } catch (error) {
      console.error('Error checking verses:', error);
    }
  };

  const generateMoreVerses = async (count: number = 10) => {
    if (isGenerating) {
      console.log('Already generating verses, skipping duplicate request');
      return false;
    }

    setIsGenerating(true);
    
    try {
      console.log(`Starting generation of ${count} new verses...`);
      
      const { data, error } = await supabase.functions.invoke('generate-verse', {
        body: { count }
      });

      if (error) {
        console.error('Error generating verses:', error);
        toast({
          variant: "destructive",
          title: "Erro ao gerar versículos",
          description: "Não foi possível gerar novos versículos. Tente novamente.",
        });
        return false;
      }

      // Check if the response indicates a failure
      if (data?.success === false && data?.error) {
        console.error('Generation failed:', data.error);
        toast({
          variant: "destructive",
          title: "Erro na geração",
          description: "Não foi possível gerar versículos. Tente novamente mais tarde.",
        });
        return false;
      }

      if (data?.success && data?.verses?.length > 0) {
        console.log(`Successfully generated ${data.verses.length} verses`);
        
        toast({
          title: "Novos versículos gerados",
          description: `${data.verses.length} novos versículos foram adicionados!`,
        });

        // Refresh verses after successful generation
        setTimeout(() => {
          fetchVerses();
        }, 1000);
        
        return true;
      } else {
        console.log('Generation completed but no verses were returned');
        toast({
          variant: "destructive",
          title: "Falha na geração",
          description: "Não foi possível gerar versículos. Tente novamente.",
        });
        return false;
      }
    } catch (error) {
      console.error('Error in generateMoreVerses:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar versículos",
        description: "Erro inesperado ao gerar versículos. Tente novamente.",
      });
      return false;
    } finally {
      setIsGenerating(false);
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

  const forceGenerateVerses = async (count: number = 10) => {
    const success = await generateMoreVerses(count);
    return success;
  };

  useEffect(() => {
    fetchVerses();
  }, [currentUser]);

  return {
    verses,
    loading,
    isGenerating,
    fetchVerses,
    generateMoreVerses: forceGenerateVerses,
    getRandomVerse,
    getDailyVerse
  };
};
