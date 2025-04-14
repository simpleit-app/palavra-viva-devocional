
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Award } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { Achievement } from '@/data/bibleData';
import { calculateProgress } from '@/utils/achievementUtils';
import * as LucideIcons from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  userStats: {
    totalReflections: number;
    chaptersRead: number;
    consecutiveDays: number;
  };
  unlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userStats,
  unlocked
}) => {
  const progress = calculateProgress(achievement, userStats);
  
  // Convert icon name to component
  const getIconComponent = (iconName: string) => {
    // Handle common icon naming variations
    const formattedName = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    // Look up the icon in Lucide icons
    const IconComponent = (LucideIcons as Record<string, React.FC<any>>)[formattedName] || Award;
    return IconComponent;
  };
  
  const IconComponent = getIconComponent(achievement.icon);
  
  return (
    <Card className={`achievement-card border ${unlocked ? 'border-gold-400' : 'border-slate-200 dark:border-slate-700'}`}>
      <CardHeader className="pb-2 flex flex-row items-center space-x-4 p-4">
        <div className={`rounded-full p-2 ${
          unlocked 
            ? 'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300' 
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{achievement.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{achievement.description}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <ProgressBar 
          value={unlocked ? achievement.requiredCount : calculateProgress(achievement, userStats) * achievement.requiredCount / 100} 
          max={achievement.requiredCount}
          size="sm"
          colorClass={unlocked ? 'bg-gold-500' : 'bg-primary'}
          showValue={true}
        />
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
