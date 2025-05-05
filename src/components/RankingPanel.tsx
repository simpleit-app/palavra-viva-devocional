
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from './UserAvatar';
import { Trophy } from 'lucide-react';

// Define proper interface for UserRanking to match the database view
export interface UserRanking {
  nickname: string;
  points: number;
  level: number;
  rank: number;
}

interface RankingPanelProps {
  variant?: 'default' | 'large';
  limit?: number;
}

const RankingPanel: React.FC<RankingPanelProps> = ({ 
  variant = 'default',
  limit = 10
}) => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Call a Supabase function to get the rankings
        const { data, error } = await supabase
          .rpc('fetch_user_rankings', { limit_count: limit });

        if (error) {
          console.error('Error fetching rankings:', error);
          return;
        }

        if (data) {
          setRankings(data as UserRanking[]);
        }
      } catch (error) {
        console.error('Error in rankings fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [limit]);

  const isLarge = variant === 'large';

  return (
    <Card className={isLarge ? 'h-full' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking Global
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((user, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold">
                    {user.rank}
                  </div>
                  <div>
                    <p className="font-medium">{user.nickname}</p>
                    <p className="text-xs text-muted-foreground">Nível {user.level}</p>
                  </div>
                </div>
                <div className="font-semibold">{user.points} pts</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingPanel;
