import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';
import { Audience } from '../types';
import { SmartImage } from '../components/SmartImage';

export const WelcomeScreen: React.FC = () => {
  const { user, setAudienceFocus, toggleAesthetic, completeOnboarding, navigate, showToast } = useApp();
  const [heroFav, setHeroFav] = useState(true);

  const audiences: { key: Audience; label: string }[] = [
    { key: 'women', label: '👧 Women' },
    { key: 'men', label: '👦 Men' },
    { key: 'kids', label: '👶 Kids' },
  ];

  const aestheticOptions = [
    { id: 'Soft Pastel', label: '✨ Soft Pastel' },
    { id: 'Playful Dollcore', label: '🧁 Playful Dollcore' },
    { id: 'Casual Chic', label: '🫧 Casual Chic' },
    { id: 'Cozy Knits', label: '🧸 Cozy Knits' },
  ];

  return (
    <div className="flex flex-col w-full px-5 pb-9 pt-2 bg-surface min-h-dvh">
      {/* Brand & Charm Header */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-secondary text-[20px] material-symbols-filled">
              auto_fix_high
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[20px] text-on-surface tracking-tight leading-none">
              StyleMate<span className="text-primary text-[18px]">.ai</span>
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-0.5 mt-0.5">
              <span>Match &amp; Smile</span>
              <span className="material-symbols-outlined text-[12px] text-secondary material-symbols-filled">
                favorite
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] text-primary font-bold">v2.4 AI Active</span>
        </div>
      </div>

      {/* Hero Family Portrait Showcase */}
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-surface-container-low shadow-sm my-1.5">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2rem] flex items-center justify-center">
          <SmartImage
            src={ASSETS.familyHeroLocal}
            alt="Whimsical 3D animated chibi family dressed in matching pastel lavender, blush pink, and cream aesthetic outfits"
            className="w-full h-full object-cover object-center"
            fallbackLabel="Sweet Lilac Capsule"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90 pointer-events-none" />

          {/* Floating Delight Badge Overlay */}
          <button
            type="button"
            onClick={() => navigate('discover')}
            className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-primary text-[15px]">
              auto_awesome
            </span>
            <span className="text-[11px] text-on-surface font-semibold">Twinning Family Drop</span>
          </button>

          <button
            type="button"
            aria-label="Favorite capsule"
            onClick={() => {
              setHeroFav((f) => !f);
              showToast(heroFav ? 'Removed capsule from favorites' : 'Saved Sweet Lilac Capsule!');
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center text-secondary shadow-sm active:scale-90 transition-transform"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                heroFav ? 'material-symbols-filled' : ''
              }`}
            >
              favorite
            </span>
          </button>

          {/* Hero Bottom Floating Capsule Tag */}
          <button
            type="button"
            onClick={() => navigate('pair')}
            className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-sm p-3 rounded-2xl shadow-md flex items-center justify-between text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[18px]">checkroom</span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-on-surface leading-tight">
                  Sweet Lilac Capsule
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Matching for Him, Her &amp; Mini
                </p>
              </div>
            </div>
            <span className="bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0">
              New In
            </span>
          </button>
        </div>
      </div>

      {/* Welcome Catchphrase */}
      <div className="pt-2 pb-1 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full mb-1">
          <span className="material-symbols-outlined text-secondary text-[14px]">magic_button</span>
          <span className="text-[11px] font-semibold text-on-surface-variant">
            Tactile &amp; Personalized Styling
          </span>
        </div>
        <h1 className="font-display font-bold text-[26px] leading-[34px] text-on-surface tracking-tight">
          Dress in Pure Joy.
        </h1>
        <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1 max-w-[280px]">
          Curated looks tailored to your mood, aesthetic, and family members.
        </p>
      </div>

      {/* Interactive Audience Segment Pills */}
      <div className="mt-2.5 mb-2.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
            Select your mood focus
          </span>
          <span className="text-[11px] text-primary font-semibold">Step 1 of 2</span>
        </div>
        <div className="grid grid-cols-3 gap-2 bg-surface-container-high p-1.5 rounded-full">
          {audiences.map((aud) => {
            const active = user.audienceFocus === aud.key;
            return (
              <button
                key={aud.key}
                type="button"
                onClick={() => setAudienceFocus(aud.key)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface opacity-80 hover:bg-surface-container'
                }`}
              >
                <span>{aud.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Benefit Highlights Stack */}
      <div className="flex flex-col gap-2.5 my-1">
        <button
          type="button"
          onClick={() => navigate('discover')}
          className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm flex items-center gap-3 text-left hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[22px] material-symbols-filled">
              stars
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[16px] text-on-surface truncate">
              Discover Fashion Picked For You
            </p>
            <p className="text-[12px] text-on-surface-variant truncate">
              Curated smart taste profiles designed to spark daily joy
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('pair')}
          className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm flex items-center gap-3 text-left hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary text-[22px] material-symbols-filled">
              auto_awesome
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[16px] text-on-surface truncate">
              AI Smart Outfit Pairing
            </p>
            <p className="text-[12px] text-on-surface-variant truncate">
              One-tap full silhouettes from tops, bottoms to kicks
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('tryon')}
          className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm flex items-center gap-3 text-left hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-surface-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[22px] material-symbols-filled">
              accessibility_new
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-[16px] text-on-surface truncate">
              Virtual 3D Fitting Room
            </p>
            <p className="text-[12px] text-on-surface-variant truncate">
              Preview on squishy custom mannequins before purchase
            </p>
          </div>
        </button>
      </div>

      {/* Style Quiz Quick-Teaser Chips */}
      <div className="my-2.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-on-surface-variant font-medium">
            Favorite Core Aesthetics
          </p>
          <span className="text-[11px] font-semibold text-secondary flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">palette</span>
            <span>Tap to prefill</span>
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {aestheticOptions.map((chip) => {
            const active = user.aesthetics.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleAesthetic(chip.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  active
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface hover:bg-secondary-fixed'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Call to Actions */}
      <div className="flex flex-col gap-2.5 mt-1">
        <button
          type="button"
          onClick={completeOnboarding}
          className="w-full py-4 px-6 rounded-full bg-primary text-on-primary font-display font-semibold text-[18px] shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all duration-150"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-[12px] text-on-surface-variant">I already have an account •</span>
          <button
            type="button"
            onClick={() => navigate('auth')}
            className="text-[14px] font-bold text-primary underline underline-offset-4 decoration-primary/40 active:opacity-75"
          >
            Log In
          </button>
        </div>
      </div>

      {/* Trust Marker Micro-Banner */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-on-surface-variant/80 bg-surface-container-high/60 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
          <span className="text-[11px] font-semibold">
            Free Exchanges • Doll-scale Precision Sizing
          </span>
        </div>
      </div>
    </div>
  );
};
