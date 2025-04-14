
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminCreator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

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
        <div className="mt-4 text-sm">
          <p className="font-medium">Credenciais de acesso:</p>
          <p>Email: admin@palavraviva.com</p>
          <p>Senha: admin</p>
        </div>
      )}
    </div>
  );
};

export default AdminCreator;
