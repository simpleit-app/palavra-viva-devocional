import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useBibleVerses } from '@/hooks/useBibleVerses';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BibleVerseDisplay from './BibleVerseDisplay';

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

      {/* Dialog for random verse */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Versículo Aleatório</DialogTitle>
            <DialogDescription>
              Um versículo escolhido especialmente para você.
            </DialogDescription>
          </DialogHeader>
          
          {randomVerse && (
            <div className="py-4">
              <BibleVerseDisplay verse={randomVerse} showSummary />
              
              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
                
                <Link
                  to="/study-route"
                  state={{ scrollToVerse: randomVerse.id }}
                  onClick={() => setIsDialogOpen(false)}
                >
                  <Button size="sm">Explorar este versículo</Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Separate component for the button that opens the random verse popup
export const RandomVerseButton: React.FC = () => {
  const [randomVerse, setRandomVerse] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAiVerse, setIsAiVerse] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { verses, getRandomVerse: getRandomVerseFromHook } = useBibleVerses();

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

  const generateAiVerse = async () => {
    try {
      setIsAiVerse(true);
      toast({
        title: "Gerando versículo...",
        description: "Estamos criando um novo versículo para você com IA.",
      });

      // Create a randomly generated verse in the same format as our Bible verses
      const bookNames = ["Provérbios", "Salmos", "Eclesiastes", "Isaías", "Mateus", "João", "Romanos"];
      const randomBook = bookNames[Math.floor(Math.random() * bookNames.length)];
      const randomChapter = Math.floor(Math.random() * 150) + 1;
      const randomVerseNum = Math.floor(Math.random() * 30) + 1;
      
      // These would normally come from an AI, but we're simulating for now
      const inspirationalTexts = [
        "O amor verdadeiro é paciente e bondoso. Não se vangloria, não se orgulha, não maltrata, não procura seus interesses.",
        "Todo aquele que busca a sabedoria com sinceridade encontrará o caminho da luz e da verdade eterna.",
        "Confie no caminho que o Senhor traça para você, mesmo quando não consegue ver onde ele leva.",
        "A palavra gentil é como mel para a alma, traz cura para o espírito e paz para o coração conturbado.",
        "Aquele que semeia bondade colherá amizades; aquele que compartilha sabedoria multiplica conhecimento."
      ];
      
      const randomText = inspirationalTexts[Math.floor(Math.random() * inspirationalTexts.length)];
      
      const aiGeneratedVerse = {
        id: "ai-" + Date.now(),
        book: randomBook,
        chapter: randomChapter,
        verse: randomVerseNum,
        text: randomText,
        summary: "Este versículo foi gerado especialmente para sua reflexão de hoje.",
        verse_order: -1,
        is_generated: true
      };
      
      setRandomVerse(aiGeneratedVerse);
      setIsOpen(true);
      
      toast({
        title: "Versículo Gerado com IA",
        description: "Um versículo inspirador foi criado para sua reflexão.",
      });
    } catch (error) {
      console.error("Erro ao gerar versículo:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível gerar um novo versículo. Tente novamente mais tarde.",
      });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full h-auto py-6 flex flex-col gap-2"
        onClick={getRandomVerse}
      >
        <RefreshCw className="h-6 w-6" />
        <span>Versículo Diário</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAiVerse ? "Versículo Inspirador (IA)" : "Versículo Aleatório"}
            </DialogTitle>
            <DialogDescription>
              {isAiVerse 
                ? "Um versículo gerado com IA para sua reflexão."
                : "Um versículo escolhido especialmente para você."}
            </DialogDescription>
          </DialogHeader>
          
          {randomVerse && (
            <div className="py-4">
              <BibleVerseDisplay verse={randomVerse} showSummary />
              
              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Fechar
                </Button>
                
                {!isAiVerse && (
                  <Link
                    to="/study-route"
                    state={{ scrollToVerse: randomVerse.id }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button size="sm">Explorar este versículo</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyVerse;
