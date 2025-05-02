
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import UserTestimonial from '@/components/UserTestimonial';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        photoURL: photoURL.trim() || currentUser?.photoURL || null
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
      <p className="text-muted-foreground mb-8">Visualize e edite suas informações pessoais.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <p className="text-sm text-muted-foreground">Ajuste suas informações de perfil</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="mb-2 relative">
                <img
                  src={currentUser?.photoURL || '/lovable-uploads/0f2a88ed-40b8-41c7-bf7c-9f546bcb210b.png'}
                  alt="Avatar"
                  className="rounded-full w-32 h-32 object-cover border-2 border-border"
                />
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  Clique na imagem para alterar seu avatar
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="name">Nome</Label>
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-2"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-2"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted rounded-md">{currentUser?.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{currentUser?.email}</p>
              </div>

              {isEditing && (
                <div>
                  <Label htmlFor="photo">URL da foto (opcional)</Label>
                  <Input
                    id="photo"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                  />
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setName(currentUser?.name || '');
                      setPhotoURL(currentUser?.photoURL || '');
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <p className="text-sm text-muted-foreground">Seu progresso na jornada bíblica</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Textos Lidos</p>
                <p className="text-3xl font-bold">{currentUser?.chaptersRead || 2}</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Reflexões</p>
                <p className="text-3xl font-bold">{currentUser?.totalReflections || 3}</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Nível</p>
                <p className="text-3xl font-bold">{currentUser?.level || 1}</p>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Dias Consecutivos</p>
                <p className="text-3xl font-bold">{currentUser?.consecutiveDays || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Membro desde: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : '14 de abril de 2025'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plano Atual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <p className="text-sm text-muted-foreground">Informações da sua assinatura</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-lg">
                  {currentUser?.subscriptionTier === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}
                </h3>
                {currentUser?.subscriptionTier === 'pro' && currentUser?.subscriptionEnd && (
                  <p className="text-sm text-muted-foreground">
                    Válido até {new Date(currentUser.subscriptionEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                currentUser?.subscriptionTier === 'pro' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {currentUser?.subscriptionTier === 'pro' ? 'Ativo' : 'Limitado'}
              </span>
            </div>

            {currentUser?.subscriptionTier !== 'pro' && (
              <>
                <div className="mt-4">
                  <p className="text-sm mb-2">Possui um cupom?</p>
                  <div className="flex space-x-2">
                    <Input placeholder="Digite o código do cupom" className="max-w-xs" />
                    <Button variant="outline">Aplicar</Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => toast({ 
                    title: "Atualizar para Pro",
                    description: "Funcionalidade em desenvolvimento"
                  })}>
                    Atualizar para o Plano Pro
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* User Testimonial */}
        <UserTestimonial />
      </div>

      {/* Planos Disponíveis */}
      {currentUser?.subscriptionTier !== 'pro' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Planos Disponíveis</h2>
          <p className="text-muted-foreground mb-6">
            Escolha o plano que melhor se adapta às suas necessidades
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Plano Gratuito */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Plano Gratuito</h3>
                    <p className="text-sm text-muted-foreground">Acesso limitado</p>
                  </div>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Seu Plano</span>
                </div>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso a 2 textos bíblicos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Limite de 2 reflexões</span>
                  </li>
                  <li className="flex items-start opacity-50">
                    <span className="mr-2 flex-shrink-0">✕</span>
                    <span>Sem acesso às Conquistas</span>
                  </li>
                </ul>

                <p className="font-bold text-lg mb-4 text-center">Gratuito</p>
              </CardContent>
            </Card>

            {/* Plano Pro */}
            <Card className="border-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-1">Plano Pro</h3>
                <p className="text-sm text-muted-foreground mb-4">Desbloqueie todos os recursos</p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso ilimitado a todos os textos bíblicos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Reflexões ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso ao menu de Conquistas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Recursos futuros exclusivos</span>
                  </li>
                </ul>

                <div className="mb-4 text-center">
                  <p className="text-2xl font-bold">R$19,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Possui um cupom?</p>
                    <Input placeholder="Digite o código do cupom" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => toast({ 
                    title: "Assinar agora",
                    description: "Funcionalidade em desenvolvimento"
                  })}>
                    Assinar agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
