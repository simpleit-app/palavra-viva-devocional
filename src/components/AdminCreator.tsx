
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminCreator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const { refreshSubscription } = useAuth();
  const { toast } = useToast();

  const upgradeUserToPro = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // First update the subscribers table to mark the user as Pro
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .update({
          subscription_tier: 'pro',
          subscribed: true,
          subscription_end: new Date(2099, 11, 31).toISOString() // Far future date
        })
        .eq('email', 'simpleit.solucoes@gmail.com')
        .select();
      
      if (subscriberError) {
        console.error('Error upgrading user to Pro:', subscriberError);
        setResult({ error: subscriberError.message || 'Ocorreu um erro ao atualizar o usuário para o plano Pro.' });
        return;
      }
      
      console.log('Upgrade response:', subscriberData);
      
      // Now manually refresh the subscription status in the global auth context
      await refreshSubscription();
      
      setResult({ 
        success: true, 
        message: 'Usuário simpleit.solucoes@gmail.com atualizado para o plano Pro com sucesso!'
      });
      
      toast({
        title: "Upgrade concluído",
        description: "O usuário foi atualizado para o plano Pro com sucesso e agora tem acesso ilimitado.",
      });
      
    } catch (err: any) {
      console.error('Exception while upgrading user:', err);
      setResult({ error: err.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Atualizar Usuário para Pro</h2>
      
      <p className="text-sm text-muted-foreground mb-4">
        Isso atualizará o usuário simpleit.solucoes@gmail.com para o plano Pro, removendo 
        todas as limitações de leituras e reflexões.
      </p>
      
      <Button 
        onClick={upgradeUserToPro} 
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Atualizar para Pro'
        )}
      </Button>
      
      {result?.success && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20">
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
      
      {result?.error && (
        <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20">
          <AlertDescription>
            Erro: {result.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminCreator;
