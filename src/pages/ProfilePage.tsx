
import React, { useState } from 'react';
import { useAuth, User } from '@/contexts/AuthContext';
import PageTitle from '@/components/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, CreditCard, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from '@/components/UserAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

interface UserTestimonial {
  id?: string;
  quote: string;
  author_role: string;
}

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, signOut, isPro, accessCustomerPortal } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [testimonial, setTestimonial] = useState<UserTestimonial>({
    quote: '',
    author_role: ''
  });
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhotoURL(currentUser.photoURL || '');
      fetchUserTestimonial();
    }
  }, [currentUser]);

  const fetchUserTestimonial = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('user_testimonials')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        setTestimonial({
          id: data.id,
          quote: data.quote,
          author_role: data.author_role || ''
        });
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile({
        name,
        photoURL
      });
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar seu perfil.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitTestimonial = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!testimonial.quote || !testimonial.author_role) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }
    
    setIsSubmittingTestimonial(true);
    
    try {
      if (testimonial.id) {
        // Update existing testimonial
        const { error } = await supabase
          .from('user_testimonials')
          .update({
            quote: testimonial.quote,
            author_role: testimonial.author_role,
            updated_at: new Date().toISOString()
          })
          .eq('id', testimonial.id);
          
        if (error) throw error;
      } else {
        // Create new testimonial
        const { error } = await supabase
          .from('user_testimonials')
          .insert({
            user_id: currentUser!.id,
            quote: testimonial.quote,
            author_role: testimonial.author_role
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Depoimento enviado",
        description: "Seu depoimento foi enviado para aprovação.",
      });
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar seu depoimento.",
      });
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const portalUrl = await accessCustomerPortal();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível acessar o portal do cliente. Tente novamente mais tarde.",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl px-4 md:px-6">
      <PageTitle 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações e preferências"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <UserAvatar user={currentUser} size="xl" overrideUrl={photoURL} />
              <h3 className="text-xl font-bold mt-4">{currentUser.name}</h3>
              <p className="text-muted-foreground">{currentUser.email}</p>
              
              <div className="w-full mt-6">
                <div className="flex justify-between mb-2">
                  <span>Nível</span>
                  <span className="font-semibold">{currentUser.level}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Capítulos lidos</span>
                  <span className="font-semibold">{currentUser.chaptersRead}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Reflexões</span>
                  <span className="font-semibold">{currentUser.totalReflections}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Dias consecutivos</span>
                  <span className="font-semibold">{currentUser.consecutiveDays}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total de pontos</span>
                  <span className="font-semibold">{currentUser.points}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Plano</span>
                  <span className="font-semibold">{isPro ? "Pro" : "Gratuito"}</span>
                </div>
              </div>
              
              <div className="mt-6 w-full space-y-4">
                {isPro ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={loadingPortal}
                  >
                    {loadingPortal ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <SubscriptionUpgrade variant="inline" />
                )}
                
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Conta</TabsTrigger>
              <TabsTrigger value="testimonial">Depoimento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Editar Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="display-name">Nome</Label>
                        <Input
                          id="display-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="photo-url">URL da foto de perfil</Label>
                        <Input
                          id="photo-url"
                          value={photoURL || ''}
                          onChange={(e) => setPhotoURL(e.target.value)}
                          placeholder="https://exemplo.com/sua-foto.jpg"
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Atualizando...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Salvar alterações
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="testimonial" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Compartilhe sua experiência</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTestimonial}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="testimonial">Seu depoimento</Label>
                        <Textarea
                          id="testimonial"
                          value={testimonial.quote}
                          onChange={(e) => setTestimonial({...testimonial, quote: e.target.value})}
                          placeholder="Conte como o Palavra Viva tem ajudado em sua jornada espiritual..."
                          className="min-h-[120px]"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="role">Sua ocupação (opcional)</Label>
                        <Input
                          id="role"
                          value={testimonial.author_role}
                          onChange={(e) => setTestimonial({...testimonial, author_role: e.target.value})}
                          placeholder="Ex: Pastor, Estudante, Professor, etc."
                        />
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Seu depoimento pode ser exibido na página inicial após aprovação.
                      </p>
                      
                      <div className="pt-4">
                        <Button type="submit" disabled={isSubmittingTestimonial}>
                          {isSubmittingTestimonial ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : testimonial.id ? (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Atualizar depoimento
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Enviar depoimento
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
