
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="bg-gradient-to-r from-celestial-300 to-primary p-12 rounded-xl max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Pronto para transformar seus estudos bíblicos?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Comece gratuitamente hoje mesmo e experimente o poder do Palavra Viva.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-xl py-7 px-10" asChild>
            <Link to="/login">Começar Agora</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
