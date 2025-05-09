
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
        setLoading(true);
        
        // Call the Supabase Edge Function directly
        const response = await fetch(
          `https://mcoeiucylazrjvhaemmc.supabase.co/functions/v1/fetch_user_rankings`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({ limit_count: limit })
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch rankings');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setRankings(data as UserRanking[]);
        } else {
          console.error('Unexpected response format:', data);
          setRankings([]);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
        setRankings([]);
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
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-1 h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
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
