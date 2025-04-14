
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithCredentials, signUp, isAuthenticated, loading } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Redirecionando para o Google",
        description: "Você será redirecionado para fazer login com o Google.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Não foi possível fazer login. Tente novamente mais tarde.",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha e-mail e senha para entrar.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signInWithCredentials(loginEmail, loginPassword);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Palavra Viva.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios para o cadastro.",
      });
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "A senha e a confirmação de senha devem ser iguais.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUp(registerName, registerEmail, registerPassword);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao Palavra Viva. Sua jornada está apenas começando.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Não foi possível criar sua conta. Tente novamente mais tarde.";
      
      // Check for specific error types
      if (errorMessage.includes("User already registered")) {
        toast({
          variant: "destructive",
          title: "Usuário já cadastrado",
          description: "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: errorMessage,
        });
      }
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-celestial-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
            Palavra Viva
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Seu aplicativo diário de estudo bíblico
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">Bem-vindo!</CardTitle>
            <CardDescription className="text-center">
              Faça login ou crie sua conta para começar sua jornada bíblica
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={loginEmail} 
                      onChange={(e) => setLoginEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        Esqueceu a senha?
                      </a>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Seu nome" 
                      value={registerName} 
                      onChange={(e) => setRegisterName(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={registerEmail} 
                      onChange={(e) => setRegisterEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={registerPassword} 
                      onChange={(e) => setRegisterPassword(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirme a senha</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
                  ou continue com
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleGoogleSignIn} 
              className="w-full" 
              disabled={isSubmitting || loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
              </svg>
              Entrar com Google
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Ao fazer login ou criar uma conta, você concorda com nossos 
              <a href="#" className="underline ml-1">Termos de Serviço</a> e 
              <a href="#" className="underline ml-1">Política de Privacidade</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
