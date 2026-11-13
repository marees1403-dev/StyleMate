import React, { useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';
import { ASSETS, PAIR_SWAP_OPTIONS } from '../data/catalog';

export const AiPairingScreen: React.FC = () => {
  const {
    products,
    openProduct,
    addCustomCartItems,
    saveOutfit,
    equipTryOnItem,
    navigate,
    toggleWishlist,
    isWishlisted,
    showToast,
  } = useApp();

  const anchorCandidates = products.filter(
    (p) => p.category === 'Tops' || p.category === 'Dresses'
  );
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoeIndex, setShoeIndex] = useState(0);
  const [bagIndex, setBagIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnchorPickerOpen, setAnchorPickerOpen] = useState(false);

  const anchorProduct = anchorCandidates[anchorIndex % anchorCandidates.length] || products[0];
  const currentBottom = PAIR_SWAP_OPTIONS.bottoms[bottomIndex % PAIR_SWAP_OPTIONS.bottoms.length];
  const currentShoe = PAIR_SWAP_OPTIONS.shoes[shoeIndex % PAIR_SWAP_OPTIONS.shoes.length];
  const currentBag = PAIR_SWAP_OPTIONS.bag[bagIndex % PAIR_SWAP_OPTIONS.bag.length];

  const individualTotal = Number(
    (anchorProduct.price + currentBottom.price + currentShoe.price + currentBag.price).toFixed(2)
  );
  const bundlePrice = Number((individualTotal * 0.85).toFixed(2));
  const bundleSavings = Number((individualTotal - bundlePrice).toFixed(2));

  const compatibilityScore = Math.min(
    99,
    Math.max(91, 98 - ((bottomIndex + shoeIndex + bagIndex) % 4))
  );
  const colorHarmony = Math.min(100, 96 + ((anchorIndex + bagIndex) % 5));
  const styleCoherence = Math.min(99, 94 + ((bottomIndex + shoeIndex) % 5));

  const handleSwap = (slot: 'bottoms' | 'shoes' | 'bag') => {
    setIsSaved(false);
    if (slot === 'bottoms') {
      const next = (bottomIndex + 1) % PAIR_SWAP_OPTIONS.bottoms.length;
      setBottomIndex(next);
      showToast(`Swapped to ${PAIR_SWAP_OPTIONS.bottoms[next].title}`);
    } else if (slot === 'shoes') {
      const next = (shoeIndex + 1) % PAIR_SWAP_OPTIONS.shoes.length;
      setShoeIndex(next);
      showToast(`Swapped to ${PAIR_SWAP_OPTIONS.shoes[next].title}`);
    } else {
      const next = (bagIndex + 1) % PAIR_SWAP_OPTIONS.bag.length;
      setBagIndex(next);
      showToast(`Swapped to ${PAIR_SWAP_OPTIONS.bag[next].title}`);
    }
  };

  const handleTryCompleteOutfit = () => {
    equipTryOnItem('top', anchorProduct.id);
    equipTryOnItem('bottom', currentBottom.id.startsWith('prod-') ? currentBottom.id : 'prod-trousers');
    equipTryOnItem('shoes', currentShoe.id.startsWith('prod-') ? currentShoe.id : 'prod-sneakers');
    equipTryOnItem('bag', currentBag.id.startsWith('prod-') ? currentBag.id : 'prod-heart-bag');
    navigate('tryon');
  };

  const handleAddAllToCart = () => {
    addCustomCartItems([
      {
        productId: anchorProduct.id,
        title: anchorProduct.shortTitle,
        price: anchorProduct.price,
        image: anchorProduct.image,
        color: anchorProduct.colors[0]?.name || 'Pastel Lilac',
        size: anchorProduct.sizes[1] || anchorProduct.sizes[0] || 'S',
        quantity: 1,
        audience: anchorProduct.audience,
        matchTag: 'AI Capsule Anchor',
        stockNote: 'Bundle 15% Off Active',
      },
      {
        productId: currentBottom.id.startsWith('prod-') ? currentBottom.id : 'prod-trousers',
        title: currentBottom.title,
        price: currentBottom.price,
        image: currentBottom.image,
        color: 'Soft Blush',
        size: 'M',
        quantity: 1,
        audience: 'women',
        matchTag: currentBottom.badge,
        stockNote: 'Co-Purchase Synced',
      },
      {
        productId: currentShoe.id.startsWith('prod-') ? currentShoe.id : 'prod-sneakers',
        title: currentShoe.title,
        price: currentShoe.price,
        image: currentShoe.image,
        color: 'Lilac Mist',
        size: '38',
        quantity: 1,
        audience: 'women',
        matchTag: currentShoe.badge,
        stockNote: 'Includes Spare Laces',
      },
      {
        productId: currentBag.id.startsWith('prod-') ? currentBag.id : 'prod-heart-bag',
        title: currentBag.title,
        price: currentBag.price,
        image: currentBag.image,
        color: 'Cream Pearl',
        size: 'One Size',
        quantity: 1,
        audience: 'women',
        matchTag: currentBag.badge,
        stockNote: 'Bundle Saver Applied',
      },
    ]);
    showToast('All 4 synchronized items added to your bag!');
  };

  const handleSaveOutfit = () => {
    if (isSaved) {
      showToast('Already saved in your Style Book!');
      return;
    }
    saveOutfit(
      `${anchorProduct.shortTitle} Ensemble`,
      [anchorProduct.id, currentBottom.id, currentShoe.id, currentBag.id],
      bundlePrice,
      compatibilityScore
    );
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col w-full px-5 pb-10">
      {/* Top AI Pairing Status & Badge Banner */}
      <div className="mt-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-primary material-symbols-filled">
            auto_awesome
          </span>
          <span className="text-[11px] font-bold text-primary tracking-wide uppercase">
            AI Outfit Pairing Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-secondary text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          Co-Purchase Optimized
        </div>
      </div>

      {/* Header Title Section */}
      <div className="mt-3">
        <h1 className="font-display text-[26px] font-bold text-on-surface tracking-tight">
          AI Outfit Pairing
        </h1>
        <p className="text-[12px] text-on-surface-variant mt-0.5">
          Smart algorithmic combinations curated from 14,200+ stylish co-purchase patterns.
        </p>
      </div>

      {/* Hero Family Capsule Visual Banner */}
      <div className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-high via-secondary-container/30 to-surface-container p-4 shadow-[0_8px_24px_rgba(103,81,141,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 bg-secondary text-on-secondary rounded-full text-[10px] font-bold tracking-wide mb-1.5 shadow-sm">
              FAMILY CAPSULE MATCH
            </span>
            <h2 className="font-display text-[17px] font-bold text-on-surface truncate">
              Harmonized Lavender &amp; Blush
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2">
              Complete aesthetic harmony for women, men, and mini-me doll matching.
            </p>
          </div>
          <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md">
            <SmartImage
              src={ASSETS.familyBannerCapsule}
              alt="Family capsule chibi figurines"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Anchor Hero Card */}
      <div className="mt-5 flex flex-col bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_20px_rgba(103,81,141,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-primary text-on-primary text-[11px] font-semibold rounded-full shadow-[0_2px_8px_rgba(103,81,141,0.25)] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">push_pin</span>
              Main Anchor Item
            </span>
            <button
              type="button"
              onClick={() => setAnchorPickerOpen(true)}
              className="text-[11px] text-primary font-bold underline underline-offset-2"
            >
              Change Anchor
            </button>
          </div>
          <button
            type="button"
            aria-label="Favorite Anchor Item"
            onClick={() => toggleWishlist(anchorProduct.id)}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-secondary hover:bg-secondary-container transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isWishlisted(anchorProduct.id) ? 'material-symbols-filled' : ''
              }`}
            >
              favorite
            </span>
          </button>
        </div>

        <div
          onClick={() => openProduct(anchorProduct.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openProduct(anchorProduct.id)}
          className="flex items-center gap-4 cursor-pointer"
        >
          <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-tr from-surface-container-high to-surface-container">
            <SmartImage
              src={anchorProduct.image}
              alt={anchorProduct.shortTitle}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-primary font-bold">
              100% Match
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
              Topwear Core
            </span>
            <h3 className="font-display text-[17px] font-bold text-on-surface truncate">
              {anchorProduct.shortTitle}
            </h3>
            <p className="text-[12px] text-on-surface-variant mt-0.5 line-clamp-1">
              {anchorProduct.series}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-[19px] text-on-surface font-bold tabular-nums">
                ${anchorProduct.price.toFixed(2)}
              </span>
              {anchorProduct.originalPrice && (
                <span className="text-[11px] text-outline line-through tabular-nums">
                  ${anchorProduct.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curated Flat-Lay Ensemble 2x2 Grid */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-[18px] font-bold text-on-surface">
            Curated Flat-Lay Ensemble
          </h2>
          <p className="text-[12px] text-on-surface-variant">
            4 pieces designed to snap together effortlessly
          </p>
        </div>
        <span className="px-2.5 py-1 bg-surface-container-high text-primary text-[11px] font-bold rounded-full shrink-0">
          4 / 4 Synced
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3.5">
        {/* 1. Anchor Base Layer */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(103,81,141,0.06)] relative">
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 bg-primary/15 text-primary text-[9px] rounded-full font-bold">
              TOP (LOCKED)
            </span>
          </div>
          <div
            onClick={() => openProduct(anchorProduct.id)}
            className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-2.5 cursor-pointer"
          >
            <SmartImage
              src={anchorProduct.image}
              alt={anchorProduct.shortTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] text-outline font-semibold truncate">1. Base Layer</span>
          <h3 className="text-[13px] font-bold text-on-surface truncate mt-0.5">
            {anchorProduct.shortTitle}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[13px] text-primary font-bold tabular-nums">
              ${anchorProduct.price.toFixed(2)}
            </span>
            <span className="material-symbols-outlined text-primary text-[18px] material-symbols-filled">
              check_circle
            </span>
          </div>
        </div>

        {/* 2. Bottomwear */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(103,81,141,0.06)] relative">
          <button
            type="button"
            aria-label="Swap Bottoms"
            onClick={() => handleSwap('bottoms')}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur text-on-surface-variant shadow-md flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
          </button>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-2.5 relative">
            <SmartImage
              src={currentBottom.image}
              alt={currentBottom.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold">
              {currentBottom.badge}
            </span>
          </div>
          <span className="text-[10px] text-secondary font-semibold truncate">2. Bottomwear</span>
          <h3 className="text-[13px] font-bold text-on-surface truncate mt-0.5">
            {currentBottom.title}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[13px] text-on-surface font-bold tabular-nums">
              ${currentBottom.price.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => handleSwap('bottoms')}
              className="text-secondary text-[11px] font-bold flex items-center gap-0.5 hover:underline"
            >
              Swap 🔄
            </button>
          </div>
        </div>

        {/* 3. Footwear */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(103,81,141,0.06)] relative">
          <button
            type="button"
            aria-label="Swap Footwear"
            onClick={() => handleSwap('shoes')}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur text-on-surface-variant shadow-md flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
          </button>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-2.5 relative">
            <SmartImage
              src={currentShoe.image}
              alt={currentShoe.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full text-[9px] font-bold">
              {currentShoe.badge}
            </span>
          </div>
          <span className="text-[10px] text-primary font-semibold truncate">3. Footwear</span>
          <h3 className="text-[13px] font-bold text-on-surface truncate mt-0.5">
            {currentShoe.title}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[13px] text-on-surface font-bold tabular-nums">
              ${currentShoe.price.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => handleSwap('shoes')}
              className="text-secondary text-[11px] font-bold flex items-center gap-0.5 hover:underline"
            >
              Swap 🔄
            </button>
          </div>
        </div>

        {/* 4. Accessory */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(103,81,141,0.06)] relative">
          <button
            type="button"
            aria-label="Swap Accessory"
            onClick={() => handleSwap('bag')}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur text-on-surface-variant shadow-md flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
          </button>
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-2.5 relative">
            <SmartImage
              src={currentBag.image}
              alt={currentBag.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1.5 left-1.5 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[9px] font-bold">
              {currentBag.badge}
            </span>
          </div>
          <span className="text-[10px] text-outline font-semibold truncate">4. Accessory</span>
          <h3 className="text-[13px] font-bold text-on-surface truncate mt-0.5">
            {currentBag.title}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[13px] text-on-surface font-bold tabular-nums">
              ${currentBag.price.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => handleSwap('bag')}
              className="text-secondary text-[11px] font-bold flex items-center gap-0.5 hover:underline"
            >
              Swap 🔄
            </button>
          </div>
        </div>
      </div>

      {/* Research Metric & Compatibility Card */}
      <div className="mt-5 bg-surface-container-high/60 backdrop-blur-md rounded-3xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <span className="text-[10px] text-outline uppercase font-semibold">
                Research Metric
              </span>
              <h3 className="font-display text-[17px] font-bold text-on-surface leading-tight">
                Outfit Compatibility
              </h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[26px] text-primary font-bold tabular-nums">
              {compatibilityScore}%
            </span>
            <span className="text-[11px] text-primary font-semibold">Score</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest/85 p-3 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-outline font-semibold">Color Harmony</span>
            <span className="text-[13px] text-on-surface font-bold tabular-nums">
              {colorHarmony}%
            </span>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${colorHarmony}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-outline font-semibold">Style Coherence</span>
            <span className="text-[13px] text-on-surface font-bold tabular-nums">
              {styleCoherence}%
            </span>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all"
                style={{ width: `${styleCoherence}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[10px] text-outline font-semibold">Occasion Fit</span>
            <span className="text-[13px] text-secondary font-bold">Casual Day</span>
            <div className="w-full bg-secondary-fixed rounded-full h-1.5 overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '94%' }} />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-secondary-container/40 rounded-2xl">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
            insights
          </span>
          <p className="text-[12px] text-on-secondary-container leading-snug">
            <span className="font-bold">84% of shoppers</span> who purchased the{' '}
            <span className="font-semibold underline">{anchorProduct.shortTitle}</span> also paired
            and bought the <span className="font-semibold underline">{currentBottom.title}</span>.
          </p>
        </div>
      </div>

      {/* Price Breakdown & Bundle Card */}
      <div className="mt-5 bg-surface-container-lowest rounded-3xl p-5 shadow-[0_8px_24px_rgba(103,81,141,0.08)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-outline">Individual Value:</span>
              <span className="text-[13px] text-outline line-through tabular-nums">
                ${individualTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-display text-[30px] text-on-surface font-bold leading-none tabular-nums">
                ${bundlePrice.toFixed(2)}
              </span>
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">
                Save 15% Bundle
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[12px] text-primary font-bold block tabular-nums">
              You save ${bundleSavings.toFixed(2)}
            </span>
            <span className="text-[11px] text-on-surface-variant">Free Express Shipping</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleTryCompleteOutfit}
            className="w-full py-3.5 px-4 bg-primary text-on-primary rounded-full font-bold text-[14px] shadow-[0_8px_20px_rgba(103,81,141,0.32)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
            <span>✨ Try Complete Outfit in 3D</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="py-3 px-3 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-bold text-[12px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-secondary-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
              <span>Add All 4 to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleSaveOutfit}
              className={`py-3 px-3 rounded-full font-bold text-[12px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                isSaved
                  ? 'bg-primary-fixed text-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[17px] ${
                  isSaved ? 'material-symbols-filled' : ''
                }`}
              >
                {isSaved ? 'bookmark' : 'bookmark_border'}
              </span>
              <span>{isSaved ? 'Saved!' : 'Save Outfit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Anchor Picker Modal */}
      {isAnchorPickerOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Choose Anchor Topwear
              </h3>
              <button
                type="button"
                onClick={() => setAnchorPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[60dvh] overflow-y-auto">
              {anchorCandidates.map((cand, idx) => (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => {
                    setAnchorIndex(idx);
                    setIsSaved(false);
                    setAnchorPickerOpen(false);
                    showToast(`Anchor updated to ${cand.shortTitle}`);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-colors ${
                    anchorProduct.id === cand.id
                      ? 'bg-primary-fixed/60 ring-2 ring-primary'
                      : 'bg-surface-container-lowest'
                  }`}
                >
                  <SmartImage
                    src={cand.image}
                    alt={cand.shortTitle}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-on-surface truncate">
                      {cand.shortTitle}
                    </p>
                    <p className="text-[11px] text-outline">
                      {cand.series} • ${cand.price.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
