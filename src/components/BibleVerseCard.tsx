
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, BookOpen } from "lucide-react";
import { BibleVerse, UserReflection } from '@/data/bibleData';

interface BibleVerseCardProps {
  verse: BibleVerse;
  isRead: boolean;
  userReflection?: UserReflection;
  onMarkAsRead: (verseId: string) => void;
  onSaveReflection: (verseId: string, text: string) => void;
}

const BibleVerseCard: React.FC<BibleVerseCardProps> = ({
  verse,
  isRead,
  userReflection,
  onMarkAsRead,
  onSaveReflection
}) => {
  const [reflection, setReflection] = React.useState(userReflection?.text || '');

  const handleSaveReflection = () => {
    if (reflection.trim()) {
      onSaveReflection(verse.id, reflection);
    }
  };

  return (
    <Card className="w-full mb-6 bible-card overflow-hidden border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{verse.book} {verse.chapter}:{verse.verse}</span>
          {isRead && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              <Check className="mr-1 h-3 w-3" />
              Lido
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="verse-text mb-4 text-slate-800 dark:text-slate-100">{verse.text}</p>
        <div className="mt-4 p-3 bg-celestial-50 dark:bg-slate-800 rounded-md">
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Devocional
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">{verse.summary}</p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Minha Reflexão
          </h4>
          <Textarea
            placeholder="Escreva sua reflexão aqui..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          className={isRead ? "text-green-600 border-green-200" : ""}
          disabled={isRead}
          onClick={() => onMarkAsRead(verse.id)}
        >
          <Check className="mr-1 h-4 w-4" />
          {isRead ? "Lido" : "Marcar como Lido"}
        </Button>
        <Button onClick={handleSaveReflection} disabled={!reflection.trim()}>
          Salvar Reflexão
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BibleVerseCard;
