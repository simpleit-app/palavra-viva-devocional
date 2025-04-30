
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/contexts/AuthContext';
import { getLevelTitle } from '@/utils/achievementUtils';

interface UserAvatarProps {
  user: User;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  overrideUrl?: string | null;
  className?: string;
  fallback?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  showLevel = false,
  size = 'md',
  overrideUrl = null,
  className = '',
  fallback
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const initials = fallback || user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} ${className}`}>
          <AvatarImage src={overrideUrl || user.photoURL} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        {showLevel && (
          <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
            {user.level}
          </div>
        )}
      </div>
      
      {showLevel && (
        <div className="mt-2 text-xs text-center">
          <span className="text-slate-500 dark:text-slate-400">Nível {user.level}</span>
          <p className="font-medium text-slate-700 dark:text-slate-300">{getLevelTitle(user.level)}</p>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
