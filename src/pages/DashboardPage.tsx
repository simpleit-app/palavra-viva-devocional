
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

const DashboardPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [userReflections, setUserReflections] = useState<any[]>([]);
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [lastReflection, setLastReflection] = useState<any>(null);
  const [lastReflectionVerse, setLastReflectionVerse] = useState<any>(null);
  const [nextVerseToStudy, setNextVerseToStudy] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      // Carrega os dados do localStorage
      loadUserData();
      
      // Atualiza a sequência de dias (streak)
      updateUserStreak();
    }
  }, [currentUser]);

  const loadUserData = () => {
    if (!currentUser) return;
    
    // Carrega versículos lidos
    const savedReadVerses = localStorage.getItem(`palavraViva_readVerses_${currentUser.id}`);
    let loadedReadVerses: string[] = [];
    
    if (savedReadVerses) {
      try {
        loadedReadVerses = JSON.parse(savedReadVerses);
        setReadVerses(loadedReadVerses);
        
        // Atualiza no perfil do usuário caso necessário
        if (currentUser.chaptersRead !== loadedReadVerses.length) {
          updateProfile({
            chaptersRead: loadedReadVerses.length
          });
        }
      } catch (error) {
        console.error("Erro ao carregar versículos lidos:", error);
      }
    }
    
    // Carrega reflexões
    const savedReflections = localStorage.getItem('palavraViva_reflections');
    let loadedReflections: any[] = [];
    
    if (savedReflections) {
      try {
        const parsedReflections = JSON.parse(savedReflections);
        loadedReflections = parsedReflections.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        
        // Filtra apenas reflexões do usuário atual
        const userReflectionsFiltered = loadedReflections.filter(
          (ref) => ref.userId === currentUser.id
        );
        
        setUserReflections(userReflectionsFiltered);
        
        // Atualiza no perfil do usuário caso necessário
        if (currentUser.totalReflections !== userReflectionsFiltered.length) {
          updateProfile({
            totalReflections: userReflectionsFiltered.length
          });
        }
        
        // Encontra a última reflexão
        if (userReflectionsFiltered.length > 0) {
          const sortedReflections = userReflectionsFiltered.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
          
          const latestReflection = sortedReflections[0];
          setLastReflection(latestReflection);
          
          // Encontra o versículo da última reflexão
          const verse = bibleVerses.find(
            (verse) => verse.id === latestReflection.verseId
          );
          setLastReflectionVerse(verse);
        }
      } catch (error) {
        console.error("Erro ao carregar reflexões:", error);
      }
    }
    
    // Calcula progresso
    const totalVerses = bibleVerses.length;
    const completedVerses = loadedReadVerses.length;
    const calculatedProgress = Math.round((completedVerses / totalVerses) * 100);
    setProgressPercentage(calculatedProgress);
    
    // Encontra próximo versículo para estudar
    const nextVerse = bibleVerses.find(
      (verse) => !loadedReadVerses.includes(verse.id)
    );
    setNextVerseToStudy(nextVerse);
  };

  const updateUserStreak = () => {
    if (!currentUser) return;
    
    // Verifica a última data de acesso
    const lastAccessKey = `palavraViva_lastAccess_${currentUser.id}`;
    const today = new Date().toDateString();
    const lastAccess = localStorage.getItem(lastAccessKey);
    
    // Atualiza a sequência de dias
    if (lastAccess && lastAccess !== today) {
      const lastAccessDate = new Date(lastAccess);
      const todayDate = new Date(today);
      
      // Calcula a diferença em dias
      const diffTime = Math.abs(todayDate.getTime() - lastAccessDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Se a diferença for de 1 dia, incrementa a sequência
      if (diffDays === 1) {
        const newStreak = currentUser.consecutiveDays + 1;
        updateProfile({ consecutiveDays: newStreak });
      } 
      // Se for mais de 1 dia, reinicia a sequência
      else if (diffDays > 1) {
        updateProfile({ consecutiveDays: 1 });
      }
    } 
    // Se não houver último acesso, inicia a sequência
    else if (!lastAccess) {
      updateProfile({ consecutiveDays: 1 });
    }
    
    // Atualiza a data do último acesso para hoje
    localStorage.setItem(lastAccessKey, today);
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
        <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2" disabled>
          <Calendar className="h-6 w-6" />
          <span>Versículo Diário</span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
