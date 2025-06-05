import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useBibleVerses } from '@/hooks/useBibleVerses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BibleVerseDisplay from './BibleVerseDisplay';
import RandomVerseButton from './RandomVerseButton';
import RandomVerseDialog from './RandomVerseDialog';
import AiVerseGenerator from './AiVerseGenerator';

const DailyVerse: React.FC = () => {
  const [randomVerse, setRandomVerse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getDailyVerse, getRandomVerse, loading } = useBibleVerses();
  const { toast } = useToast();

  const dailyVerse = getDailyVerse();

  const handleGetRandomVerse = () => {
    const verse = getRandomVerse();
    if (verse) {
      setRandomVerse(verse);
      setIsDialogOpen(true);
      
      toast({
        title: "Versículo Aleatório",
        description: "Um novo versículo foi selecionado para você!",
      });
    }
  };

  if (loading || !dailyVerse) {
    return (
      <Card className="mb-6 border shadow-sm bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Versículo do Dia</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Carregando versículo do dia...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6 border shadow-sm bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Versículo do Dia</h3>
          </div>
          <p className="text-sm italic mb-2 text-slate-700 dark:text-slate-300">"{dailyVerse.text}"</p>
          <p className="text-xs text-right text-slate-600 dark:text-slate-400 font-medium">
            {dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-xs"
            onClick={handleGetRandomVerse}
          >
            Gerar versículo aleatório
          </Button>
        </CardContent>
      </Card>

      <RandomVerseDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        verse={randomVerse}
        isAiVerse={false}
      />
    </>
  );
};

// Enhanced RandomVerseButton component with AI verse generation
export const RandomVerseButtonWithAI: React.FC = () => {
  const [randomVerse, setRandomVerse] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAiVerse, setIsAiVerse] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { verses, getRandomVerse: getRandomVerseFromHook } = useBibleVerses();
  const { generateAiVerse } = AiVerseGenerator({
    onVerseGenerated: (verse) => {
      setRandomVerse(verse);
      setIsAiVerse(true);
      setIsOpen(true);
    }
  });

  const getRandomVerse = async () => {
    // Check if user has read all available verses
    if (currentUser) {
      const { data: readVersesData } = await supabase
        .from('read_verses')
        .select('verse_id')
        .eq('user_id', currentUser.id);
      
      const readVerseIds = readVersesData?.map(item => item.verse_id) || [];
      
      // If all verses are read, generate one with AI
      if (readVerseIds.length >= verses.length) {
        generateAiVerse();
        return;
      }
    }

    // Otherwise pick a random verse
    const verse = getRandomVerseFromHook();
    if (verse) {
      setRandomVerse(verse);
      setIsAiVerse(false);
      setIsOpen(true);
      
      toast({
        title: "Versículo Aleatório",
        description: "Um novo versículo foi gerado para você!",
      });
    }
  };

  return (
    <>
      <RandomVerseButton onClick={getRandomVerse} />
      <RandomVerseDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        verse={randomVerse}
        isAiVerse={isAiVerse}
      />
    </>
  );
};

export default DailyVerse;
