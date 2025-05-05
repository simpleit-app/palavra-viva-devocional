
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getLevelTitle } from '@/utils/achievementUtils';

type UserRanking = {
  nickname: string;
  points: number;
  level: number;
  rank: number;
};

interface RankingPanelProps {
  maxRanks?: number;
  showCaption?: boolean;
  className?: string;
  compact?: boolean;
}

const RankingPanel = ({ maxRanks = 10, showCaption = true, className = '', compact = false }: RankingPanelProps) => {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // Using the user_rankings view created in our SQL migration
        const { data, error } = await supabase
          .from('user_rankings')
          .select('nickname, points, level, rank')
          .limit(maxRanks);

        if (error) {
          console.error('Error fetching rankings:', error);
          return;
        }

        // The data from user_rankings already matches our UserRanking type
        setRankings(data as UserRanking[] || []);
      } catch (err) {
        console.error('Exception fetching rankings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [maxRanks]);

  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-1 text-yellow-500" />
            <span className="font-bold">1º</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-1 text-gray-400" />
            <span className="font-bold">2º</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-1 text-amber-700" />
            <span className="font-bold">3º</span>
          </div>
        );
      default:
        return <span className="font-medium">{rank}º</span>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className={compact ? "py-4" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Ranking dos Estudantes
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "py-2" : undefined}>
        <Table>
          {showCaption && (
            <TableCaption>Os estudantes mais dedicados da Palavra Viva</TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Posição</TableHead>
              <TableHead>Estudante</TableHead>
              <TableHead className="text-right">Nível</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : rankings.length > 0 ? (
              rankings.map((user) => (
                <TableRow key={user.nickname}>
                  <TableCell>{renderRankBadge(user.rank)}</TableCell>
                  <TableCell className="font-medium">{user.nickname}</TableCell>
                  <TableCell className="text-right">
                    {user.level} ({getLevelTitle(user.level)})
                  </TableCell>
                  <TableCell className="text-right font-semibold">{user.points}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Nenhum usuário no ranking ainda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RankingPanel;
