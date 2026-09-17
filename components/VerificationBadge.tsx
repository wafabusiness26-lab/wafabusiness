import React from 'react';
import { VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  status?: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status = 'non_verifie', size = 'sm' }) => {
  const isVerified = status === 'verifie_en_main_propre';
  const isPending = status === 'en_attente_physique';

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2'
  };

  if (isVerified) {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-[#fcf8ee] border border-[#D4A373] text-[#7d562d] shadow-xs ${sizeClasses[size]}`}>
        <span className="material-symbols-outlined text-[13px] text-[#b7895b] material-symbols-fill">verified</span>
        <span>Vérifié en Main Propre</span>
      </span>
    );
  }

  if (isPending) {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-amber-50 border border-amber-300 text-amber-800 ${sizeClasses[size]}`}>
        <span className="material-symbols-outlined text-[13px] text-amber-600">schedule</span>
        <span>Convocation bureau en attente</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full bg-slate-100 border border-slate-300 text-slate-600 ${sizeClasses[size]}`}>
      <span className="material-symbols-outlined text-[13px] text-slate-400">pending</span>
      <span>Non vérifié</span>
    </span>
  );
};
