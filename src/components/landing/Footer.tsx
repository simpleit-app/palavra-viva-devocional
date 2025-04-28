
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
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
  );
};

export default Footer;
