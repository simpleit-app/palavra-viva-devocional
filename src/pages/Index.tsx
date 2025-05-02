
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-celestial-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Palavra Viva</h1>
        <p className="text-xl mb-6">Seu aplicativo de estudo bíblico</p>
        <Button onClick={() => navigate('/login')}>Entrar</Button>
      </div>
    </div>
  );
};

export default Index;
