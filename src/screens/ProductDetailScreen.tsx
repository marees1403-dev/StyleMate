import React, { useEffect, useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';

export const ProductDetailScreen: React.FC = () => {
  const {
    products,
    selectedProductId,
    openProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addReviewToProduct,
    equipTryOnItem,
    navigate,
    goBack,
    showToast,
    user,
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Pastel Lilac');
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0] || 'S');
  const [audiencePreview, setAudiencePreview] = useState<'women' | 'men' | 'kids'>(
    product.audience === 'men' ? 'men' : product.audience === 'kids' ? 'kids' : 'women'
  );
  const [isZoomOpen, setZoomOpen] = useState(false);
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isReviewsOpen, setReviewsOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setGalleryIndex(0);
    setSelectedColor(product.colors[0]?.name || 'Pastel Lilac');
    setSelectedSize(
      product.sizes.includes('S')
        ? 'S'
        : product.sizes[Math.min(1, product.sizes.length - 1)] || 'One Size'
    );
    setAudiencePreview(
      product.audience === 'men' ? 'men' : product.audience === 'kids' ? 'kids' : 'women'
    );
  }, [product.id]);

  const galleryImages = product.gallery.length > 0 ? product.gallery : [product.image];
  const currentImage = galleryImages[galleryIndex] || product.image;
  const wishlisted = isWishlisted(product.id);
  const sizeStock = product.stockBySize[selectedSize] ?? 0;
  const totalStock = Object.values(product.stockBySize).reduce((s, n) => s + n, 0);

  const companionItems = products.filter((p) => p.id !== product.id).slice(0, 4);

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(product.originalPrice - product.price)
      : null;

  const handleShare = async () => {
    const shareText = `Check out ${product.title} ($${product.price.toFixed(2)}) on StyleMate AI!`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
      showToast('Product link copied for family sharing!');
    } catch {
      showToast('Ready to share with your family capsule!');
    }
  };

  const handleTryOnAvatar = () => {
    const slot =
      product.category === 'Bottoms'
        ? 'bottom'
        : product.category === 'Shoes'
          ? 'shoes'
          : product.category === 'Bags' || product.category === 'Accessories'
            ? 'bag'
            : 'top';
    equipTryOnItem(slot, product.id);
    navigate('tryon');
  };

  const handleAddToBag = () => {
    if (totalStock <= 0) {
      showToast('Currently sold out — saved to drop alert watchlist!', 'error');
      return;
    }
    addToCart(product, {
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      matchTag:
        audiencePreview === 'kids'
          ? 'Kids Duo Match'
          : audiencePreview === 'men'
            ? 'Men Mini-Me Match'
            : product.demandTag,
    });
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1400);
  };

  const handleBuyNow = () => {
    if (totalStock <= 0) {
      showToast('This item is sold out. Please pick another pastel piece!', 'error');
      return;
    }
    addToCart(product, {
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      matchTag: product.demandTag,
    });
    navigate('cart');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim().length < 8) {
      setReviewError('Please share at least 8 characters about fit or fabric feel.');
      return;
    }
    setReviewError('');
    addReviewToProduct(product.id, user.name || 'Mia J.', reviewRating, reviewComment.trim(), selectedSize);
    setReviewComment('');
    setReviewRating(5);
  };

  const fitAdviceByAudience =
    audiencePreview === 'men'
      ? `Relaxed boxy cut matched to Dad/Partner capsule • Fits ${selectedSize} cleanly.`
      : audiencePreview === 'kids'
        ? `Soft doll-scale toddler proportions • Easy snap cuffs & breathable cotton.`
        : product.fitAdvice;

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Floating Actions & Navigation Pills */}
      <div className="px-5 pt-2 pb-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 bg-surface-container-high/85 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-primary text-sm material-symbols-filled">
            auto_awesome
          </span>
          <span className="text-[11px] font-semibold text-primary">Family Capsule Match</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Favorite"
            onClick={() => toggleWishlist(product.id)}
            className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-secondary active:scale-90 transition-transform"
          >
            <span
              className={`material-symbols-outlined text-xl transition-transform ${
                wishlisted ? 'material-symbols-filled scale-110' : ''
              }`}
            >
              favorite
            </span>
          </button>
          <button
            type="button"
            aria-label="Share"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">share</span>
          </button>
        </div>
      </div>

      {/* Hero Image Carousel Container */}
      <div className="px-5 relative">
        <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-b from-surface-container to-surface-container-low shadow-[0_8px_24px_rgba(103,81,141,0.12)]">
          <SmartImage
            src={currentImage}
            alt={product.title}
            className="w-full h-full object-cover cursor-zoom-in transition-all duration-300"
            onClick={() => setZoomOpen(true)}
          />

          {/* Left/Right carousel touch arrows when multiple images exist */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => setGalleryIndex((i) => (i + 1) % galleryImages.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </>
          )}

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            {product.badge && (
              <div className="flex items-center gap-1.5 bg-secondary text-on-secondary px-3 py-1 rounded-full shadow-md">
                <span className="material-symbols-outlined text-xs">local_fire_department</span>
                <span className="text-[11px] font-bold tracking-wide uppercase">
                  {product.badge}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md text-primary px-3 py-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-xs material-symbols-filled">
                view_in_ar
              </span>
              <span className="text-[11px] font-semibold">3D Avatar Ready</span>
            </div>
          </div>

          {/* Quick Family Match Badge */}
          <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-1.5 rounded-full shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAudiencePreview('kids')}
              className="px-2 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold"
            >
              Kids
            </button>
            <button
              type="button"
              onClick={() => setAudiencePreview('men')}
              className="px-2 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-[10px] font-bold"
            >
              Men
            </button>
          </div>

          {/* Carousel Dots & Zoom Hint */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="bg-surface-container-lowest/85 backdrop-blur-md px-2.5 py-1 rounded-full text-on-surface-variant text-[11px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-xs">zoom_in</span> Tap to zoom
            </button>
            <div className="flex items-center gap-1.5 bg-surface-container-lowest/85 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setGalleryIndex(idx)}
                  className={`rounded-full transition-all ${
                    galleryIndex === idx
                      ? 'w-3 h-2 bg-primary'
                      : 'w-2 h-2 bg-outline-variant hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Title & Price Section */}
      <div className="px-5 mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-primary tracking-wide uppercase font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            {product.series}
          </span>
          <span className="text-[11px] text-secondary bg-secondary-fixed px-2.5 py-0.5 rounded-full font-bold">
            {totalStock > 0 ? product.shipsIn || 'Ships in 24h' : 'Waitlist Open'}
          </span>
        </div>

        <h2 className="font-display text-[23px] font-bold text-on-surface tracking-tight leading-snug">
          {product.title}
        </h2>

        {/* Rating & Match Meter */}
        <div className="flex items-center flex-wrap gap-2 mt-0.5">
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            className="flex items-center gap-1 bg-surface-container-high px-2.5 py-0.5 rounded-full active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-secondary text-sm material-symbols-filled">
              star
            </span>
            <span className="text-[12px] text-on-surface font-bold tabular-nums">
              {product.rating.toFixed(1)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            className="text-[12px] text-outline hover:text-primary underline-offset-2 hover:underline"
          >
            ({product.reviewCount} reviews)
          </button>
          <span className="w-1 h-1 rounded-full bg-outline-variant" />
          <span className="text-[11px] text-primary font-bold bg-primary-fixed/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">thumb_up</span>
            {product.matchScore}% AI Match
          </span>
        </div>

        {/* Price Header */}
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="font-display text-[26px] text-primary font-bold tabular-nums">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-[14px] text-outline line-through tabular-nums">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          {savingsAmount && (
            <span className="text-[11px] text-secondary bg-secondary-container px-2.5 py-0.5 rounded-full font-bold">
              Save ${savingsAmount}
            </span>
          )}
        </div>
        <p className="text-[13px] text-on-surface-variant leading-relaxed mt-0.5">
          {product.description}
        </p>
      </div>

      {/* Demographic & Family Coordination Switcher */}
      <div className="px-5 mt-4">
        <div className="bg-surface-container p-1 rounded-full flex items-center justify-between text-center">
          <button
            type="button"
            onClick={() => setAudiencePreview('women')}
            className={`flex-1 py-2 rounded-full text-[12px] font-semibold transition-all flex items-center justify-center gap-1 ${
              audiencePreview === 'women'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">female</span> Women
          </button>
          <button
            type="button"
            onClick={() => setAudiencePreview('men')}
            className={`flex-1 py-2 rounded-full text-[12px] font-semibold transition-all flex items-center justify-center gap-1 ${
              audiencePreview === 'men'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">male</span> Men{' '}
            <span className="text-[10px] bg-surface-container-high px-1.5 rounded-full text-primary font-bold">
              Mini-Me
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAudiencePreview('kids')}
            className={`flex-1 py-2 rounded-full text-[12px] font-semibold transition-all flex items-center justify-center gap-1 ${
              audiencePreview === 'kids'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">child_care</span> Kids{' '}
            <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed px-1.5 rounded-full font-bold">
              Duo
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Selectors (Color & Size) */}
      <div className="px-5 mt-4 flex flex-col gap-4">
        {/* Color Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-on-surface">
              Color Palette: <span className="text-primary">{selectedColor}</span>
            </span>
            <span className="text-[11px] text-outline font-semibold">
              {product.colors.length} Whimsical Shades
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {product.colors.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm transition-all active:scale-95 shrink-0 ${
                    active ? 'ring-2 ring-primary text-on-surface font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-inner border border-outline-variant/40"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px]">{c.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selector & AI Sizing */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-on-surface">Select Size</span>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="flex items-center gap-1 text-primary text-[11px] font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">straighten</span> Smart Size Guide
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {product.sizes.map((size) => {
              const active = selectedSize === size;
              const stock = product.stockBySize[size] ?? 0;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] px-3 h-11 rounded-full flex items-center justify-center text-[12px] transition-all active:scale-95 ${
                    active
                      ? 'bg-primary text-on-primary shadow-md font-bold'
                      : stock === 0
                        ? 'bg-surface-container text-outline line-through opacity-70'
                        : 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* AI Fit Confidence Box */}
          <div className="bg-surface-container-low p-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base">check_circle</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] text-on-surface font-semibold">
                  AI Fit Prediction: {product.fitConfidence}% true to size
                  {sizeStock > 0 && sizeStock <= 5 && (
                    <span className="ml-1.5 text-secondary font-bold">({sizeStock} left!)</span>
                  )}
                </span>
                <span className="text-[12px] text-outline">{fitAdviceByAudience}</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Open Smart Size Guide"
              onClick={() => setSizeGuideOpen(true)}
              className="text-outline hover:text-primary p-1"
            >
              <span className="material-symbols-outlined text-base">info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Interactive 3D Avatar CTA Banner */}
      <div className="px-5 mt-5">
        <div
          onClick={handleTryOnAvatar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleTryOnAvatar()}
          className="cursor-pointer relative overflow-hidden bg-gradient-to-r from-primary to-primary-container p-4 rounded-3xl shadow-[0_8px_24px_rgba(103,81,141,0.25)] text-on-primary flex items-center justify-between active:scale-[0.99] transition-transform"
        >
          <div className="flex flex-col gap-1 max-w-[70%] z-10">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full w-max">
              <span className="material-symbols-outlined text-xs">auto_fix_high</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Virtual Fitting</span>
            </div>
            <span className="font-display text-[18px] font-bold leading-tight">
              Try on My 3D Avatar
            </span>
            <span className="text-[12px] text-primary-fixed opacity-95">
              See live drape &amp; sync with kids&apos; outfits
            </span>
          </div>
          <div className="z-10 w-14 h-14 rounded-full bg-surface-container-lowest text-primary shadow-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl material-symbols-filled">
              checkroom
            </span>
          </div>
          <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Why You May Like This */}
      <div className="px-5 mt-4">
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-xl">lightbulb</span>
            <span className="text-[14px] font-bold">Why you may like this</span>
          </div>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">{product.aiReason}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-container px-2.5 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Complete The Look Carousel */}
      <div className="mt-5 flex flex-col gap-2.5">
        <div className="px-5 flex items-center justify-between">
          <h3 className="font-display text-[18px] text-on-surface font-bold">Complete the Look</h3>
          <button
            type="button"
            onClick={() => navigate('pair')}
            className="text-[12px] text-primary font-semibold hover:underline"
          >
            Bundle &amp; Save 15%
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar pb-2">
          {companionItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openProduct(item.id)}
              className="min-w-[148px] max-w-[148px] bg-surface-container-lowest p-2.5 rounded-2xl shadow-sm flex flex-col gap-2 text-left active:scale-95 transition-transform"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container">
                <SmartImage
                  src={item.image}
                  alt={item.shortTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col w-full">
                <span className="text-[12px] text-on-surface font-semibold truncate">
                  {item.shortTitle}
                </span>
                <span className="text-[12px] text-primary font-bold tabular-nums">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Reviews Card */}
      <div className="px-5 mt-3">
        <div className="bg-surface-container-lowest p-4 rounded-3xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-lg material-symbols-filled">
                verified
              </span>
              <span className="text-[14px] font-bold text-on-surface">
                100% Verified Fit Rating
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReviewsOpen(true)}
              className="text-[11px] text-primary font-semibold hover:underline"
            >
              View All {product.reviewCount}
            </button>
          </div>

          {product.reviews[0] ? (
            <div className="bg-surface-container-low p-3 rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
                    {product.reviews[0].author[0]}
                  </div>
                  <span className="text-[12px] font-bold text-on-surface">
                    {product.reviews[0].author}
                  </span>
                  <span className="text-[11px] text-outline">Verified Buyer</span>
                </div>
                <div className="flex text-secondary">
                  {Array.from({ length: product.reviews[0].rating }).map((_, idx) => (
                    <span
                      key={idx}
                      className="material-symbols-outlined text-xs material-symbols-filled"
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant italic leading-relaxed">
                “{product.reviews[0].comment}”
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReviewsOpen(true)}
              className="bg-surface-container-low p-3 rounded-2xl text-left text-[12px] text-primary font-semibold flex items-center justify-between"
            >
              <span>Be the first to leave a verified 3D fit note!</span>
              <span className="material-symbols-outlined text-base">rate_review</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Docked Thumb Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-30 mt-6 bg-surface/92 backdrop-blur-xl px-5 py-3 pb-safe shadow-[0_-8px_32px_rgba(45,37,58,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col min-w-max pr-1">
            <span className="text-[10px] text-outline font-semibold">Total Price</span>
            <span className="font-display text-[20px] text-primary font-bold leading-none tabular-nums">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddToBag}
            className={`flex-1 py-3.5 px-3 rounded-full font-bold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm ${
              addedFeedback
                ? 'bg-primary-fixed text-primary'
                : 'bg-secondary-container text-on-secondary-container'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {addedFeedback ? 'check' : 'shopping_bag'}
            </span>
            <span>{addedFeedback ? 'Added!' : 'Add to Bag'}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-3.5 px-3 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-[0_8px_20px_rgba(103,81,141,0.3)]"
          >
            <span className="material-symbols-outlined text-lg">flash_on</span>
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-surface/85 backdrop-blur-md flex flex-col items-center justify-center p-5"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            aria-label="Close Zoom"
            onClick={() => setZoomOpen(false)}
            className="self-end mb-3 w-10 h-10 rounded-full bg-surface text-on-surface flex items-center justify-center shadow-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div
            className="w-full max-w-[400px] aspect-[4/5] rounded-3xl overflow-hidden bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SmartImage src={currentImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <p className="text-[12px] text-inverse-on-surface mt-3 font-semibold">
            {product.shortTitle} • {selectedColor}
          </p>
        </div>
      )}

      {/* Smart Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">straighten</span>
                <h3 className="font-display text-[18px] font-bold text-on-surface">
                  Smart Doll-Scale Size Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Matched to your saved profile ({user.height}, {user.silhouette}):
            </p>
            <div className="bg-surface-container-low rounded-2xl p-3 text-[12px] space-y-2">
              <div className="grid grid-cols-4 font-bold text-primary pb-1 border-b border-outline-variant/40">
                <span>Size</span>
                <span>Chest</span>
                <span>Length</span>
                <span>Fit</span>
              </div>
              {[
                ['XS', '34-36"', '21.5"', 'Snug'],
                ['S', '37-39"', '22.5"', 'Recommended ✨'],
                ['M', '40-42"', '23.5"', 'Relaxed'],
                ['L', '43-45"', '24.5"', 'Oversized'],
              ].map((row) => (
                <div key={row[0]} className="grid grid-cols-4 text-on-surface py-0.5">
                  <span className="font-bold">{row[0]}</span>
                  <span>{row[1]}</span>
                  <span>{row[2]}</span>
                  <span className={row[0] === 'S' ? 'text-secondary font-bold' : ''}>
                    {row[3]}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Verified Reviews Drawer Modal */}
      {isReviewsOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="w-full max-w-[440px] max-h-[85dvh] bg-surface rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[18px] font-bold text-on-surface">
                  Verified Reviews ({product.reviewCount})
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Rated {product.rating.toFixed(1)}/5.0 for physical-to-3D accuracy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewsOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-bold text-on-surface">
                      {rev.author} • Size {rev.sizeBought}
                    </span>
                    <span className="text-[11px] text-outline">{rev.date}</span>
                  </div>
                  <div className="flex text-secondary mb-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-xs material-symbols-filled"
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] text-on-surface-variant">{rev.comment}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmitReview}
              className="bg-surface-container-low p-3.5 rounded-2xl space-y-2.5 mt-1"
            >
              <span className="text-[12px] font-bold text-on-surface block">
                Add Your Fit Review (Size {selectedSize})
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={star <= reviewRating ? 'text-secondary' : 'text-outline-variant'}
                  >
                    <span className="material-symbols-outlined text-xl material-symbols-filled">
                      star
                    </span>
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How did the fabric drape and pastel shade match your expectations?"
                className="w-full rounded-2xl bg-surface-container-lowest p-3 text-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary"
              />
              {reviewError && <p className="text-[11px] text-error font-semibold">{reviewError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-primary text-on-primary text-[12px] font-bold"
              >
                Post Verified Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
