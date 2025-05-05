
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from '@/components/UserAvatar';
import { getLevelTitle } from '@/utils/achievementUtils';
import RankingPanel from '@/components/RankingPanel';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 2MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedFile || !currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${currentUser.id}/avatar.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, { upsert: true });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update user profile
      await updateProfile({
        photoURL: data.publicUrl
      });
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
      
      // Reset selection
      setSelectedFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro ao atualizar avatar",
        description: "Não foi possível atualizar sua foto de perfil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
      <p className="text-muted-foreground mb-6">Gerencie suas informações pessoais e preferências</p>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <UserAvatar 
                    user={currentUser} 
                    size="lg" 
                    showLevel={true}
                  />
                  
                  <div className="text-center mt-1">
                    <p className="text-sm font-medium">Nickname:</p>
                    <Badge variant="secondary" className="mt-1">
                      {currentUser.nickname}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <input
                      type="file"
                      id="avatar"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="avatar">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="cursor-pointer" 
                        asChild
                      >
                        <span>Alterar Foto</span>
                      </Button>
                    </label>
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-2 text-center">
                      <div className="relative w-20 h-20 mx-auto overflow-hidden rounded-full border-2 border-primary/10">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex gap-2 justify-center">
                        <Button 
                          size="sm" 
                          onClick={uploadAvatar} 
                          disabled={isLoading}
                        >
                          {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="mt-1">{currentUser.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="mt-1">{currentUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Nível</label>
                    <p className="mt-1">
                      Nível {currentUser.level}: {getLevelTitle(currentUser.level)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Pontos</label>
                    <p className="mt-1">{currentUser.points || 0} pontos</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Capítulos Lidos</label>
                    <p className="mt-1">{currentUser.chaptersRead}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Reflexões</label>
                    <p className="mt-1">{currentUser.totalReflections}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Membro desde</label>
                    <p className="mt-1">
                      {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                As preferências de notificação serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ranking">
          <RankingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
