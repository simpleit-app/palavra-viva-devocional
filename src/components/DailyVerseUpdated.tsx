
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useBibleVerses } from '@/hooks/useBibleVerses';
import BibleVerseDisplay from './BibleVerseDisplay';

const DailyVerseUpdated: React.FC = () => {
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
          
          <BibleVerseDisplay verse={dailyVerse} />
          
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

export default DailyVerseUpdated;
