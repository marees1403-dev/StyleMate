import React from 'react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';
import { Audience } from '../types';
import { SmartImage } from './SmartImage';

interface TopAppBarProps {
  variant: 'tab' | 'stack';
  title?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ variant, title }) => {
  const { user, setAudienceFocus, cartCount, navigate, goBack } = useApp();

  const segments: { key: Audience; label: string }[] = [
    { key: 'women', label: 'Women' },
    { key: 'men', label: 'Men' },
    { key: 'kids', label: 'Kids' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-surface/88 backdrop-blur-xl pt-safe shadow-[0_4px_20px_rgba(103,81,141,0.06)]">
      <div className="h-16 px-5 flex items-center justify-between gap-2">
        {variant === 'tab' ? (
          <>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-1.5 min-h-[44px] active:scale-95 transition-transform"
              aria-label="StyleMate Home"
            >
              <SmartImage
                src={ASSETS.logo}
                alt="StyleMate AI Logo"
                className="h-8 w-8 rounded-full object-contain bg-primary-fixed/40 p-0.5"
              />
              <span className="font-display font-bold text-[18px] text-on-surface tracking-tight hidden xs:inline">
                StyleMate
              </span>
            </button>

            <div className="flex items-center bg-surface-container-high p-1 rounded-full shadow-[inset_0_1px_2px_rgba(31,24,44,0.04)]">
              {segments.map((seg) => {
                const active = user.audienceFocus === seg.key || (user.audienceFocus === 'family' && seg.key === 'women');
                return (
                  <button
                    key={seg.key}
                    type="button"
                    onClick={() => setAudienceFocus(seg.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(103,81,141,0.25)]'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {seg.label}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Go back"
                onClick={goBack}
                className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface bg-surface-container-high/60 hover:bg-surface-container-high active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
              </button>
            </div>
            <h1 className="font-display font-bold text-[17px] text-on-surface tracking-tight truncate px-1 text-center flex-1">
              {title || 'StyleMate AI'}
            </h1>
          </>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="Shopping Bag"
            onClick={() => navigate('cart')}
            className="relative w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-secondary text-on-secondary rounded-full text-[10px] leading-[18px] text-center font-bold shadow-[0_2px_6px_rgba(128,81,91,0.35)] tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Open Profile"
            onClick={() => navigate('profile')}
            className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          >
            <SmartImage
              src={ASSETS.profileAvatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-fixed"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
