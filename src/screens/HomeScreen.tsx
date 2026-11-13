import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';
import { Audience } from '../types';
import { SmartImage } from '../components/SmartImage';

export const HomeScreen: React.FC = () => {
  const {
    user,
    setAudienceFocus,
    products,
    openProduct,
    addToCart,
    addCustomCartItems,
    toggleWishlist,
    isWishlisted,
    navigate,
    setChatOpen,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const segments: { key: Audience; label: string; isAi?: boolean }[] = [
    { key: 'women', label: 'Women' },
    { key: 'men', label: 'Men' },
    { key: 'kids', label: 'Kids' },
    { key: 'family', label: 'Family', isAi: true },
  ];

  const categories = [
    { label: 'Tops', icon: 'checkroom', bg: 'bg-primary-fixed/50 text-primary' },
    { label: 'Bottoms', icon: 'straighten', bg: 'bg-secondary-fixed/50 text-secondary' },
    { label: 'Dresses', icon: 'styler', bg: 'bg-surface-container-high text-primary-container' },
    { label: 'Shoes', icon: 'steps', bg: 'bg-primary-fixed-dim/40 text-primary' },
    { label: 'Bags', icon: 'shopping_bag', bg: 'bg-secondary-container/60 text-secondary' },
    { label: 'Family Sets', icon: 'auto_fix_high', bg: 'bg-surface-variant text-on-surface-variant' },
  ];

  const pickedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchesAud =
        user.audienceFocus === 'family' || p.audience === user.audienceFocus || p.audience === 'family';
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesAud && matchesSearch;
    });
    return filtered.length >= 2 ? filtered.slice(0, 2) : products.slice(0, 2);
  }, [products, user.audienceFocus, searchQuery]);

  const trendingProducts = useMemo(() => {
    return [
      products.find((p) => p.id === 'prod-puffer-tote')!,
      products.find((p) => p.id === 'prod-sneakers')!,
      products.find((p) => p.id === 'prod-kids-sundress')!,
    ].filter(Boolean);
  }, [products]);

  const bundleProducts = useMemo(() => {
    return [
      { prod: products.find((p) => p.id === 'prod-men-overshirt')!, label: 'Overshirt' },
      { prod: products.find((p) => p.id === 'prod-men-slacks')!, label: 'Cream Slacks' },
      { prod: products.find((p) => p.id === 'prod-sneakers')!, label: 'Lilac Kicks' },
      { prod: products.find((p) => p.id === 'prod-heart-bag')!, label: 'Heart Bag' },
    ].filter((x) => Boolean(x.prod));
  }, [products]);

  const handleAddBundle = () => {
    addCustomCartItems(
      bundleProducts.map(({ prod }) => ({
        productId: prod.id,
        title: prod.shortTitle,
        price: prod.price,
        image: prod.image,
        color: prod.colors[0]?.name || 'Pastel',
        size: prod.sizes[1] || prod.sizes[0] || 'M',
        quantity: 1,
        audience: prod.audience,
        matchTag: 'AI Bundle Match',
        stockNote: 'Bundle Saver (15% Off)',
      }))
    );
    showToast('AI Outfit Bundle (4 pcs) added to bag with 15% savings!');
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Greeting & Search Header */}
      <div className="px-5 pt-3 pb-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-[26px] leading-[34px] text-on-surface">
                Hello, {user.name.split(' ')[0]}!
              </h1>
              <span className="text-xl">✨</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Ready to find your cozy match today?
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('feedback')}
            className="flex items-center bg-secondary-container/60 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-secondary text-sm mr-1">loyalty</span>
            <span className="text-[11px] font-semibold text-on-secondary-container tabular-nums">
              {user.stylePts.toLocaleString()} Pts
            </span>
          </button>
        </div>

        {/* Interactive Pill Category Switcher */}
        <div className="flex items-center p-1 bg-surface-container-high rounded-full shadow-sm">
          {segments.map((seg) => {
            const active = user.audienceFocus === seg.key;
            return (
              <button
                key={seg.key}
                type="button"
                onClick={() => setAudienceFocus(seg.key)}
                className={`flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-all text-center flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{seg.label}</span>
                {seg.isAi && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      active
                        ? 'bg-white/25 text-on-primary'
                        : 'bg-secondary-container text-secondary'
                    }`}
                  >
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Soft Pill Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate('discover');
          }}
          className="relative flex items-center w-full"
        >
          <span className="material-symbols-outlined absolute left-3.5 text-tertiary text-xl pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dresses, pastel knitwear, sneakers..."
            className="w-full pl-10 pr-20 py-2.5 rounded-full bg-surface-container text-[12px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              aria-label="Voice search"
              onClick={() => {
                setSearchQuery('Lilac');
                showToast('Voice filter applied: "Lilac" pastel picks');
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-lg">mic</span>
            </button>
            <button
              type="button"
              aria-label="Visual camera search"
              onClick={() => navigate('tryon')}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-fixed text-on-primary-fixed hover:bg-primary hover:text-on-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">photo_camera</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Category Bubbles */}
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center gap-3 px-5 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => navigate('discover')}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`w-14 h-14 rounded-full ${cat.bg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <span className="text-[11px] font-semibold text-on-surface">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured 3D Virtual Fitting Banner */}
      <div className="px-5 my-3">
        <div className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-r from-primary-fixed via-surface-container to-secondary-fixed/50 p-4 shadow-sm flex items-center justify-between">
          <div className="flex-1 pr-2 z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary text-[11px] font-semibold shadow-sm mb-1.5">
              <span className="material-symbols-outlined text-xs">arrows_outward</span>
              <span>New AI Feature</span>
            </div>
            <h2 className="font-display font-semibold text-[18px] leading-tight text-on-surface">
              3D Virtual Fitting Room
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-1 mb-3 line-clamp-2">
              Preview real-time drape, family color palettes, and matching chibi outfits instantly!
            </p>
            <button
              type="button"
              onClick={() => navigate('tryon')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-[12px] font-semibold shadow-md active:scale-95 transition-transform"
            >
              <span>Try Outfits in 3D</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="w-24 h-24 rounded-full bg-surface-container-lowest/80 p-1 shadow-sm flex items-center justify-center shrink-0 relative overflow-hidden">
            <SmartImage
              src={ASSETS.chibiBanner3D}
              alt="Chibi 3D family doll avatars wearing matching pastel lavender and cream outfits"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute -top-0.5 -right-0.5 text-base">✨</span>
          </div>
        </div>
      </div>

      {/* Picked for You */}
      <div className="px-5 mt-3 mb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="font-display font-semibold text-[20px] text-on-surface">
              Picked for You
            </h2>
            <span className="text-[11px] bg-primary-fixed text-primary px-2 py-0.5 rounded-full font-semibold">
              AI Match
            </span>
          </div>
          <p className="text-[12px] text-on-surface-variant">
            Tuned to your {user.aesthetics[0]?.toLowerCase() || 'soft pastel'} &amp; casual preferences
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('discover')}
          className="text-[12px] font-semibold text-primary flex items-center hover:underline"
        >
          View All
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      {/* Dual Column Recommendations */}
      <div className="px-5 grid grid-cols-2 gap-4 mb-5">
        {pickedProducts.map((product, index) => {
          const liked = isWishlisted(product.id);
          return (
            <div
              key={product.id}
              onClick={() => openProduct(product.id)}
              className="flex flex-col bg-surface-container-lowest rounded-[2rem] p-2.5 shadow-sm relative group cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-low mb-2">
                <SmartImage
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackLabel={product.shortTitle}
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-xs flex items-center gap-0.5 ${
                    index === 0 ? 'bg-primary/90 text-on-primary' : 'bg-secondary/90 text-on-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[10px]">auto_awesome</span>{' '}
                  {product.matchScore}% Match
                </span>
                <button
                  type="button"
                  aria-label="Save to wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-xs flex items-center justify-center shadow-sm active:scale-90 transition-transform ${
                    liked ? 'text-secondary' : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-base ${
                      liked ? 'material-symbols-filled' : ''
                    }`}
                  >
                    favorite
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-[13px] font-bold text-on-surface truncate">
                  {product.shortTitle}
                </h3>
                <span className="text-[12px] font-semibold text-primary shrink-0 tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-tertiary mt-0.5 line-clamp-1">
                {index === 0
                  ? 'Matches your love for pastel textures'
                  : 'Pairs with 4 tops in your saved closet'}
              </p>
              <div className="mt-2 flex items-center justify-between pt-1">
                <div className="flex items-center text-secondary text-xs">
                  <span className="material-symbols-outlined text-sm text-amber-500 material-symbols-filled">
                    star
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface-variant ml-0.5 tabular-nums">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Add ${product.shortTitle} to bag`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed hover:bg-primary hover:text-on-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete the Look (AI Outfit Bundle) */}
      <div className="px-5 my-3">
        <div className="bg-surface-container-low rounded-[2rem] p-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-lg">checkroom</span>
              </div>
              <div>
                <h2 className="font-display font-semibold text-[18px] text-on-surface leading-snug">
                  AI Outfit Bundle
                </h2>
                <span className="text-[11px] font-semibold text-primary">
                  Harmonized Color Harmony (Save 15%)
                </span>
              </div>
            </div>
            <span className="text-[12px] font-semibold bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full shrink-0 tabular-nums">
              -$25.50 OFF
            </span>
          </div>

          {/* 4-Piece Bundle Strip */}
          <div className="grid grid-cols-4 gap-2 mb-3.5">
            {bundleProducts.map(({ prod, label }) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => openProduct(prod.id)}
                className="flex flex-col items-center group"
              >
                <div className="w-full aspect-square rounded-2xl bg-surface-container-lowest p-1 shadow-xs overflow-hidden">
                  <SmartImage
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[10px] font-semibold text-on-surface truncate mt-1 w-full text-center">
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[11px] text-on-surface-variant line-through tabular-nums">
                $170.50
              </span>
              <div className="font-display text-[18px] text-primary font-bold leading-none tabular-nums">
                $145.00
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('tryon')}
                className="px-3 py-2 rounded-full bg-surface-container text-on-surface text-[12px] font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrows_outward</span>
                <span>3D Try</span>
              </button>
              <button
                type="button"
                onClick={handleAddBundle}
                className="px-4 py-2 rounded-full bg-primary text-on-primary text-[12px] font-semibold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                <span>Add Bundle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending This Week */}
      <div className="mt-4">
        <div className="px-5 flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <h2 className="font-display font-semibold text-[20px] text-on-surface">
              Trending This Week
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-secondary bg-secondary-fixed/50 px-2.5 py-0.5 rounded-full">
            Top 10
          </span>
        </div>
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3 px-5 min-w-max">
            {trendingProducts.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openProduct(item.id)}
                className="w-44 bg-surface-container-lowest rounded-[2rem] p-2.5 shadow-sm flex flex-col group cursor-pointer"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container-low mb-2">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      idx === 1
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-primary-fixed text-on-primary-fixed'
                    }`}
                  >
                    {item.badge || item.demandTag}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-on-surface truncate">
                  {item.shortTitle}
                </h3>
                <p className="text-[11px] text-tertiary">
                  {idx === 0
                    ? '1.8k tried this week'
                    : idx === 1
                      ? '94% Family Match'
                      : "Matches Mia's avatar"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-sm text-primary font-bold tabular-nums">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Quick add ${item.shortTitle}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI StyleMate Floating Quick-Consultation Banner */}
      <div className="px-5 mt-4">
        <div className="bg-gradient-to-r from-secondary-container/50 via-surface-container-high to-primary-fixed/40 rounded-[2rem] p-3.5 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-on-surface">Need quick outfit advice?</h4>
              <p className="text-[12px] text-on-surface-variant">
                Ask StyleMate to pair items from your bag
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-primary text-[12px] font-semibold shadow-sm hover:bg-primary hover:text-on-primary transition-colors shrink-0"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
};
