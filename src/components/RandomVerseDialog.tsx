
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BibleVerseDisplay from './BibleVerseDisplay';

interface RandomVerseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  verse: any;
  isAiVerse: boolean;
}

const RandomVerseDialog: React.FC<RandomVerseDialogProps> = ({
  isOpen,
  onOpenChange,
  verse,
  isAiVerse
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
        
        {verse && (
          <div className="py-4">
            <BibleVerseDisplay verse={verse} showSummary />
            
            <div className="flex justify-end mt-4 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
              
              {!isAiVerse && (
                <Link
                  to="/study-route"
                  state={{ scrollToVerse: verse.id }}
                  onClick={() => onOpenChange(false)}
                >
                  <Button size="sm">Explorar este versículo</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RandomVerseDialog;
