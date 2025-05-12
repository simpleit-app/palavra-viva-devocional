
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, RefreshCw } from 'lucide-react';
import { bibleVerses } from '@/data/bibleData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const DailyVerse: React.FC = () => {
  const [verse, setVerse] = useState<any>(null);
  const [randomVerse, setRandomVerse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format to use as a seed
    const today = new Date().toISOString().split('T')[0];
    
    // Simple hash function to convert date string into a number
    const hashDate = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    // Use the hash of today's date to consistently pick a verse
    const dateHash = hashDate(today);
    const verseIndex = dateHash % bibleVerses.length;
    
    setVerse(bibleVerses[verseIndex]);
  }, []);

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * bibleVerses.length);
    setRandomVerse(bibleVerses[randomIndex]);
    setIsDialogOpen(true);
    
    toast({
      title: "Versículo Aleatório",
      description: "Um novo versículo foi gerado para você!",
    });
  };

  if (!verse) return null;

  return (
    <>
      <Card className="mb-6 border shadow-sm bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Versículo do Dia</h3>
          </div>
          <p className="text-sm italic mb-2 text-slate-700 dark:text-slate-300">"{verse.text}"</p>
          <p className="text-xs text-right text-slate-600 dark:text-slate-400 font-medium">
            {verse.book} {verse.chapter}:{verse.verse}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-xs"
            onClick={getRandomVerse}
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
              <p className="text-md italic mb-4 text-slate-700 dark:text-slate-300">"{randomVerse.text}"</p>
              <p className="text-sm text-right text-slate-600 dark:text-slate-400 font-medium">
                {randomVerse.book} {randomVerse.chapter}:{randomVerse.verse}
              </p>
              {randomVerse.summary && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{randomVerse.summary}</p>
                </div>
              )}
              
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
  const { toast } = useToast();

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * bibleVerses.length);
    setRandomVerse(bibleVerses[randomIndex]);
    setIsOpen(true);
    
    toast({
      title: "Versículo Aleatório",
      description: "Um novo versículo foi gerado para você!",
    });
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
            <DialogTitle>Versículo Aleatório</DialogTitle>
            <DialogDescription>
              Um versículo escolhido especialmente para você.
            </DialogDescription>
          </DialogHeader>
          
          {randomVerse && (
            <div className="py-4">
              <p className="text-md italic mb-4 text-slate-700 dark:text-slate-300">"{randomVerse.text}"</p>
              <p className="text-sm text-right text-slate-600 dark:text-slate-400 font-medium">
                {randomVerse.book} {randomVerse.chapter}:{randomVerse.verse}
              </p>
              {randomVerse.summary && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{randomVerse.summary}</p>
                </div>
              )}
              
              <div className="flex justify-end mt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Fechar
                </Button>
                
                <Link
                  to="/study-route"
                  state={{ scrollToVerse: randomVerse.id }}
                  onClick={() => setIsOpen(false)}
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

export default DailyVerse;
