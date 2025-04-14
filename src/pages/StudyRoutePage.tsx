
import React, { useState } from 'react';
import PageTitle from '@/components/PageTitle';
import BibleVerseCard from '@/components/BibleVerseCard';
import { bibleVerses, userProgress, userReflections } from '@/data/bibleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const StudyRoutePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [readVerses, setReadVerses] = useState<string[]>(userProgress.chaptersRead);
  const [reflections, setReflections] = useState(userReflections);

  if (!currentUser) return null;

  const handleMarkAsRead = (verseId: string) => {
    if (readVerses.includes(verseId)) return;
    
    setReadVerses([...readVerses, verseId]);
    
    toast({
      title: "Versículo marcado como lido!",
      description: "Seu progresso foi atualizado.",
    });
  };

  const handleSaveReflection = (verseId: string, text: string) => {
    // Check if a reflection already exists for this verse
    const existingReflectionIndex = reflections.findIndex(
      (ref) => ref.verseId === verseId && ref.userId === currentUser.id
    );

    const newReflection = {
      id: existingReflectionIndex >= 0 ? reflections[existingReflectionIndex].id : Date.now().toString(),
      verseId,
      userId: currentUser.id,
      text,
      createdAt: new Date()
    };

    if (existingReflectionIndex >= 0) {
      // Update existing reflection
      const updatedReflections = [...reflections];
      updatedReflections[existingReflectionIndex] = newReflection;
      setReflections(updatedReflections);
    } else {
      // Add new reflection
      setReflections([...reflections, newReflection]);
    }

    toast({
      title: "Reflexão salva com sucesso!",
      description: "Sua reflexão foi armazenada.",
    });
  };

  return (
    <div className="container max-w-3xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Rota de Estudo Bíblico"
        subtitle="Siga seu caminho personalizado de aprendizado bíblico."
      />

      <div className="my-6">
        {bibleVerses.map((verse) => {
          const isRead = readVerses.includes(verse.id);
          const userReflection = reflections.find(
            (ref) => ref.verseId === verse.id && ref.userId === currentUser.id
          );

          return (
            <BibleVerseCard
              key={verse.id}
              verse={verse}
              isRead={isRead}
              userReflection={userReflection}
              onMarkAsRead={handleMarkAsRead}
              onSaveReflection={handleSaveReflection}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StudyRoutePage;
