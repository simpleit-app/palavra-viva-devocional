
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">Palavra Viva</h1>
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
  );
};

export default Header;
