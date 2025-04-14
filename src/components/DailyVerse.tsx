
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { bibleVerses } from '@/data/bibleData';

const DailyVerse: React.FC = () => {
  const [verse, setVerse] = useState<any>(null);

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

  if (!verse) return null;

  return (
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
      </CardContent>
    </Card>
  );
};

export default DailyVerse;
