
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface UserRanking {
  id: string;
  name: string;
  photo_url: string;
  points: number;
  level: number;
  rank: number;
}

interface RankingPanelProps {
  limit?: number;
}

const RankingPanel: React.FC<RankingPanelProps> = ({ limit = 10 }) => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from edge function
        const { data, error } = await supabase.functions.invoke('fetch_user_rankings', {
          body: { limit_count: limit }
        });
        
        if (error) {
          console.error('Error fetching rankings:', error);
          // Use mock data as fallback when the function fails
          setRankings(getMockRankings(limit));
          return;
        }
        
        if (data && Array.isArray(data)) {
          setRankings(data);
        } else {
          // Fallback to mock data if the data structure is not as expected
          console.error('Unexpected data format for rankings:', data);
          setRankings(getMockRankings(limit));
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
        // Use mock data as fallback
        setRankings(getMockRankings(limit));
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [limit]);

  // Generate mock data for when the API call fails
  const getMockRankings = (count: number): UserRanking[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${i}`,
      name: `Usuário ${i + 1}`,
      photo_url: '',
      points: 1000 - (i * 50),
      level: Math.max(1, Math.floor((1000 - (i * 50)) / 100)),
      rank: i + 1
    }));
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-700';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Ranking de usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {loading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: limit }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {rankings.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-4">
                  <span className={`font-bold text-lg w-6 text-center ${getRankColor(user.rank)}`}>
                    {user.rank}
                  </span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photo_url || ''} alt={user.name} />
                    <AvatarFallback>
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.points} pontos • Nível {user.level}
                    </p>
                  </div>
                </div>
              ))}
              {rankings.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RankingPanel;
