
import { Achievement } from "@/data/bibleData";

type UserStats = {
  totalReflections: number;
  chaptersRead: number;
  consecutiveDays: number;
};

export const calculateUnlockedAchievements = (
  achievements: Achievement[],
  userStats: UserStats
): Achievement[] => {
  return achievements.filter((achievement) => {
    switch (achievement.type) {
      case "reading":
        return userStats.chaptersRead >= achievement.requiredCount;
      case "reflection":
        return userStats.totalReflections >= achievement.requiredCount;
      case "streak":
        return userStats.consecutiveDays >= achievement.requiredCount;
      default:
        return false;
    }
  });
};

export const calculateProgress = (
  achievement: Achievement,
  userStats: UserStats
): number => {
  let current = 0;

  switch (achievement.type) {
    case "reading":
      current = userStats.chaptersRead;
      break;
    case "reflection":
      current = userStats.totalReflections;
      break;
    case "streak":
      current = userStats.consecutiveDays;
      break;
  }

  const progress = Math.min(100, (current / achievement.requiredCount) * 100);
  return Math.floor(progress);
};

export const calculateUserLevel = (userStats: UserStats): number => {
  // Simple level calculation based on chapters read and reflections
  // 1 point per chapter read, 2 points per reflection
  const points = userStats.chaptersRead + userStats.totalReflections * 2;
  return Math.floor(points / 10) + 1; // Level 1 starts at 0 points
};

export const getLevelTitle = (level: number): string => {
  const titles = [
    "Iniciante",    // Level 1
    "Estudioso",    // Level 2
    "Semeador",     // Level 3
    "Dedicado",     // Level 4
    "Discípulo",    // Level 5
    "Mestre",       // Level 6
    "Sábio",        // Level 7
    "Apóstolo"      // Level 8+
  ];

  if (level <= 0) return titles[0];
  if (level > titles.length) return titles[titles.length - 1];
  return titles[level - 1];
};
