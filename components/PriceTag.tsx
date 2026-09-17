import React from 'react';
import { PriceUnit } from '@/types';
import { formatPrice } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  unit?: PriceUnit;
  size?: 'sm' | 'md' | 'lg';
  showCashBadge?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({ 
  price, 
  unit = 'séance', 
  size = 'md',
  showCashBadge = false
}) => {
  const formatted = formatPrice(price, unit);

  const sizeClasses = {
    sm: 'text-xs font-bold text-primary',
    md: 'text-base font-bold text-primary',
    lg: 'text-2xl font-serif font-bold text-primary'
  };

  return (
    <div className="inline-flex flex-col items-start">
      <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
        <span className="material-symbols-outlined text-[18px] text-tertiary material-symbols-fill">payments</span>
        <span>{formatted}</span>
      </div>
      {showCashBadge && (
        <span className="text-[10px] font-bold text-secondary bg-secondary-fixed/60 px-2 py-0.5 rounded-full border border-secondary/30 mt-1">
          100% Espèces directes (0 DA en ligne)
        </span>
      )}
    </div>
  );
};
