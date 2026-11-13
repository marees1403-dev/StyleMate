import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';
import { SmartImage } from '../components/SmartImage';

export const AuthScreen: React.FC = () => {
  const { loginUser, registerUser, continueAsGuest, navigate, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identity, setIdentity] = useState('mia.jenkins@stylemate.ai');
  const [password, setPassword] = useState('pastelmagic');
  const [familyNickname, setFamilyNickname] = useState('The Jenkins Clan');
  const [rememberAvatar, setRememberAvatar] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identity.trim() || identity.trim().length < 3) {
      setError('Please enter a valid email or mobile number.');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setError('Secret Wardrobe Key must be at least 4 characters.');
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (mode === 'login') {
        loginUser(identity.trim(), rememberAvatar);
      } else {
        registerUser(identity.trim(), familyNickname.trim(), rememberAvatar);
      }
    }, 550);
  };

  const handleSocialAuth = (provider: 'Apple' | 'Google') => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      loginUser(
        provider === 'Apple' ? 'mia.apple@stylemate.ai' : 'mia.google@stylemate.ai',
        rememberAvatar
      );
      showToast(`Signed in with ${provider}!`);
    }, 450);
  };

  return (
    <div className="flex flex-col w-full px-5 pb-8 pt-2 space-y-5 bg-surface min-h-dvh">
      {/* Top Back to Welcome */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate('welcome')}
          className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface active:scale-95 transition-transform"
          aria-label="Back to Welcome"
        >
          <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
        </button>
        <span className="text-[11px] font-semibold text-primary bg-primary-fixed/60 px-3 py-1 rounded-full">
          Step 2 of 2 • Closet Access
        </span>
      </div>

      {/* Top Branded Emblem & Hero Header */}
      <div className="flex flex-col items-center text-center pt-1">
        <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
          <div className="absolute inset-0 bg-secondary-fixed rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 bg-surface-container-high rounded-full shadow-lg flex items-center justify-center overflow-hidden">
            <SmartImage
              src={ASSETS.authMascot}
              alt="Pastel chibi girl and boy mannequins in lavender knitwear"
              className="w-full h-full object-cover"
              fallbackLabel="StyleMate"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-surface-container-lowest text-primary p-1.5 rounded-full shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] material-symbols-filled">
              auto_awesome
            </span>
          </div>
        </div>

        <h1 className="font-display font-bold text-[26px] leading-[34px] text-on-surface flex items-center justify-center gap-1">
          Welcome to StyleMate AI <span className="text-primary">✨</span>
        </h1>
        <p className="text-[14px] text-on-surface-variant mt-1 max-w-[280px]">
          Dress in pure joy, matched for your whole family.
        </p>
      </div>

      {/* Segmented Controller: Log In / Create Account */}
      <div className="w-full bg-surface-container p-1 rounded-full flex shadow-sm relative">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setError(null);
          }}
          className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
            mode === 'login'
              ? 'bg-primary text-on-primary shadow-md'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">lock_open</span>
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setError(null);
          }}
          className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 ${
            mode === 'register'
              ? 'bg-primary text-on-primary shadow-md'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Create Account
        </button>
      </div>

      {/* Social Quick Sign-In Pills */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={() => handleSocialAuth('Apple')}
          className="flex-1 py-3 px-4 bg-surface-container-lowest text-on-surface rounded-full shadow-sm flex items-center justify-center gap-2 text-[12px] font-semibold active:scale-95 transition-all"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77.99.08 2.06-.52 2.68-1.27z" />
          </svg>
          <span>Apple</span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialAuth('Google')}
          className="flex-1 py-3 px-4 bg-surface-container-lowest text-on-surface rounded-full shadow-sm flex items-center justify-center gap-2 text-[12px] font-semibold active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-0.5">
        <div className="w-full h-[1px] bg-surface-variant" />
        <span className="absolute bg-surface px-3 text-[11px] font-semibold text-outline tracking-wide">
          or with email / phone
        </span>
      </div>

      {/* Form */}
      <form className="space-y-3.5 w-full" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-error-container text-on-error-container text-[12px] font-semibold px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="auth-identity"
            className="text-[12px] font-semibold text-on-surface px-1 block"
          >
            Email or Mobile Number
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-tertiary text-[20px]">
              mail
            </span>
            <input
              id="auth-identity"
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="chibi.style@cutemail.com"
              className="w-full bg-surface-container-low text-on-surface text-[14px] pl-11 pr-4 py-3.5 rounded-full placeholder:text-outline/70 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <label htmlFor="auth-password" className="text-[12px] font-semibold text-on-surface">
              Secret Wardrobe Key
            </label>
            <button
              type="button"
              onClick={() =>
                showToast('Reset magic link sent to your email address!')
              }
              className="text-[11px] font-semibold text-primary hover:text-primary-container transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-tertiary text-[20px]">
              lock
            </span>
            <input
              id="auth-password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low text-on-surface text-[14px] pl-11 pr-11 py-3.5 rounded-full placeholder:text-outline/70 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-4 text-tertiary hover:text-on-surface transition-colors p-0.5"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPwd ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <div className="space-y-1">
            <label
              htmlFor="family-nick"
              className="text-[12px] font-semibold text-on-surface px-1 block"
            >
              Your Family or Nickname
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-tertiary text-[20px]">
                badge
              </span>
              <input
                id="family-nick"
                type="text"
                value={familyNickname}
                onChange={(e) => setFamilyNickname(e.target.value)}
                placeholder="e.g. The Momo Clan"
                className="w-full bg-surface-container-low text-on-surface text-[14px] pl-11 pr-4 py-3.5 rounded-full placeholder:text-outline/70 focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all"
              />
            </div>
          </div>
        )}

        {/* Remember My Sizing Avatar Switch */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[15px] material-symbols-filled">
                accessibility_new
              </span>
            </div>
            <span className="text-[12px] text-on-surface font-medium">
              Remember my sizing avatar
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberAvatar}
              onChange={(e) => setRememberAvatar(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-primary" />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 bg-primary hover:bg-primary-container text-on-primary rounded-full shadow-lg flex items-center justify-center gap-2 font-display font-semibold text-[18px] active:scale-95 transition-all disabled:opacity-80"
        >
          <span>
            {submitting
              ? 'Opening closet... ✨'
              : mode === 'login'
                ? 'Sign In to Wardrobe'
                : 'Create My Chibi Closet'}
          </span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </form>

      {/* Onboarding Teaser Card */}
      <div className="w-full bg-surface-container-lowest rounded-[2rem] p-4 shadow-sm relative overflow-hidden flex flex-col space-y-2.5">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary-container/40 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-start gap-2.5">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-fixed shrink-0 shadow-inner">
            <SmartImage
              src={ASSETS.authOnboardingPreview}
              alt="Miniature collection of three pastel chibi doll avatars"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1">
              <span className="material-symbols-outlined text-[12px] material-symbols-filled">
                celebration
              </span>
              New to StyleMate?
            </span>
            <p className="text-[12px] text-on-surface leading-tight font-medium">
              Set up your family chibi 3D avatars &amp; style preferences in 60 seconds.
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-2 flex items-center justify-between text-on-surface-variant text-[11px] font-semibold">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary material-symbols-filled">
              check_circle
            </span>
            Smart matching sizes
          </span>
          <span className="text-tertiary">·</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary material-symbols-filled">
              check_circle
            </span>
            Color harmonies
          </span>
          <button
            type="button"
            onClick={continueAsGuest}
            className="text-primary font-bold hover:underline"
          >
            Skip anytime
          </button>
        </div>
      </div>

      {/* Bottom Guest Browsing Link */}
      <div className="flex flex-col items-center justify-center pt-1 pb-2">
        <button
          type="button"
          onClick={continueAsGuest}
          className="text-[14px] font-bold text-primary hover:text-primary-container py-2 px-4 rounded-full flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <span>Continue as Guest</span>
          <span className="text-base">👗</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
        <p className="text-[12px] text-outline mt-0.5 text-center">
          You can save outfits and link family accounts later.
        </p>
      </div>
    </div>
  );
};
