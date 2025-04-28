
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsProps } from './types';

const Hero: React.FC<StatsProps> = ({ loading, subscribersCount, reflectionsCount, versesReadCount }) => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
          Seu Aplicativo de Estudo Bíblico
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-8 max-w-5xl mx-auto">
          Organize seus estudos bíblicos com o <span className="text-primary">Palavra Viva</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
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
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
  );
};

export default Hero;
