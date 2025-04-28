
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { TestimonialType } from './types';

interface TestimonialsProps {
  testimonials: TestimonialType[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section id="testimonials" className="py-20 px-4 bg-gray-50 dark:bg-slate-800/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            Depoimentos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Veja como o Palavra Viva tem ajudado pessoas a transformar seus estudos bíblicos.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
              <svg className="w-12 h-12 text-primary mb-6" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 8v6H6v10h10V14h-4V8h-2zm14 0v6h-4v10h10V14h-4V8h-2z"/>
              </svg>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{testimonial.quote}</p>
              <div>
                <p className="font-bold text-lg">{testimonial.author_name}</p>
                <p className="text-gray-500 dark:text-gray-400">{testimonial.author_role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
