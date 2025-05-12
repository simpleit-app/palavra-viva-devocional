
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ReloadIcon } from '@radix-ui/react-icons';

interface FixUserStatsProps {
  onComplete?: () => void;
}

const FixUserStats: React.FC<FixUserStatsProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, refreshUser } = useAuth();

  const fixUserStats = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-user-stats', {
        body: { email: currentUser.email }
      });
      
      if (error) {
        throw error;
      }
      
      // Refresh user data to reflect the updated stats
      await refreshUser();
      
      toast({
        title: "Estatísticas atualizadas!",
        description: `Seus pontos e contagens foram atualizados corretamente.`,
      });
      
      if (onComplete) {
        onComplete();
      }
      
    } catch (error) {
      console.error("Error fixing user stats:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar estatísticas",
        description: "Não foi possível atualizar suas estatísticas. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={fixUserStats}
      disabled={isLoading}
      className="mt-4"
    >
      {isLoading ? (
        <>
          <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
          Atualizando...
        </>
      ) : (
        "Recalcular Estatísticas"
      )}
    </Button>
  );
};

export default FixUserStats;
