
import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  subtitle, 
  align = 'left' 
}) => {
  return (
    <div className={`mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-muted-foreground mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;
