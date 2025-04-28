
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { BookOpen, PenLine, Trophy } from 'lucide-react';

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

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Recursos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tudo o que você precisa para seus estudos bíblicos
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Conheça os principais recursos do Palavra Viva e como eles podem transformar sua jornada espiritual.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md p-8 text-center">
              <div className={`mx-auto mb-6 ${item.iconColor}`}>
                {React.createElement(item.icon, { size: 96, strokeWidth: 1.5 })}
              </div>
              <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
              <p className="text-xl text-gray-600 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
