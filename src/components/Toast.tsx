import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const iconName =
    toast.tone === 'error'
      ? 'error'
      : toast.tone === 'secondary'
        ? 'favorite'
        : 'check_circle';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-[380px] pointer-events-none transition-all duration-200">
      <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-xl flex items-center justify-center gap-2 text-center">
        <span className="material-symbols-outlined text-secondary-fixed text-[18px] material-symbols-filled shrink-0">
          {iconName}
        </span>
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
};
