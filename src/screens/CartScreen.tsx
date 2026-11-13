import React from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';

export const CartScreen: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    bundleDiscount,
    wishlistIds,
    products,
    updateCartQty,
    removeCartItem,
    moveCartItemToWishlist,
    addToCart,
    openProduct,
    navigate,
    showToast,
  } = useApp();

  const total = Math.max(0, Number((cartSubtotal - bundleDiscount).toFixed(2)));
  const itemsNeededForBundle = Math.max(0, 3 - cartCount);

  const crossSellIds = ['prod-heart-bag', 'prod-pearl-ribbons', 'prod-kids-pinafore'];
  const crossSellItems = crossSellIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleShareCart = async () => {
    const summary = cart.map((c) => `${c.quantity}x ${c.title} ($${c.price.toFixed(2)})`).join(', ');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`My StyleMate Family Bag: ${summary} — Total $${total.toFixed(2)}`);
      }
      showToast('Bag summary copied to share with family!');
    } catch {
      showToast('Bag summary ready to share!');
    }
  };

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Dynamic Bundle Notification Banner */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-gradient-to-r from-secondary-container via-surface-container-high to-primary-fixed/60 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-xl material-symbols-filled">
                auto_awesome
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-secondary uppercase tracking-wider font-bold">
                  {bundleDiscount > 0 ? 'Bundle Unlocked!' : 'Bundle Saver'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-[11px] text-on-surface-variant font-medium">
                  15% Off 3+ Pieces
                </span>
              </div>
              <p className="text-[12px] text-on-surface font-semibold truncate">
                {bundleDiscount > 0
                  ? `Family Capsule Savings: -$${bundleDiscount.toFixed(2)}`
                  : `Add ${itemsNeededForBundle} more piece${itemsNeededForBundle === 1 ? '' : 's'} to unlock 15% Off`}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-surface/90 text-secondary text-[11px] rounded-full font-bold shadow-sm shrink-0">
            {bundleDiscount > 0 ? 'Active' : `${cartCount}/3`}
          </span>
        </div>
      </div>

      {/* Cart Header Sub-status */}
      <div className="px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-[18px] text-on-surface font-bold">Your Bag</span>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold tabular-nums">
            {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('profile')}
          className="text-secondary text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-base material-symbols-filled">
            favorite
          </span>
          Saved ({wishlistIds.length})
        </button>
      </div>

      {/* Empty State or Cart Items List */}
      {cart.length === 0 ? (
        <div className="px-5 py-8">
          <div className="bg-surface-container-lowest rounded-3xl p-7 text-center shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">shopping_bag</span>
            </div>
            <h2 className="font-display text-[20px] font-bold text-on-surface">
              Your pastel bag is empty
            </h2>
            <p className="text-[13px] text-on-surface-variant max-w-[260px] mx-auto">
              Explore soft knitwear, wide-leg trousers, and family twinning pieces to unlock 15%
              bundle savings.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('discover')}
                className="px-5 py-3 rounded-full bg-primary text-on-primary text-[13px] font-bold shadow-md active:scale-95 transition-transform"
              >
                Explore Catalog
              </button>
              <button
                type="button"
                onClick={() => navigate('pair')}
                className="px-4 py-3 rounded-full bg-secondary-container text-on-secondary-container text-[13px] font-bold active:scale-95 transition-transform"
              >
                AI Outfit Pair
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3.5 mt-1">
          {cart.map((item, idx) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.10)] flex flex-col gap-3"
            >
              <div className="flex gap-3.5">
                <div
                  onClick={() => openProduct(item.productId)}
                  className="relative w-24 h-28 rounded-xl bg-surface-container-low overflow-hidden shrink-0 cursor-pointer"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                      idx === 0
                        ? 'bg-primary text-on-primary'
                        : idx === 1
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-tertiary-container text-on-tertiary'
                    }`}
                  >
                    {idx === 0 ? 'AI Pick' : idx === 1 ? 'Twinning' : 'Core Fit'}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h2
                        onClick={() => openProduct(item.productId)}
                        className="font-display text-[15px] text-on-surface font-bold truncate cursor-pointer hover:text-primary"
                      >
                        {item.title}
                      </h2>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeCartItem(item.id)}
                        className="text-outline-variant hover:text-error active:scale-90 transition-all p-0.5"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                      Color: <span className="text-on-surface font-medium">{item.color}</span> •
                      Size: <span className="text-on-surface font-medium">{item.size}</span>
                    </p>
                    <div className="inline-flex items-center gap-1 mt-1.5 bg-surface-container px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-secondary text-xs material-symbols-filled">
                        favorite
                      </span>
                      <span className="text-[10px] text-secondary font-bold">{item.matchTag}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="font-display text-[17px] text-primary font-bold tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center bg-surface-container-high rounded-full p-1 gap-2 shadow-inner">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-on-surface active:scale-90 shadow-sm transition-transform"
                      >
                        <span className="material-symbols-outlined text-xs">remove</span>
                      </button>
                      <span className="text-[12px] font-bold text-on-surface px-1 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 shadow-sm transition-transform"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => moveCartItemToWishlist(item.id)}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-primary text-[11px] font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">bookmark_border</span>
                  Move to Wishlist
                </button>
                <span className="text-[11px] text-secondary font-semibold bg-secondary-container/50 px-2.5 py-0.5 rounded-full">
                  {item.stockNote}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Benefit Card */}
      <div className="px-5 mt-4">
        <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl">local_shipping</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[13px] text-primary font-bold">
                Free Express Delivery
              </span>
              <span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                Qualified
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Estimated arrival:{' '}
              <span className="text-on-surface font-semibold">2-3 business days</span> to your
              door.
            </p>
          </div>
        </div>
      </div>

      {/* Complete the Family Look Cross-Sell Shelf */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="px-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-lg material-symbols-filled">
              auto_fix_high
            </span>
            <h3 className="font-display text-[16px] text-on-surface font-bold">
              Complete the Family Look
            </h3>
          </div>
          <span className="text-[11px] text-secondary font-bold">Bundle Specials</span>
        </div>

        <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar pb-2">
          {crossSellItems.map((prod) => (
            <div
              key={prod.id}
              className="w-44 shrink-0 bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_14px_rgba(157,133,197,0.08)] flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => openProduct(prod.id)}
                  className="relative w-full h-32 rounded-xl bg-surface-container-low overflow-hidden mb-2 cursor-pointer"
                >
                  <SmartImage
                    src={prod.image}
                    alt={prod.shortTitle}
                    className="w-full h-full object-cover"
                  />
                  {prod.badge && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[9px] font-bold shadow-sm">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-display text-[13px] text-on-surface font-bold truncate">
                  {prod.shortTitle}
                </h4>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {prod.colors[0]?.name}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="font-display text-[14px] text-primary font-bold tabular-nums">
                  ${prod.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => addToCart(prod)}
                  className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold flex items-center gap-0.5 active:scale-95 transition-transform shadow-sm"
                >
                  <span className="material-symbols-outlined text-xs">add</span> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary Card */}
      {cart.length > 0 && (
        <div className="px-5 mt-4 mb-2">
          <div className="bg-surface-container-low rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[16px] text-on-surface font-bold">Order Summary</h3>
              {bundleDiscount > 0 && (
                <span className="text-[11px] text-secondary font-bold bg-secondary-container px-2.5 py-0.5 rounded-full">
                  Bundle Applied
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1 text-[12px]">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Subtotal ({cartCount} pieces)</span>
                <span className="font-semibold text-on-surface tabular-nums">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between items-center text-secondary font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">loyalty</span>
                    <span>AI Outfit Bundle Discount (15%)</span>
                  </div>
                  <span className="tabular-nums">-${bundleDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Estimated Shipping</span>
                <span className="text-primary font-bold uppercase tracking-wider text-[11px]">
                  FREE
                </span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Estimated Taxes</span>
                <span className="font-semibold text-on-surface tabular-nums">$0.00</span>
              </div>
            </div>

            <div className="bg-surface-container-high h-[1px] my-1 rounded-full" />

            <div className="flex justify-between items-baseline pt-0.5">
              <div>
                <span className="font-display text-[16px] text-on-surface font-bold">Total</span>
                {bundleDiscount > 0 && (
                  <span className="block text-[11px] text-secondary font-semibold">
                    You save ${bundleDiscount.toFixed(2)} today! 🎉
                  </span>
                )}
              </div>
              <span className="font-display text-[24px] text-primary font-bold tracking-tight tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Docked Checkout Deck */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 z-30 mt-4 bg-surface/92 backdrop-blur-xl px-5 py-3 pb-safe shadow-[0_-8px_32px_rgba(45,37,58,0.08)] flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[11px] text-on-surface-variant font-medium">
                StyleMate Guarantee: 30-day Free Size Swaps
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('discover')}
              className="text-[11px] text-primary font-bold underline"
            >
              Add Items
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Share Cart"
              onClick={handleShareCart}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high active:scale-95 transition-all shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('checkout')}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-display text-[16px] font-bold shadow-[0_8px_24px_rgba(103,81,141,0.28)] flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">lock</span>
                <span>Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold tabular-nums">${total.toFixed(2)}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
