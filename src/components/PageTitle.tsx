
import React, { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  subtitle?: string;
  icon?: ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, description, subtitle, icon }) => {
  return (
    <div className="mb-6 flex items-center">
      {icon && <div className="mr-3 text-primary">{icon}</div>}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
        {subtitle && (
          <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageTitle;
