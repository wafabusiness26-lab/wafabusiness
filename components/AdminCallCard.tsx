import React from 'react';
import { ADMIN_CONTACT } from '@/lib/constants';

interface AdminCallCardProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const AdminCallCard: React.FC<AdminCallCardProps> = ({
  title = "Besoin d'aide ou d'une coordination immédiate ?",
  subtitle = "Notre coordinateur vous répond directement par téléphone 7j/7 à Alger.",
  compact = false
}) => {
  return (
    <div className={`rounded-3xl border border-[#ded7ca] bg-surface-container-lowest p-6 shadow-sm ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-serif font-bold text-sm text-on-surface">
            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-base">call</span>
            </span>
            <span>{title}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-secondary">
          Permanence Alger
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <a
          href={`tel:${ADMIN_CONTACT.phone}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition"
        >
          <span className="material-symbols-outlined text-base">phone_in_talk</span>
          <span>Appeler le {ADMIN_CONTACT.phone}</span>
        </a>

        <a
          href={ADMIN_CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-secondary hover:bg-secondary-600 text-white text-xs font-bold shadow-xs transition"
        >
          <span className="material-symbols-outlined text-base">chat</span>
          <span>Contacter sur WhatsApp</span>
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-[#ded7ca]">
        <span>{ADMIN_CONTACT.workingHours}</span>
        <span>Wilaya d'Alger • 57 Communes</span>
      </div>
    </div>
  );
};
