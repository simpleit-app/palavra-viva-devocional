
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminCreator = () => {
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [upgradeResult, setUpgradeResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const createAdminUser = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Calling create-admin function...');
      const { data, error } = await supabase.functions.invoke('create-admin');
      
      if (error) {
        console.error('Error calling create-admin function:', error);
        setResult({ error: error.message || 'Ocorreu um erro ao criar o usuário admin.' });
        return;
      }
      
      console.log('Function response:', data);
      setResult({ 
        success: data.success, 
        message: data.message || 'Usuário admin criado com sucesso!'
      });
      
    } catch (err: any) {
      console.error('Exception while calling create-admin function:', err);
      setResult({ error: err.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  const upgradeUserToPro = async () => {
    setUpgradeLoading(true);
    setUpgradeResult(null);
    
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          subscription_tier: 'pro',
          subscribed: true,
          subscription_end: new Date(2099, 11, 31).toISOString() // Far future date
        })
        .eq('email', 'simpleit.solucoes@gmail.com')
        .select();
      
      if (error) {
        console.error('Error upgrading user to Pro:', error);
        setUpgradeResult({ error: error.message || 'Ocorreu um erro ao atualizar o usuário para o plano Pro.' });
        return;
      }
      
      console.log('Upgrade response:', data);
      setUpgradeResult({ 
        success: true, 
        message: 'Usuário simpleit.solucoes@gmail.com atualizado para o plano Pro com sucesso!'
      });
      
    } catch (err: any) {
      console.error('Exception while upgrading user:', err);
      setUpgradeResult({ error: err.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Criar Usuário Admin</h2>
      
      <p className="text-sm text-muted-foreground mb-4">
        Isso criará ou atualizará o usuário admin@palavraviva.com com o plano Pro.
        Senha: admin
      </p>
      
      <Button 
        onClick={createAdminUser} 
        disabled={loading}
        className="w-full mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Criar Usuário Admin'
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
      
      {result?.success && (
        <div className="mt-4 text-sm mb-8">
          <p className="font-medium">Credenciais de acesso:</p>
          <p>Email: admin@palavraviva.com</p>
          <p>Senha: admin</p>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Atualizar Usuário para Pro</h2>
      
      <p className="text-sm text-muted-foreground mb-4">
        Isso atualizará o usuário simpleit.solucoes@gmail.com para o plano Pro.
      </p>
      
      <Button 
        onClick={upgradeUserToPro} 
        disabled={upgradeLoading}
        className="w-full mb-4"
      >
        {upgradeLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Atualizar para Pro'
        )}
      </Button>
      
      {upgradeResult?.success && (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20">
          <AlertDescription>
            {upgradeResult.message}
          </AlertDescription>
        </Alert>
      )}
      
      {upgradeResult?.error && (
        <Alert className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20">
          <AlertDescription>
            Erro: {upgradeResult.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminCreator;
