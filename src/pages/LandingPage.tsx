
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// App screenshots
const screenshots = [
  {
    title: "Rota de Estudo",
    description: "Organize sua leitura bíblica com rotas personalizadas",
    image: "/assets/screenshot-study.png"
  },
  {
    title: "Reflexões",
    description: "Registre suas reflexões sobre as passagens bíblicas",
    image: "/assets/screenshot-reflection.png"
  },
  {
    title: "Conquistas",
    description: "Acompanhe seu progresso e conquistas",
    image: "/assets/screenshot-achievements.png"
  }
];

// Testimonials
const testimonials = [
  {
    quote: "O Palavra Viva transformou meus estudos bíblicos. Agora consigo manter um registro de todas as minhas reflexões.",
    author: "João Silva",
    role: "Estudante de Teologia"
  },
  {
    quote: "Finalmente encontrei um app que me ajuda a manter consistência nos meus estudos bíblicos diários.",
    author: "Maria Santos",
    role: "Professora"
  },
  {
    quote: "As conquistas me mantêm motivado a continuar estudando. Excelente ferramenta!",
    author: "Pedro Oliveira",
    role: "Pastor"
  }
];

// Features for both plans
const features = {
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch subscribers count
        const { count: subscribersCount, error: subscribersError } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('subscribed', true);
        
        if (subscribersError) throw subscribersError;
        setSubscribersCount(subscribersCount || 0);
        
        // Fetch reflections count
        const { count: reflectionsCount, error: reflectionsError } = await supabase
          .from('reflections')
          .select('*', { count: 'exact', head: true });
        
        if (reflectionsError) throw reflectionsError;
        setReflectionsCount(reflectionsCount || 0);
        
        // Fetch read verses count
        const { count: versesReadCount, error: versesReadError } = await supabase
          .from('read_verses')
          .select('*', { count: 'exact', head: true });
        
        if (versesReadError) throw versesReadError;
        setVersesReadCount(versesReadCount || 0);
        
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback values if we can't get real data
        setSubscribersCount(523);
        setReflectionsCount(10000);
        setVersesReadCount(5000);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-celestial-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Palavra Viva</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Recursos</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Preços</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition">Depoimentos</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Seu Aplicativo de Estudo Bíblico
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 max-w-4xl mx-auto">
            Organize seus estudos bíblicos com o <span className="text-primary">Palavra Viva</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
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
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-primary">{subscribersCount}+</p>
              <p className="text-gray-600 dark:text-gray-300">Assinantes ativos</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-primary">{reflectionsCount}+</p>
              <p className="text-gray-600 dark:text-gray-300">Reflexões registradas</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <p className="text-4xl font-bold text-primary">{versesReadCount}+</p>
              <p className="text-gray-600 dark:text-gray-300">Versículos lidos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Recursos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo o que você precisa para seus estudos bíblicos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Conheça os principais recursos do Palavra Viva e como eles podem transformar sua jornada espiritual.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {screenshots.map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="h-56 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Palavra+Viva';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Preços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comece gratuitamente e atualize quando precisar de mais recursos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-3xl">Plano Gratuito</CardTitle>
                <CardDescription className="text-lg">Perfeito para começar seus estudos bíblicos</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">R$0</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {features.pro.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-400">
                      <X className="h-5 w-5 text-gray-300 mr-2" />
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
            
            {/* Pro Plan */}
            <Card className="border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-semibold rounded-bl-md">
                Recomendado
              </div>
              <CardHeader>
                <CardTitle className="text-3xl">Plano Pro</CardTitle>
                <CardDescription className="text-lg">Para quem deseja aproveitar ao máximo</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">R$19,90</span>
                  <span className="text-gray-500 dark:text-gray-400">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {features.pro.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Veja como o Palavra Viva tem ajudado pessoas a transformar seus estudos bíblicos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
                <svg className="w-8 h-8 text-primary mb-4" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 8v6H6v10h10V14h-4V8h-2zm14 0v6h-4v10h10V14h-4V8h-2z"/>
                </svg>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-celestial-300 to-primary p-12 rounded-xl max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para transformar seus estudos bíblicos?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Comece gratuitamente hoje mesmo e experimente o poder do Palavra Viva.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg py-6" asChild>
              <Link to="/login">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-900 py-12 px-4">
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
          
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Palavra Viva. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
