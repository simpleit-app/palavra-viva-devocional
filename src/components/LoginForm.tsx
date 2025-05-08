
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!name) {
          throw new Error('Nome é obrigatório para criar uma conta');
        }
        await signUp(name, email, password, gender);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Improved error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Usuário ou senha inválidos. Por favor, verifique suas credenciais e tente novamente.');
      } else {
        setError(error.message || 'Falha na autenticação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isSignUp && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required={isSignUp}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Sexo</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={setGender}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Feminino</Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu.email@exemplo.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSignUp ? 'Criando conta...' : 'Entrando...'}
          </>
        ) : (
          isSignUp ? 'Criar Conta' : 'Entrar'
        )}
      </Button>
      
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm"
        >
          {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie uma'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
