
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  summary: string;
  is_generated: boolean;
}

interface BibleVerseDisplayProps {
  verse: BibleVerse;
  showSummary?: boolean;
  className?: string;
}

const BibleVerseDisplay: React.FC<BibleVerseDisplayProps> = ({ 
  verse, 
  showSummary = false,
  className = ""
}) => {
  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          {verse.is_generated && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Gerado por IA
            </Badge>
          )}
        </div>
        
        <p className="text-sm italic mb-2 text-slate-700 dark:text-slate-300">
          "{verse.text}"
        </p>
        
        <p className="text-xs text-right text-slate-600 dark:text-slate-400 font-medium">
          {verse.book} {verse.chapter}:{verse.verse}
        </p>
        
        {showSummary && verse.summary && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {verse.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BibleVerseDisplay;
