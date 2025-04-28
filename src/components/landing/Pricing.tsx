
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from 'lucide-react';

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

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Preços
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha o plano ideal para você
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comece gratuitamente e atualize quando precisar de mais recursos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-4xl">Plano Gratuito</CardTitle>
              <CardDescription className="text-xl">Perfeito para começar seus estudos bíblicos</CardDescription>
              <div className="mt-4">
                <span className="text-6xl font-bold">R$0</span>
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
              <CardTitle className="text-4xl">Plano Pro</CardTitle>
              <CardDescription className="text-xl">Para quem deseja aproveitar ao máximo</CardDescription>
              <div className="mt-4">
                <span className="text-6xl font-bold">R$19,90</span>
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
  );
};

export default Pricing;
