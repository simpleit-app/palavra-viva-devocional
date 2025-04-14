import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { Card, CardContent } from '@/components/ui/card';
import DailyVerse from '@/components/DailyVerse'; // Add this import

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

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
