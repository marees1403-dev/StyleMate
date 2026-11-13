import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';

export const BottomTabBar: React.FC = () => {
  const { screen, navigate } = useApp();

  const tabs: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'auto_awesome' },
    { id: 'discover', label: 'Discover', icon: 'grid_view' },
    { id: 'pair', label: 'AI Pair', icon: 'checkroom' },
    { id: 'tryon', label: 'Try-On', icon: 'arrows_outward' },
    { id: 'profile', label: 'Profile', icon: 'favorite' },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="sticky bottom-0 left-0 right-0 z-40 pb-safe bg-surface/92 backdrop-blur-xl shadow-[0_-8px_24px_rgba(103,81,141,0.08)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = screen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[58px] h-12 px-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-primary font-bold bg-primary-fixed/60 shadow-[0_4px_14px_rgba(103,81,141,0.18)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'material-symbols-filled' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] mt-0.5 leading-none tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
