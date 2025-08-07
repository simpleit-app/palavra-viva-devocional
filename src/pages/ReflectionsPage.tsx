import React, { useState, useEffect } from 'react';
import PageTitle from '@/components/PageTitle';
import { bibleVerses } from '@/data/bibleData';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Share2, BookOpen, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate } from 'react-router-dom';
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
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateUserLevel } from '@/utils/achievementUtils';
import { useBibleVerses } from '@/hooks/useBibleVerses';

const FREE_PLAN_REFLECTION_LIMIT = 2;

const ReflectionsPage: React.FC = () => {
  const { currentUser, updateProfile, isPro, isAuthenticated, loading } = useAuth();
  const { verses: dbVerses } = useBibleVerses();
  const [reflections, setReflections] = useState<UserReflection[]>([]);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reflectionToDelete, setReflectionToDelete] = useState<string | null>(null);
  const [reflectionsLoading, setReflectionsLoading] = useState(true);
  const navigate = useNavigate();

  // Use database verses for Pro users, fallback to static verses for free users
  const allVerses = isPro ? dbVerses : bibleVerses;

  // Load reflections when component mounts or when user changes
  useEffect(() => {
    console.log('🔵 ReflectionsPage useEffect triggered', { 
      currentUser: !!currentUser, 
      isAuthenticated, 
      loading,
      userId: currentUser?.id 
    });
    
    if (isAuthenticated && currentUser?.id && !loading) {
      loadReflections();
    } else if (!loading && !isAuthenticated) {
      console.log('🟡 User not authenticated, redirecting...');
      setReflectionsLoading(false);
    }
  }, [currentUser?.id, isAuthenticated, loading]);

  const loadReflections = async () => {
    if (!currentUser?.id) {
      console.log('🔴 No current user ID available');
      setReflectionsLoading(false);
      return;
    }
    
    setReflectionsLoading(true);
    console.log('🔵 Carregando reflexões para usuário:', currentUser.id);
    
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('🔴 Erro ao carregar reflexões:', error);
        throw error;
      }
      
      console.log('🟢 Reflexões carregadas do banco:', data?.length || 0, data);
      console.log('🟢 Versículos disponíveis:', allVerses.length, allVerses.map(v => ({ id: v.id, ref: `${v.book} ${v.chapter}:${v.verse}` })));
      
      const formattedReflections = data?.map(item => ({
        id: item.id,
        userId: item.user_id,
        verseId: item.verse_id,
        text: item.text,
        createdAt: new Date(item.created_at)
      })) || [];
      
      console.log('🟢 Reflexões formatadas:', formattedReflections.length, formattedReflections);
      
      // Check which verses are found/not found
      formattedReflections.forEach(reflection => {
        const verse = allVerses.find(v => v.id === reflection.verseId);
        if (!verse) {
          console.warn('🟡 Versículo não encontrado para reflexão:', reflection.verseId, reflection);
        } else {
          console.log('🟢 Versículo encontrado:', verse.id, `${verse.book} ${verse.chapter}:${verse.verse}`);
        }
      });
      
      setReflections(formattedReflections);
      
      // Update user stats if needed
      const currentStats = {
        totalReflections: formattedReflections.length,
        chaptersRead: currentUser.chaptersRead,
        consecutiveDays: currentUser.consecutiveDays
      };
      
      const calculatedLevel = calculateUserLevel(currentStats);
      
      if (currentUser.totalReflections !== formattedReflections.length || 
          currentUser.level !== calculatedLevel) {
        console.log('🔵 Atualizando estatísticas do usuário...');
        await updateProfile({
          totalReflections: formattedReflections.length,
          level: calculatedLevel
        });
      }
      
    } catch (error) {
      console.error("🔴 Error loading reflections:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar reflexões",
        description: "Não foi possível carregar suas reflexões. Tente novamente mais tarde.",
      });
    } finally {
      setReflectionsLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="container max-w-4xl py-6 px-4 md:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Você precisa estar logado para ver suas reflexões.</p>
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      // Get the verse_id before deleting the reflection
      const reflection = reflections.find(r => r.id === reflectionToDelete);
      if (!reflection) return;
      
      const verseId = reflection.verseId;
      
      console.log('🔵 Excluindo reflexão e removendo de read_verses:', reflectionToDelete, verseId);
      
      // First remove from read_verses to ensure the verse becomes unread
      const { error: readVerseError } = await supabase
        .from('read_verses')
        .delete()
        .eq('verse_id', verseId)
        .eq('user_id', currentUser.id);
        
      if (readVerseError && readVerseError.code !== 'PGRST116') {
        console.error('🔴 Error removing read verse:', readVerseError);
        throw readVerseError;
      }
      
      // Then delete the reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .delete()
        .eq('id', reflectionToDelete);
        
      if (reflectionError) throw reflectionError;
      
      // Update local state
      const updatedReflections = reflections.filter(
        reflection => reflection.id !== reflectionToDelete
      );
      
      setReflections(updatedReflections);
      setDeleteConfirmOpen(false);
      setReflectionToDelete(null);
      
      // Update user stats - recalculate level
      const { data: readVersesData } = await supabase
        .from('read_verses')
        .select('verse_id')
        .eq('user_id', currentUser.id);
      
      const currentReadCount = readVersesData?.length || 0;
      
      const currentStats = {
        totalReflections: updatedReflections.length,
        chaptersRead: currentReadCount,
        consecutiveDays: currentUser.consecutiveDays
      };
      
      const calculatedLevel = calculateUserLevel(currentStats);
      
      await updateProfile({
        totalReflections: updatedReflections.length,
        chaptersRead: currentReadCount,
        level: calculatedLevel
      });
      
      toast({
        title: "Reflexão removida",
        description: "Sua reflexão foi excluída com sucesso e o versículo marcado como não lido.",
      });
      
    } catch (error) {
      console.error("🔴 Error deleting reflection:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir sua reflexão. Tente novamente mais tarde.",
      });
    }
  };

  const handleShareReflection = (reflection: UserReflection) => {
    const verse = allVerses.find(v => v.id === reflection.verseId);
    
    if (!verse) {
      console.warn('🟡 Verse not found for sharing:', reflection.verseId);
      toast({
        variant: "destructive",
        title: "Erro ao compartilhar",
        description: "Não foi possível encontrar o versículo para compartilhar.",
      });
      return;
    }
    
    // Create elegant WhatsApp message format
    const shareText = `📖 *${verse.book} ${verse.chapter}:${verse.verse}*

"_${verse.text}_"

💭 *Minha reflexão:*
${reflection.text}

---
_Compartilhado pelo app Palavra Viva_
🔗 https://palavraviva.simpleit.app.br`;

    // Create WhatsApp URL with encoded text
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Compartilhamento aberto",
      description: "Sua reflexão foi formatada para o WhatsApp!",
    });
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

  const navigateToStudyWithVerse = (verseId: string) => {
    navigate('/study-route', { state: { scrollToVerse: verseId } });
  };

  const displayReflections = isPro 
    ? reflections 
    : reflections.slice(0, FREE_PLAN_REFLECTION_LIMIT);
    
  const hasReachedFreeLimit = !isPro && reflections.length > FREE_PLAN_REFLECTION_LIMIT;

  return (
    <div className="container max-w-4xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Minhas Reflexões"
        subtitle="Reveja e edite suas reflexões sobre os textos bíblicos."
      />

      {!isPro && (
        <Alert className="mb-6">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            Você está no plano gratuito com limite de {FREE_PLAN_REFLECTION_LIMIT} reflexões.
          </AlertDescription>
        </Alert>
      )}

      {hasReachedFreeLimit && (
        <div className="mb-6">
          <SubscriptionUpgrade />
        </div>
      )}

      {reflectionsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando suas reflexões...</p>
        </div>
      ) : displayReflections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Você ainda não tem reflexões salvas.
          </p>
          <Button asChild>
            <Link to="/study-route">Começar a Estudar</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 mt-6">
          {displayReflections.map(reflection => {
            const verse = allVerses.find(v => v.id === reflection.verseId);
            
            if (!verse) {
              console.warn('🟡 Verse not found for reflection display:', reflection.verseId, reflection);
              return (
                <Card key={reflection.id} className="opacity-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="text-red-500">
                        Versículo não encontrado (ID: {reflection.verseId})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {reflection.createdAt.toLocaleDateString('pt-BR')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-slate-700 dark:text-slate-200">
                      {reflection.text}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDeleteClick(reflection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
            
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
                      onClick={() => navigateToStudyWithVerse(reflection.verseId)}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Ver texto de estudo completo</span>
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
          
          {!isPro && reflections.length > FREE_PLAN_REFLECTION_LIMIT && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground mb-4">
                Você tem {reflections.length - FREE_PLAN_REFLECTION_LIMIT} reflexões adicionais que não estão visíveis.
                Atualize para o plano Pro para ter acesso a todas as suas reflexões.
              </p>
              <SubscriptionUpgrade variant="inline" />
            </div>
          )}
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
              Tem certeza que deseja excluir esta reflexão? Esta ação irá desmarcar o versículo como lido e não pode ser desfeita.
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
