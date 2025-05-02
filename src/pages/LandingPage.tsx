import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, BookOpen, PenLine, Trophy, Menu, X as Close } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";

const features = [
  {
    title: "Rota de Estudo",
    description: "Organize sua leitura bíblica com rotas personalizadas",
    icon: BookOpen,
    iconColor: "text-blue-500"
  },
  {
    title: "Reflexões",
    description: "Registre suas reflexões sobre as passagens bíblicas",
    icon: PenLine,
    iconColor: "text-indigo-500"
  },
  {
    title: "Conquistas",
    description: "Acompanhe seu progresso e conquistas",
    icon: Trophy,
    iconColor: "text-amber-500"
  }
];

type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
};

const planFeatures = {
  free: [
    "Acesso a todas as passagens bíblicas",
    "2 reflexões diárias",
    "Rota de estudo básica",
    "Acesso ao dashboard"
  ],
  pro: [
    "Reflexões ilimitadas",
    "Rotas de estudo personalizadas",
    "Todas as conquistas disponíveis",
    "Estatísticas avançadas",
    "Suporte prioritário",
    "Sem anúncios"
  ]
};

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [reflectionsCount, setReflectionsCount] = useState<number>(0);
  const [versesReadCount, setVersesReadCount] = useState<number>(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log('Fetching public statistics from edge function...');
        
        // Call the public-stats edge function to get statistics and testimonials
        const { data: statsData, error } = await supabase.functions.invoke('public-stats');
        
        if (error) {
          console.error('Error calling public-stats function:', error);
          throw error;
        }
        
        console.log('Statistics data received:', statsData);
        
        // Update state with the values from the edge function
        setSubscribersCount(statsData.activeSubscribersCount || 0);
        setReflectionsCount(statsData.reflectionsCount || 0);
        setVersesReadCount(statsData.versesReadCount || 0);
        
        // Set testimonials from the edge function
        if (statsData.testimonials && Array.isArray(statsData.testimonials)) {
          setTestimonials(statsData.testimonials);
        }
        
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Show error toast
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive"
        });
        
        // Use fallback values
        setSubscribersCount(0);
        setReflectionsCount(0);
        setVersesReadCount(0);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-celestial-50 to-white dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                <path d="M3 6v13"></path>
                <path d="M12 6v13"></path>
                <path d="M21 6v13"></path>
              </svg>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">Palavra Viva</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Recursos</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Preços</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Depoimentos</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <Close /> : <Menu />}
            </Button>
          </div>
          
          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Começar Grátis</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="container mx-auto px-4 flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recursos
              </a>
              <a 
                href="#pricing" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </a>
              <a 
                href="#testimonials" 
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Depoimentos
              </a>
              <div className="flex flex-col gap-3 pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/login">Começar Grátis</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Seu Aplicativo de Estudo Bíblico
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 max-w-5xl mx-auto">
            Organize seus estudos bíblicos com o <span className="text-primary">Palavra Viva</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Uma plataforma completa para suas reflexões bíblicas, com recursos de gamificação 
            para manter sua consistência nos estudos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg py-6">
              <Link to="/login">Começar Grátis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg py-6">
              <Link to="/login">Entrar na Plataforma</Link>
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              {loading ? (
                <Skeleton className="h-16 w-32 mx-auto mb-2" />
              ) : (
                <p className="text-5xl font-bold text-primary">{subscribersCount}+</p>
              )}
              <p className="text-gray-600 dark:text-gray-300">Assinantes ativos</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              {loading ? (
                <Skeleton className="h-16 w-32 mx-auto mb-2" />
              ) : (
                <p className="text-5xl font-bold text-primary">{reflectionsCount}+</p>
              )}
              <p className="text-gray-600 dark:text-gray-300">Reflexões registradas</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              {loading ? (
                <Skeleton className="h-16 w-32 mx-auto mb-2" />
              ) : (
                <p className="text-5xl font-bold text-primary">{versesReadCount}+</p>
              )}
              <p className="text-gray-600 dark:text-gray-300">Versículos lidos</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Recursos
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Tudo o que você precisa para seus estudos bíblicos
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Conheça os principais recursos do Palavra Viva e como eles podem transformar sua jornada espiritual.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md p-8 text-center">
                <div className={`mx-auto mb-6 ${item.iconColor}`}>
                  {React.createElement(item.icon, { size: 96, strokeWidth: 1.5 })}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Preços
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comece gratuitamente e atualize quando precisar de mais recursos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl">Plano Gratuito</CardTitle>
                <CardDescription className="text-lg md:text-xl">Perfeito para começar seus estudos bíblicos</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl md:text-6xl font-bold">R$0</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {planFeatures.pro.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center text-lg text-gray-400">
                      <X className="h-6 w-6 text-gray-300 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg py-6" variant="outline" asChild>
                  <Link to="/login">Começar Grátis</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold rounded-bl-md">
                Recomendado
              </div>
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl">Plano Pro</CardTitle>
                <CardDescription className="text-lg md:text-xl">Para quem deseja aproveitar ao máximo</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl md:text-6xl font-bold">R$19,90</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {planFeatures.free.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {planFeatures.pro.map((feature, index) => (
                    <li key={index} className="flex items-center text-lg">
                      <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg py-6" asChild>
                  <Link to="/login">Assinar Pro</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              O que nossos usuários dizem
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Veja como o Palavra Viva tem ajudado pessoas a transformar seus estudos bíblicos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Render skeletons while loading
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
                  <Skeleton className="w-12 h-12 rounded-full mb-6" />
                  <Skeleton className="h-20 w-full mb-6" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))
            ) : testimonials.length > 0 ? (
              // Render actual testimonials if available
              testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
                  <svg className="w-12 h-12 text-primary mb-6" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 8v6H6v10h10V14h-4V8h-2zm14 0v6h-4v10h10V14h-4V8h-2z"/>
                  </svg>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold text-lg">{testimonial.author_name}</p>
                    {testimonial.author_role && (
                      <p className="text-gray-500 dark:text-gray-400">{testimonial.author_role}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Fallback for no testimonials
              <div className="col-span-1 md:col-span-3 text-center py-10">
                <p className="text-muted-foreground">Ainda não temos depoimentos para exibir. Seja o primeiro a compartilhar sua experiência!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-celestial-300 to-primary p-8 sm:p-12 rounded-xl max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para transformar seus estudos bíblicos?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Comece gratuitamente hoje mesmo e experimente o poder do Palavra Viva.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg sm:text-xl py-6 sm:py-7 px-8 sm:px-10" asChild>
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-100 dark:bg-slate-900 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="bg-primary text-white p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                  <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                  <path d="M3 6v13"></path>
                  <path d="M12 6v13"></path>
                  <path d="M21 6v13"></path>
                </svg>
              </div>
              <h1 className="text-xl font-bold">Palavra Viva</h1>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <a href="#features" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Depoimentos</a>
              <Link to="/login" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Entrar</Link>
            </nav>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4 text-center text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Palavra Viva. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
