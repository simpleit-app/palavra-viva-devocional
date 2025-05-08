
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import DailyVerse from '@/components/DailyVerse';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import RankingPanel from '@/components/RankingPanel';

// Define the testimonial type
interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  quote: string;
}

// Define the stats type
interface PublicStats {
  total_users: number;
  total_reflections: number;
  total_chapters_read: number;
  active_users_today: number;
}

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<PublicStats>({
    total_users: 0,
    total_reflections: 0,
    total_chapters_read: 0,
    active_users_today: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .rpc('fetch_public_testimonials', { count_limit: 3 });
        
        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    const fetchPublicStats = async () => {
      try {
        console.info('Fetching public statistics from edge function...');
        const response = await fetch(
          `https://mcoeiucylazrjvhaemmc.supabase.co/functions/v1/public-stats`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch public stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching public stats:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar as estatísticas do sistema.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
    fetchPublicStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary py-12 text-white">
        <div className="container max-w-5xl space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Palavra Viva</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Transforme sua jornada espiritual com estudos bíblicos personalizados
          </p>
          <div className="pt-4">
            {currentUser ? (
              <Button asChild size="lg" variant="secondary">
                <Link to="/dashboard">Ir para o Dashboard</Link>
              </Button>
            ) : (
              <div className="space-x-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login">Entrar ou Começar Grátis</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Sua jornada de fé, mais profunda a cada dia
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                      <span className="text-primary text-xl">📖</span>
                    </div>
                    <h3 className="font-semibold text-xl">Estudo Guiado</h3>
                    <p className="text-muted-foreground">
                      Siga um caminho personalizado de estudo bíblico com textos selecionados e reflexões guiadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                      <span className="text-primary text-xl">✏️</span>
                    </div>
                    <h3 className="font-semibold text-xl">Reflexões Pessoais</h3>
                    <p className="text-muted-foreground">
                      Registre suas reflexões e insights para cada passagem, criando um diário espiritual valioso.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                      <span className="text-primary text-xl">🏆</span>
                    </div>
                    <h3 className="font-semibold text-xl">Conquistas</h3>
                    <p className="text-muted-foreground">
                      Mantenha-se motivado com um sistema de conquistas e acompanhe seu progresso espiritual.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12">
              {!currentUser && (
                <div className="text-center">
                  <Button asChild size="lg" variant="default">
                    <Link to="/login">Comece Gratuitamente</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Daily Verse Section */}
        <section className="py-16 bg-muted/50">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-6">
              Versículo do Dia
            </h2>
            <div className="mt-6">
              <DailyVerse />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nossa Comunidade em Números
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{loading ? "..." : stats.total_users}</p>
                <p className="text-muted-foreground">Usuários</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{loading ? "..." : stats.total_reflections}</p>
                <p className="text-muted-foreground">Reflexões</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{loading ? "..." : stats.total_chapters_read}</p>
                <p className="text-muted-foreground">Capítulos Lidos</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{loading ? "..." : stats.active_users_today}</p>
                <p className="text-muted-foreground">Ativos Hoje</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/50">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              O que dizem nossos usuários
            </h2>
            
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map(testimonial => (
                  <Card key={testimonial.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <p className="italic">"{testimonial.quote}"</p>
                        <div>
                          <p className="font-medium">{testimonial.author_name}</p>
                          {testimonial.author_role && (
                            <p className="text-sm text-muted-foreground">{testimonial.author_role}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Seja o primeiro a compartilhar sua experiência!
                </p>
                {currentUser && (
                  <Button asChild className="mt-4">
                    <Link to="/profile">Compartilhar Depoimento</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
        
        {/* Ranking Global Section - Added before footer */}
        <section className="py-16 bg-background">
          <div className="container max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Ranking Global
            </h2>
            <RankingPanel limit={5} />
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Palavra Viva</h2>
            <p className="text-slate-400 mb-6">Transformando sua jornada espiritual</p>
            
            <div className="flex justify-center space-x-4 mb-8">
              {!currentUser && (
                <Button asChild variant="outline">
                  <Link to="/login">Entrar</Link>
                </Button>
              )}
              {currentUser && (
                <Button asChild variant="outline">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
            </div>
            
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Palavra Viva. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
