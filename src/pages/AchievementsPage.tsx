
import React from 'react';
import PageTitle from '@/components/PageTitle';
import AchievementCard from '@/components/AchievementCard';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { achievements } from '@/data/bibleData';
import { getLevelTitle, calculateUnlockedAchievements } from '@/utils/achievementUtils';
import ProgressBar from '@/components/ProgressBar';
import UserAvatar from '@/components/UserAvatar';

const AchievementsPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const userStats = {
    totalReflections: currentUser.totalReflections,
    chaptersRead: currentUser.chaptersRead,
    consecutiveDays: currentUser.consecutiveDays
  };

  const unlockedAchievements = calculateUnlockedAchievements(achievements, userStats);
  
  // Calculate points for next level
  const currentLevelPoints = (currentUser.level - 1) * 10;
  const nextLevelPoints = currentUser.level * 10;
  const currentPoints = currentUser.chaptersRead + currentUser.totalReflections * 2;
  const pointsForNextLevel = nextLevelPoints - currentPoints;

  return (
    <div className="container max-w-4xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Conquistas"
        subtitle="Acompanhe seu progresso e desbloqueie medalhas especiais."
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <UserAvatar user={currentUser} showLevel={true} size="lg" />
            
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-2">
                Nível {currentUser.level}: {getLevelTitle(currentUser.level)}
              </h3>
              
              <ProgressBar 
                value={currentPoints - currentLevelPoints} 
                max={10} 
                label="Progresso para o próximo nível" 
                showValue={false}
                size="md"
              />
              
              <div className="flex justify-between mt-2 text-sm">
                <span>Nível {currentUser.level}</span>
                <span>
                  {pointsForNextLevel > 0 
                    ? `${pointsForNextLevel} pontos para o Nível ${currentUser.level + 1}` 
                    : `Pronto para o Nível ${currentUser.level + 1}!`
                  }
                </span>
              </div>
              
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground">
                  Seu progresso até agora:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex justify-between">
                    <span>Capítulos lidos:</span> 
                    <span className="font-medium">{currentUser.chaptersRead} (+{currentUser.chaptersRead} pontos)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Reflexões escritas:</span> 
                    <span className="font-medium">{currentUser.totalReflections} (+{currentUser.totalReflections * 2} pontos)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Dias consecutivos:</span> 
                    <span className="font-medium">{currentUser.consecutiveDays}</span>
                  </li>
                  <li className="flex justify-between font-medium pt-1">
                    <span>Total de pontos:</span> 
                    <span>{currentPoints}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-lg font-medium mb-4">Minhas Medalhas</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {achievements.map(achievement => (
          <AchievementCard 
            key={achievement.id}
            achievement={achievement}
            userStats={userStats}
            unlocked={unlockedAchievements.some(a => a.id === achievement.id)}
          />
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Continue sua jornada de estudo bíblico para desbloquear mais conquistas!</p>
      </div>
    </div>
  );
};

export default AchievementsPage;
