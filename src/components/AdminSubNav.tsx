import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';

export const AdminSubNav: React.FC = () => {
  const { screen, navigate } = useApp();

  const tabs: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'admin-sales', label: 'Sales', icon: 'bar_chart' },
    { id: 'admin-inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'admin-reports', label: 'Reports', icon: 'psychology' },
  ];

  return (
    <div className="px-5 pt-3 pb-1">
      <div className="bg-surface-container-high p-1 rounded-full flex items-center gap-1 shadow-sm">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.id)}
              className={`flex-1 py-2 px-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
