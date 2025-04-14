import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageTitle from '@/components/PageTitle';
import UserAvatar from '@/components/UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { bibleVerses } from '@/data/bibleData';
import { Calendar, BookOpen, Edit3, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLevelTitle } from '@/utils/achievementUtils';
import { supabase } from '@/integrations/supabase/client';
import { UserReflection } from '@/data/bibleData';
import DailyVerse, { RandomVerseButton } from '@/components/DailyVerse';

const DashboardPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [userReflections, setUserReflections] = useState<UserReflection[]>([]);
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lastReflection, setLastReflection] = useState<UserReflection | null>(null);
  const [lastReflectionVerse, setLastReflectionVerse] = useState<any>(null);
  const [nextVerseToStudy, setNextVerseToStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Load read verses
      const { data: readVersesData, error: readVersesError } = await supabase
        .from('read_verses')
        .select('verse_id')
        .eq('user_id', currentUser.id);
        
      if (readVersesError) throw readVersesError;
      
      const verseIds = readVersesData.map(item => item.verse_id);
      setReadVerses(verseIds);
      
      // Calculate progress
      const totalVerses = bibleVerses.length;
      const completedVerses = verseIds.length;
      const calculatedProgress = Math.round((completedVerses / totalVerses) * 100);
      setProgressPercentage(calculatedProgress);
      
      // Load reflections
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (reflectionsError) throw reflectionsError;
      
      const formattedReflections = reflectionsData.map(item => ({
        id: item.id,
        userId: item.user_id,
        verseId: item.verse_id,
        text: item.text,
        createdAt: new Date(item.created_at)
      }));
      
      setUserReflections(formattedReflections);
      
      // Get latest reflection
      if (formattedReflections.length > 0) {
        const latestReflection = formattedReflections[0];
        setLastReflection(latestReflection);
        
        // Find verse data for latest reflection
        const verse = bibleVerses.find(
          (verse) => verse.id === latestReflection.verseId
        );
        setLastReflectionVerse(verse);
      }
      
      // Find next verse to study
      const nextVerse = bibleVerses.find(
        (verse) => !verseIds.includes(verse.id)
      );
      setNextVerseToStudy(nextVerse);
      
      // Update user stats if needed
      if (currentUser.chaptersRead !== verseIds.length || 
          currentUser.totalReflections !== formattedReflections.length) {
        
        await updateProfile({
          chaptersRead: verseIds.length,
          totalReflections: formattedReflections.length
        });
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container max-w-5xl py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <PageTitle 
            title={`Olá, ${currentUser.name.split(' ')[0]}!`}
            subtitle="Bem-vindo de volta à sua jornada bíblica."
          />
        </div>
        <UserAvatar user={currentUser} showLevel={true} size="lg" />
      </div>

      <DailyVerse />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Carregando seu progresso...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Sequência Atual</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{currentUser.consecutiveDays}</span>
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Continue estudando para aumentar sua sequência!</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Capítulos Lidos</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{currentUser.chaptersRead}</span>
                    <span className="text-sm text-muted-foreground">de {bibleVerses.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">{progressPercentage}% da jornada completada</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Seu Nível</h3>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{currentUser.level}</span>
                    <span className="text-sm text-muted-foreground">{getLevelTitle(currentUser.level)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.totalReflections} reflexões escritas até agora
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {lastReflection && lastReflectionVerse && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Última Reflexão</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {lastReflection.createdAt.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <h4 className="text-sm font-medium">
                      {lastReflectionVerse.book} {lastReflectionVerse.chapter}:{lastReflectionVerse.verse}
                    </h4>
                    <p className="text-xs italic text-muted-foreground mb-2">
                      "{lastReflectionVerse.text.length > 100 
                        ? lastReflectionVerse.text.substring(0, 100) + '...' 
                        : lastReflectionVerse.text}"
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {lastReflection.text.length > 150 
                      ? lastReflection.text.substring(0, 150) + '...' 
                      : lastReflection.text}
                  </p>
                  <div className="mt-4">
                    <Link to="/reflections">
                      <Button variant="outline" size="sm">Ver Todas as Reflexões</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {nextVerseToStudy && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Continue Sua Jornada</h3>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium">
                      Próximo estudo: {nextVerseToStudy.book} {nextVerseToStudy.chapter}:{nextVerseToStudy.verse}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Continue sua jornada de estudo bíblico.
                    </p>
                  </div>
                  <Link to="/study-route">
                    <Button className="w-full">Continuar Estudando</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/study-route">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                <span>Rota de Estudo</span>
              </Button>
            </Link>
            <Link to="/reflections">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                <Edit3 className="h-6 w-6" />
                <span>Minhas Reflexões</span>
              </Button>
            </Link>
            <Link to="/achievements">
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2">
                <Award className="h-6 w-6" />
                <span>Conquistas</span>
              </Button>
            </Link>
            <RandomVerseButton />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
