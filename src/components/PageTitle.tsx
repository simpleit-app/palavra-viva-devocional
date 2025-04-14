
import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;
