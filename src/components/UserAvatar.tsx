
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showNickname?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  showLevel = false,
  showNickname = false,
  className = '' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-20 w-20';
      case 'md':
      default: return 'h-12 w-12';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Avatar className={`${getSize()} border-2 border-primary/10`}>
                <AvatarImage src={user.photoURL} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              {showLevel && (
                <Badge variant="secondary" className="absolute -bottom-2 -right-2 px-1.5 py-0.5 text-xs">
                  {`N${user.level}`}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{user.name}</p>
            <p className="text-xs text-muted-foreground">Nickname: {user.nickname}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showNickname && (
        <div className="mt-2 text-center">
          <p className="font-medium text-sm">{user.nickname}</p>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
