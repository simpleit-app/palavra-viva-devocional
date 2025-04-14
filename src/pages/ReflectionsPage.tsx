
import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import { bibleVerses } from '@/data/bibleData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Share2, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserReflection } from '@/data/bibleData';
import { supabase } from '@/integrations/supabase/client';

const ReflectionsPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reflectionToDelete, setReflectionToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadReflections();
    }
  }, [currentUser]);

  const loadReflections = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      const formattedReflections = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        verseId: item.verse_id,
        text: item.text,
        createdAt: new Date(item.created_at)
      }));
      
      setReflections(formattedReflections);
      
      // Update user stats if needed
      if (currentUser.totalReflections !== formattedReflections.length) {
        await updateProfile({
          totalReflections: formattedReflections.length
        });
      }
      
    } catch (error) {
      console.error("Error loading reflections:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar reflexões",
        description: "Não foi possível carregar suas reflexões. Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const handleEditStart = (reflection: UserReflection) => {
    setEditingReflection(reflection.id);
    setEditText(reflection.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    
    try {
      const { error } = await supabase
        .from('reflections')
        .update({
          text: editText,
          created_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedReflections = reflections.map(reflection => 
        reflection.id === id 
          ? { ...reflection, text: editText, createdAt: new Date() } 
          : reflection
      );
      
      setReflections(updatedReflections);
      setEditingReflection(null);
      
      toast({
        title: "Reflexão atualizada!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
    } catch (error) {
      console.error("Error updating reflection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar sua reflexão. Tente novamente mais tarde.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReflection(null);
  };

  const handleDeleteClick = (id: string) => {
    setReflectionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reflectionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('reflections')
        .delete()
        .eq('id', reflectionToDelete);
        
      if (error) throw error;
      
      // Update local state
      const updatedReflections = reflections.filter(
        reflection => reflection.id !== reflectionToDelete
      );
      
      setReflections(updatedReflections);
      setDeleteConfirmOpen(false);
      setReflectionToDelete(null);
      
      // Update user stats
      await updateProfile({
        totalReflections: updatedReflections.length
      });
      
      toast({
        title: "Reflexão removida",
        description: "Sua reflexão foi excluída com sucesso.",
      });
      
    } catch (error) {
      console.error("Error deleting reflection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir sua reflexão. Tente novamente mais tarde.",
      });
    }
  };

  const handleShareReflection = (reflection: UserReflection) => {
    const verse = bibleVerses.find(v => v.id === reflection.verseId);
    
    if (!verse) return;
    
    const shareText = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}\n\nMinha reflexão: ${reflection.text}\n\nCompartilhado via Palavra Viva`;
    
    if (navigator.share) {
      navigator.share({
        title: `Reflexão sobre ${verse.book} ${verse.chapter}:${verse.verse}`,
        text: shareText,
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado para a área de transferência",
        description: "Você pode colar o texto em qualquer aplicativo.",
      });
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
      });
    });
  };

  const sortedReflections = [...reflections]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="container max-w-4xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Minhas Reflexões"
        subtitle="Reveja e edite suas reflexões sobre os textos bíblicos."
      />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando suas reflexões...</p>
        </div>
      ) : sortedReflections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Você ainda não tem reflexões salvas.
          </p>
          <Button asChild>
            <a href="/study-route">Começar a Estudar</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 mt-6">
          {sortedReflections.map(reflection => {
            const verse = bibleVerses.find(v => v.id === reflection.verseId);
            if (!verse) return null;
            
            return (
              <Card key={reflection.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>
                      {verse.book} {verse.chapter}:{verse.verse}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {reflection.createdAt.toLocaleDateString('pt-BR')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="verse-text text-sm italic mb-4 text-slate-600 dark:text-slate-300">
                    "{verse.text}"
                  </p>
                  
                  {editingReflection === reflection.id ? (
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[100px] mb-4"
                    />
                  ) : (
                    <p className="text-slate-700 dark:text-slate-200">
                      {reflection.text}
                    </p>
                  )}

                  <div className="mt-4">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary flex items-center gap-1"
                      asChild
                    >
                      <Link to={`/study-route`} state={{ scrollToVerse: reflection.verseId }}>
                        <BookOpen className="h-4 w-4" />
                        <span>Ver texto de estudo completo</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {editingReflection === reflection.id ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => handleSaveEdit(reflection.id)}
                        disabled={!editText.trim()}
                      >
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleShareReflection(reflection)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditStart(reflection)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDeleteClick(reflection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog 
        open={deleteConfirmOpen} 
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reflexão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReflectionsPage;
