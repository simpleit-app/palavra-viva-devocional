
// Modify the ProfilePage to include the UserTestimonial component
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTitle from '@/components/PageTitle';
import UserAvatar from '@/components/UserAvatar';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import UserTestimonial from '@/components/UserTestimonial';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        photoURL: photoURL.trim() || currentUser?.photoURL || null
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <PageTitle title="Perfil" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <UserAvatar 
                  user={currentUser} 
                  size="lg"
                  fallback={name.substring(0, 2)}
                />
                <div className="flex-1">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nome que será exibido em sua conta
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="photo">URL da foto (opcional)</Label>
                <Input
                  id="photo"
                  value={photoURL || ''}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Add the user testimonial component */}
        <UserTestimonial />
      </div>
    </div>
  );
};

export default ProfilePage;
