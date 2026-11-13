import React, { useRef, useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';

export const VirtualTryOnScreen: React.FC = () => {
  const {
    user,
    updateUserBody,
    products,
    tryOnSlots,
    equipTryOnItem,
    resetTryOnOutfit,
    familyAvatars,
    toggleFamilyMemberSync,
    saveOutfit,
    addCustomCartItems,
    openProduct,
    navigate,
    showToast,
  } = useApp();

  const [angle, setAngle] = useState<'Front' | '3/4' | 'Side' | 'Back'>('Front');
  const [spinDeg, setSpinDeg] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeCatTab, setActiveCatTab] = useState<string>('Tops');
  const [isFavorited, setIsFavorited] = useState(true);
  const [isEditBodyOpen, setEditBodyOpen] = useState(false);
  const [isCompareOpen, setCompareOpen] = useState(false);
  const [isFamilyOpen, setFamilyOpen] = useState(false);

  // Body edit draft state
  const [draftHeight, setDraftHeight] = useState(user.height);
  const [draftSilhouette, setDraftSilhouette] = useState(user.silhouette);
  const [draftSkinTone, setDraftSkinTone] = useState(user.skinTone);
  const [draftSkinHex, setDraftSkinHex] = useState(user.skinHex);

  const dragStartX = useRef<number | null>(null);

  const topItem = products.find((p) => p.id === tryOnSlots.top) || products[0];
  const bottomItem = products.find((p) => p.id === tryOnSlots.bottom) || products[1];
  const shoesItem = products.find((p) => p.id === tryOnSlots.shoes) || products[2];

  const layeredItems = [
    { slot: 'top' as const, label: 'Top', badgeColor: 'bg-primary text-on-primary', product: topItem, note: 'Relaxed Shoulder Fit' },
    { slot: 'bottom' as const, label: 'Bottom', badgeColor: 'bg-secondary text-on-secondary', product: bottomItem, note: 'Waist Snug (-0.2")' },
    { slot: 'shoes' as const, label: 'Shoes', badgeColor: 'bg-tertiary text-on-tertiary', product: shoesItem, note: 'Perfect Match' },
  ];

  const rawTotal = Number((topItem.price + bottomItem.price + shoesItem.price).toFixed(2));
  const bundleTotal = Number((rawTotal * 0.85).toFixed(2));
  const bundleSave = Math.round(rawTotal - bundleTotal);

  const categoryTabs = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags'];
  const quickAlternatives = products.filter((p) => {
    if (activeCatTab === 'Tops') return p.category === 'Tops';
    if (activeCatTab === 'Bottoms') return p.category === 'Bottoms';
    if (activeCatTab === 'Dresses') return p.category === 'Dresses' || p.category === 'Family Sets';
    if (activeCatTab === 'Shoes') return p.category === 'Shoes';
    return p.category === 'Bags' || p.category === 'Accessories';
  });

  const handleAngleSelect = (nextAngle: 'Front' | '3/4' | 'Side' | 'Back') => {
    setAngle(nextAngle);
    const angleMap = { Front: 0, '3/4': 24, Side: 42, Back: 180 };
    setSpinDeg(angleMap[nextAngle]);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;
    setSpinDeg((prev) => prev + dx * 0.7);
  };

  const handlePointerUp = () => {
    dragStartX.current = null;
  };

  const handleEquipAlternative = (prodId: string) => {
    const target = products.find((p) => p.id === prodId);
    if (!target) return;
    const slot =
      target.category === 'Bottoms'
        ? 'bottom'
        : target.category === 'Shoes'
          ? 'shoes'
          : target.category === 'Bags' || target.category === 'Accessories'
            ? 'bag'
            : 'top';
    equipTryOnItem(slot, target.id);
  };

  const handleAddOutfitToBag = () => {
    addCustomCartItems([
      {
        productId: topItem.id,
        title: topItem.shortTitle,
        price: topItem.price,
        image: topItem.image,
        color: topItem.colors[0]?.name || 'Soft Lilac',
        size: topItem.sizes[1] || topItem.sizes[0] || 'S',
        quantity: 1,
        audience: topItem.audience,
        matchTag: '3D Avatar Verified',
        stockNote: 'Bundle 15% Off Active',
      },
      {
        productId: bottomItem.id,
        title: bottomItem.shortTitle,
        price: bottomItem.price,
        image: bottomItem.image,
        color: bottomItem.colors[0]?.name || 'Soft Blush',
        size: bottomItem.sizes[1] || bottomItem.sizes[0] || 'M',
        quantity: 1,
        audience: bottomItem.audience,
        matchTag: '3D Avatar Verified',
        stockNote: 'Bundle 15% Off Active',
      },
      {
        productId: shoesItem.id,
        title: shoesItem.shortTitle,
        price: shoesItem.price,
        image: shoesItem.image,
        color: shoesItem.colors[0]?.name || 'Lilac Mist',
        size: shoesItem.sizes[2] || shoesItem.sizes[0] || '38',
        quantity: 1,
        audience: shoesItem.audience,
        matchTag: '3D Avatar Verified',
        stockNote: 'Bundle 15% Off Active',
      },
    ]);
    showToast('3-piece 3D fitted look added to your bag!');
    navigate('cart');
  };

  const handleSaveLook = () => {
    saveOutfit(
      `${topItem.shortTitle} 3D Look`,
      [topItem.id, bottomItem.id, shoesItem.id],
      bundleTotal,
      96
    );
  };

  const handleSaveBody = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserBody({
      height: draftHeight,
      silhouette: draftSilhouette,
      skinTone: draftSkinTone,
      skinHex: draftSkinHex,
    });
    setEditBodyOpen(false);
    showToast('3D avatar measurements & skin palette updated!');
  };

  const visualTiltY = ((spinDeg % 360) + 360) % 360;
  const stageScaleX =
    visualTiltY > 110 && visualTiltY < 250 ? -1 : 1;

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Floating Controls: Avatar Mode & Measure Presets */}
      <div className="px-5 pt-2 pb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex p-1 bg-surface-container rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => updateUserBody({ avatarMode: 'chibi' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                user.avatarMode === 'chibi'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] material-symbols-filled">
                face_6
              </span>
              <span>Chibi Avatar</span>
            </button>
            <button
              type="button"
              onClick={() => updateUserBody({ avatarMode: 'mannequin' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 ${
                user.avatarMode === 'mannequin'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">accessibility_new</span>
              <span>Mannequin</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Reset View"
              onClick={() => {
                setSpinDeg(0);
                setZoomScale(1);
                setAngle('Front');
                resetTryOnOutfit();
              }}
              className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
            </button>
            <button
              type="button"
              aria-label="Favorite Look"
              onClick={() => {
                setIsFavorited((v) => !v);
                showToast(!isFavorited ? '3D Look starred!' : 'Star removed');
              }}
              className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  isFavorited ? 'material-symbols-filled' : ''
                }`}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Measure Preset Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 px-3 py-1 bg-surface-container-low rounded-full shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[15px]">straighten</span>
            <span className="text-[11px] text-on-surface font-semibold">{user.height}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-surface-container-low rounded-full shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[15px]">tune</span>
            <span className="text-[11px] text-on-surface font-semibold">{user.silhouette}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-full shrink-0 shadow-sm">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-inner"
              style={{ backgroundColor: user.skinHex }}
            />
            <span className="text-[11px] text-on-surface font-semibold">{user.skinTone}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditBodyOpen(true)}
            className="flex items-center gap-1 px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full shrink-0 hover:bg-primary-fixed-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span className="text-[11px] font-semibold">Edit Body</span>
          </button>
        </div>
      </div>

      {/* 3D Stage Viewport Card */}
      <div className="px-5">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-full aspect-[4/5] max-h-[440px] bg-gradient-to-b from-surface-container-low via-surface-container to-surface-variant rounded-3xl overflow-hidden shadow-md flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        >
          <div className="absolute bottom-4 w-64 h-16 bg-surface-container-high/70 rounded-full blur-md" />
          <div className="absolute bottom-6 w-52 h-10 bg-primary-fixed/40 rounded-full" />

          {/* Active Garment Floating Badges */}
          <div className="absolute left-3 top-14 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
              <SmartImage src={topItem.image} alt={topItem.shortTitle} className="w-5 h-5 rounded object-cover" />
              <span className="text-[10px] font-bold text-on-surface max-w-[78px] truncate">
                {topItem.shortTitle}
              </span>
            </div>
            <div className="bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
              <SmartImage src={bottomItem.image} alt={bottomItem.shortTitle} className="w-5 h-5 rounded object-cover" />
              <span className="text-[10px] font-bold text-on-surface max-w-[78px] truncate">
                {bottomItem.shortTitle}
              </span>
            </div>
          </div>

          <SmartImage
            src={user.avatarMode === 'chibi' ? ASSETS.chibiTryOnStage : ASSETS.authOnboardingPreview}
            alt="3D Virtual Fitting Room Stage"
            className={`w-full h-full object-contain relative z-10 drop-shadow-[0_12px_24px_rgba(103,81,141,0.22)] select-none transition-all duration-300 ${
              user.avatarMode === 'mannequin' ? 'contrast-95 saturate-75' : ''
            }`}
            style={{
              transform: `scale(${zoomScale}) scaleX(${stageScaleX}) rotate(${Math.sin((spinDeg * Math.PI) / 180) * 3}deg)`,
            }}
          />

          {/* Floating Angle Selector */}
          <div className="absolute top-3 left-3 z-20 flex bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-full shadow-sm">
            {(['Front', '3/4', 'Side', 'Back'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => handleAngleSelect(a)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                  angle === a
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface font-semibold'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Fit Confidence Rating Pill */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-secondary text-base material-symbols-filled">
              verified
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] leading-tight text-on-surface-variant">
                Match Precision
              </span>
              <span className="text-[11px] font-bold text-primary leading-tight">96% Optimal</span>
            </div>
          </div>

          {/* 360 Spin Floating Touch Ring */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md">
            <button
              type="button"
              aria-label="Rotate Left"
              onClick={() => setSpinDeg((d) => d - 45)}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
            >
              <span className="material-symbols-outlined text-[18px]">rotate_left</span>
            </button>
            <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold whitespace-nowrap">
              Drag to Spin 360°
            </span>
            <button
              type="button"
              aria-label="Rotate Right"
              onClick={() => setSpinDeg((d) => d + 45)}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
            >
              <span className="material-symbols-outlined text-[18px]">rotate_right</span>
            </button>
          </div>

          {/* Quick Zoom In/Out */}
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-full shadow-sm">
            <button
              type="button"
              aria-label="Zoom In"
              onClick={() => setZoomScale((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">zoom_in</span>
            </button>
            <button
              type="button"
              aria-label="Zoom Out"
              onClick={() => setZoomScale((z) => Math.max(0.85, Number((z - 0.1).toFixed(2))))}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">zoom_out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulated AI Fit Notice Chip */}
      <div className="px-5 mt-3">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-secondary-fixed/50 rounded-2xl">
          <span className="material-symbols-outlined text-secondary text-lg">info</span>
          <p className="text-[11.5px] text-on-secondary-fixed-variant leading-snug">
            Drape &amp; tension simulated based on your 3D chibi body scans. True garment falls
            within 0.5&quot; tolerance.
          </p>
        </div>
      </div>

      {/* Outfit Components */}
      <div className="px-5 mt-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">checkroom</span>
            <h2 className="font-display text-[18px] font-bold text-on-surface">
              Outfit Components
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
            3 Items Layered
          </span>
        </div>

        {layeredItems.map((layer) => (
          <div
            key={layer.slot}
            className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <div
              onClick={() => openProduct(layer.product.id)}
              className="relative w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
            >
              <SmartImage
                src={layer.product.image}
                alt={layer.product.shortTitle}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute bottom-1 right-1 ${layer.badgeColor} text-[9px] font-bold px-1.5 rounded-full`}
              >
                {layer.label}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-on-surface truncate">
                  {layer.product.shortTitle}
                </h3>
                <span className="text-[14px] text-primary font-bold ml-2 tabular-nums">
                  ${layer.product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Size {layer.product.sizes[1] || layer.product.sizes[0]} •{' '}
                {layer.product.colors[0]?.name}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full text-[10px] text-primary font-bold">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  {layer.note}
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {layer.product.fitConfidence}% Fit match
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Swap ${layer.label}`}
              onClick={() => {
                setActiveCatTab(
                  layer.slot === 'bottom' ? 'Bottoms' : layer.slot === 'shoes' ? 'Shoes' : 'Tops'
                );
                showToast(`Select an alternative ${layer.label.toLowerCase()} below!`);
              }}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
            </button>
          </div>
        ))}
      </div>

      {/* Quick Swap & Try Alternatives */}
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="px-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-[18px] font-bold text-on-surface">
              Quick Swap &amp; Try Alternatives
            </h2>
            <p className="text-[12px] text-on-surface-variant">
              Tap to see real-time drape changes
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('discover')}
            className="text-[12px] text-primary font-bold flex items-center"
          >
            Explore All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="px-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categoryTabs.map((tab) => {
            const active = activeCatTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCatTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pt-1 pb-2">
          {quickAlternatives.map((alt) => (
            <div
              key={alt.id}
              className="w-32 bg-surface-container-lowest rounded-2xl p-2 flex flex-col shrink-0 shadow-sm relative"
            >
              <div
                onClick={() => openProduct(alt.id)}
                className="relative w-full aspect-square rounded-xl bg-surface-container overflow-hidden mb-2 cursor-pointer"
              >
                <SmartImage
                  src={alt.image}
                  alt={alt.shortTitle}
                  className="w-full h-full object-cover"
                />
                {alt.badge && (
                  <span className="absolute top-1 left-1 bg-surface-container-lowest/85 backdrop-blur text-[9px] px-1.5 py-0.5 rounded-full text-on-surface font-bold">
                    {alt.badge}
                  </span>
                )}
              </div>
              <h4 className="text-[11px] font-bold text-on-surface truncate">{alt.shortTitle}</h4>
              <span className="text-[11px] text-primary font-bold mt-0.5 tabular-nums">
                ${alt.price.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => handleEquipAlternative(alt.id)}
                className="mt-2 w-full py-1.5 bg-surface-container hover:bg-primary-fixed text-primary rounded-full text-[10px] font-bold transition-colors active:scale-95"
              >
                Try On
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Style as Family Ensemble Trigger Banner */}
      <div className="px-5 mt-3">
        <div className="bg-gradient-to-r from-primary-fixed via-surface-container-high to-secondary-fixed p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-2xl">diversity_1</span>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-on-surface">Style as Family Ensemble?</h4>
              <p className="text-[11px] text-on-surface-variant">
                {familyAvatars.filter((f) => f.synced).length} of {familyAvatars.length} family
                avatars synced
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFamilyOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary text-[11px] font-bold shadow-sm hover:opacity-95 whitespace-nowrap active:scale-95 transition-transform"
          >
            Match All
          </button>
        </div>
      </div>

      {/* Bottom Action Tray */}
      <div className="px-5 mt-5">
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-on-surface-variant">Full Set Total:</span>
              <span className="font-display text-[18px] text-on-surface font-bold tabular-nums">
                ${bundleTotal.toFixed(2)}
              </span>
              <span className="text-[10px] text-secondary font-semibold bg-secondary-container/60 px-2 py-0.5 rounded-full">
                Save ${bundleSave} Bundle
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="text-[11px] text-primary flex items-center gap-0.5 hover:underline font-bold"
            >
              <span className="material-symbols-outlined text-[15px]">splitscreen</span> Compare
              Look
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={handleSaveLook}
              className="col-span-2 py-3 rounded-full bg-surface-container-high text-on-surface font-bold text-[13px] flex items-center justify-center gap-1.5 hover:bg-surface-variant transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">bookmark_border</span>
              <span>Save Look</span>
            </button>
            <button
              type="button"
              onClick={handleAddOutfitToBag}
              className="col-span-3 py-3 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(103,81,141,0.35)] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
              <span>Add Outfit to Bag</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Body Measurements Modal */}
      {isEditBodyOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleSaveBody}
            className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Edit 3D Avatar Measurements
              </h3>
              <button
                type="button"
                onClick={() => setEditBodyOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-on-surface block mb-1">
                  Height Preset
                </label>
                <select
                  value={draftHeight}
                  onChange={(e) => setDraftHeight(e.target.value)}
                  className="w-full rounded-full bg-surface-container-low px-4 py-2.5 text-[13px] text-on-surface outline-none"
                >
                  <option value={'5\'2" (157 cm)'}>5&apos;2&quot; (157 cm)</option>
                  <option value={'5\'4" (163 cm)'}>5&apos;4&quot; (163 cm)</option>
                  <option value={'5\'7" (170 cm)'}>5&apos;7&quot; (170 cm)</option>
                  <option value={'5\'10" (178 cm)'}>5&apos;10&quot; (178 cm)</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-on-surface block mb-1">
                  Silhouette Drape
                </label>
                <select
                  value={draftSilhouette}
                  onChange={(e) => setDraftSilhouette(e.target.value)}
                  className="w-full rounded-full bg-surface-container-low px-4 py-2.5 text-[13px] text-on-surface outline-none"
                >
                  <option value="Petite Silhouette">Petite Silhouette</option>
                  <option value="Balanced Classic">Balanced Classic</option>
                  <option value="Relaxed Oversized">Relaxed Oversized</option>
                  <option value="Tall & Flowy">Tall &amp; Flowy</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-on-surface block mb-1">
                  Skin Tone Calibration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Warm Fair', hex: '#E8C3B9' },
                    { name: 'Golden Neutral', hex: '#DFB195' },
                    { name: 'Rich Cocoa', hex: '#8F624D' },
                  ].map((tone) => (
                    <button
                      key={tone.name}
                      type="button"
                      onClick={() => {
                        setDraftSkinTone(tone.name);
                        setDraftSkinHex(tone.hex);
                      }}
                      className={`p-2 rounded-2xl flex items-center gap-1.5 text-[11px] font-semibold ${
                        draftSkinTone === tone.name
                          ? 'bg-primary-fixed ring-2 ring-primary text-on-primary-fixed'
                          : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span className="truncate">{tone.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Apply to 3D Stage
            </button>
          </form>
        </div>
      )}

      {/* Family Avatar Sync Modal */}
      {isFamilyOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Family Ensemble Sync
              </h3>
              <button
                type="button"
                onClick={() => setFamilyOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {familyAvatars.map((member) => (
                <div
                  key={member.id}
                  className="bg-surface-container-lowest p-3 rounded-2xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-on-surface"
                      style={{ backgroundColor: member.skinHex }}
                    >
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-on-surface">
                        {member.name} ({member.role})
                      </p>
                      <p className="text-[11px] text-outline">
                        {member.height} • {member.silhouette}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFamilyMemberSync(member.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      member.synced
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {member.synced ? 'Synced ✓' : 'Sync'}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setFamilyOpen(false);
                showToast('Pastel Lilac palette synced across family avatars!');
              }}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Done Syncing
            </button>
          </div>
        </div>
      )}

      {/* Compare Look Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Chibi vs Real Mannequin Compare
              </h3>
              <button
                type="button"
                onClick={() => setCompareOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low rounded-2xl p-2 text-center">
                <SmartImage
                  src={ASSETS.chibiTryOnStage}
                  alt="Chibi Avatar"
                  className="w-full aspect-[3/4] object-contain rounded-xl"
                />
                <span className="text-[11px] font-bold text-primary block mt-1.5">
                  Chibi Avatar (96% Match)
                </span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-2 text-center">
                <SmartImage
                  src={ASSETS.authOnboardingPreview}
                  alt="Mannequin Scale"
                  className="w-full aspect-[3/4] object-cover rounded-xl contrast-95"
                />
                <span className="text-[11px] font-bold text-secondary block mt-1.5">
                  Proportional Drape
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
