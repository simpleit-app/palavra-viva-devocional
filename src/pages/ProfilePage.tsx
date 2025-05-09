
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import PageTitle from '@/components/PageTitle';
import UserAvatar from '@/components/UserAvatar';
import { Pencil, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, refreshSubscription, isPro } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome.",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      let photoURL = currentUser?.photoURL;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser?.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // First, delete existing files in the user's avatar folder
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('avatars')
          .list(currentUser?.id || '');
        
        if (listError) {
          console.error('Error listing existing files:', listError);
        } else if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `${currentUser?.id}/${file.name}`);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove(filesToDelete);
          
          if (deleteError) {
            console.error('Error deleting existing files:', deleteError);
          }
        }
        
        // Upload the new file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            upsert: true,
            contentType: avatarFile.type
          });
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        photoURL = publicUrl;
      }
      
      // Update profile
      await updateProfile({
        name,
        photoURL,
      });
      
      await refreshSubscription();
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o perfil. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  return (
    <div className="container max-w-4xl py-6 px-4 md:px-6">
      <PageTitle 
        title="Meu Perfil"
        subtitle="Visualize e edite suas informações pessoais."
      />
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                    <UserAvatar 
                      user={currentUser} 
                      overrideUrl={avatarPreview} 
                      showLevel={false} 
                      size="xl" 
                    />
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="w-6 h-6" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Clique na imagem para alterar seu avatar
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Pencil className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={currentUser.email}
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Seu progresso na jornada bíblica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Textos Lidos</p>
                  <p className="text-2xl font-semibold">{currentUser.chaptersRead}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Reflexões</p>
                  <p className="text-2xl font-semibold">{currentUser.totalReflections}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Nível</p>
                  <p className="text-2xl font-semibold">{currentUser.level}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Dias Consecutivos</p>
                  <p className="text-2xl font-semibold">{currentUser.consecutiveDays}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  Membro desde {formatDate(currentUser.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className={isPro ? "border-primary/40 bg-primary/5" : ""}>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
              <CardDescription>
                Informações da sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold text-xl">
                    {isPro ? 'Plano Pro' : 'Plano Gratuito'}
                  </p>
                  {isPro && currentUser.subscriptionEnd && (
                    <p className="text-sm text-muted-foreground">
                      Expira em {formatDate(currentUser.subscriptionEnd)}
                    </p>
                  )}
                </div>
                {isPro ? (
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    Ativo
                  </span>
                ) : (
                  <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                    Limitado
                  </span>
                )}
              </div>
              
              {!isPro && (
                <div className="mt-4">
                  <SubscriptionUpgrade variant="inline" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Planos Disponíveis</CardTitle>
            <CardDescription>
              Escolha o plano que melhor se adapta às suas necessidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={!isPro ? "border-primary/40 bg-primary/5" : ""}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Plano Gratuito</CardTitle>
                    {!isPro && <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">Seu Plano</span>}
                  </div>
                  <CardDescription>Acesso limitado</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 my-4">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Acesso a 2 textos bíblicos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Limite de 2 reflexões</span>
                    </li>
                    <li className="flex items-start text-muted-foreground">
                      <span className="mr-2">✗</span>
                      <span>Sem acesso às Conquistas</span>
                    </li>
                  </ul>
                  <p className="font-semibold text-center">Gratuito</p>
                </CardContent>
              </Card>
              
              <SubscriptionUpgrade variant="card" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
