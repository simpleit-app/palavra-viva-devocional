
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DailyVerse from '@/components/DailyVerse';
import { ArrowLeft, Home } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Back to Landing Page Button */}
      <div className="w-full max-w-md mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar ao início</span>
          <Home className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Palavra Viva</h1>
          <p className="text-muted-foreground">Faça login para continuar</p>
        </div>
        
        <DailyVerse />
        
        <Card>
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
