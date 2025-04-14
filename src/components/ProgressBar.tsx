
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  colorClass = 'bg-primary'
}) => {
  const percent = Math.min(100, (value / max) * 100);
  
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-xs font-medium">
          {label && <span className="text-slate-500 dark:text-slate-400">{label}</span>}
          {showValue && <span className="text-slate-700 dark:text-slate-300">{value}/{max}</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden", heightClass[size])}>
        <div 
          className={cn("rounded-full transition-all duration-300", colorClass, heightClass[size])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
