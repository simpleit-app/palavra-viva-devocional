
import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import BibleVerseCard from '@/components/BibleVerseCard';
import { bibleVerses } from '@/data/bibleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const StudyRoutePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);

  // Carrega as reflexões e versículos lidos do localStorage ao iniciar
  useEffect(() => {
    if (currentUser) {
      // Carrega versículos lidos
      const savedReadVerses = localStorage.getItem(`palavraViva_readVerses_${currentUser.id}`);
      
      if (savedReadVerses) {
        try {
          const parsedReadVerses = JSON.parse(savedReadVerses);
          setReadVerses(parsedReadVerses);
          
          // Atualiza as estatísticas do usuário se necessário
          if (currentUser.chaptersRead !== parsedReadVerses.length) {
            updateProfile({
              chaptersRead: parsedReadVerses.length
            });
          }
        } catch (error) {
          console.error("Erro ao carregar versículos lidos:", error);
        }
      }
      
      // Carrega reflexões
      const savedReflections = localStorage.getItem('palavraViva_reflections');
      
      if (savedReflections) {
        try {
          const parsedReflections = JSON.parse(savedReflections);
          const formattedReflections = parsedReflections.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }));
          
          setReflections(formattedReflections);
          
          // Conta quantas reflexões o usuário atual tem
          const userReflectionsCount = formattedReflections.filter(
            (ref: any) => ref.userId === currentUser.id
          ).length;
          
          // Atualiza as estatísticas do usuário se necessário
          if (currentUser.totalReflections !== userReflectionsCount) {
            updateProfile({
              totalReflections: userReflectionsCount
            });
          }
        } catch (error) {
          console.error("Erro ao carregar reflexões:", error);
        }
      }
      
      // Atualiza a data do último acesso
      const today = new Date().toDateString();
      localStorage.setItem(`palavraViva_lastAccess_${currentUser.id}`, today);
    }
  }, [currentUser, updateProfile]);

  if (!currentUser) return null;

  const handleMarkAsRead = (verseId: string) => {
    if (readVerses.includes(verseId)) return;
    
    const updatedReadVerses = [...readVerses, verseId];
    setReadVerses(updatedReadVerses);
    
    // Persiste os versículos lidos no localStorage
    localStorage.setItem(`palavraViva_readVerses_${currentUser.id}`, JSON.stringify(updatedReadVerses));
    
    // Atualiza as estatísticas do usuário
    updateUserStats(updatedReadVerses);
    
    toast({
      title: "Versículo marcado como lido!",
      description: "Seu progresso foi atualizado.",
    });
  };

  const updateUserStats = (verses: string[]) => {
    if (!currentUser) return;
    
    // Atualiza as estatísticas do usuário (chaptersRead)
    updateProfile({
      chaptersRead: verses.length
    }).catch(error => {
      console.error("Erro ao atualizar estatísticas:", error);
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

    let updatedReflections;
    if (existingReflectionIndex >= 0) {
      // Update existing reflection
      updatedReflections = [...reflections];
      updatedReflections[existingReflectionIndex] = newReflection;
    } else {
      // Add new reflection
      updatedReflections = [...reflections, newReflection];
    }
    
    setReflections(updatedReflections);
    
    // Persiste as reflexões no localStorage
    saveReflectionsToLocalStorage(updatedReflections);
    
    // Atualiza as estatísticas do usuário
    updateUserReflectionStats(updatedReflections);

    toast({
      title: "Reflexão salva com sucesso!",
      description: "Sua reflexão foi armazenada.",
    });
  };

  const saveReflectionsToLocalStorage = (updatedReflections: typeof reflections) => {
    try {
      localStorage.setItem('palavraViva_reflections', JSON.stringify(updatedReflections));
    } catch (error) {
      console.error("Erro ao salvar reflexões:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua reflexão.",
      });
    }
  };

  const updateUserReflectionStats = (updatedReflections: typeof reflections) => {
    if (!currentUser) return;
    
    // Conta quantas reflexões o usuário atual tem
    const userReflectionsCount = updatedReflections.filter(
      ref => ref.userId === currentUser.id
    ).length;
    
    // Atualiza as estatísticas do usuário
    updateProfile({
      totalReflections: userReflectionsCount
    }).catch(error => {
      console.error("Erro ao atualizar estatísticas:", error);
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
