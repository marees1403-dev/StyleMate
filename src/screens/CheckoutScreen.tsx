import React, { useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';

const VALID_PROMOS: Record<string, { type: 'fixed' | 'percent'; value: number; label: string }> = {
  SPRINGPASTEL: { type: 'fixed', value: 10, label: 'Saved $10.00 with Spring Pastel Promo!' },
  COZY20: { type: 'percent', value: 0.2, label: '20% Cozy Family VIP Discount applied!' },
  TWINNING: { type: 'fixed', value: 15, label: 'Saved $15.00 with Twinning Capsule Promo!' },
};

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    bundleDiscount,
    address,
    updateAddress,
    placeOrder,
    navigate,
    showToast,
  } = useApp();

  const [shippingMethod, setShippingMethod] = useState<'eco' | 'flash'>('eco');
  const [selectedPayMethod, setSelectedPayMethod] = useState<'visa' | 'apple' | 'gpay'>('visa');
  const [promoInput, setPromoInput] = useState('SPRINGPASTEL');
  const [appliedPromo, setAppliedPromo] = useState<string | null>('SPRINGPASTEL');
  const [promoError, setPromoError] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Edit Address Modal
  const [isAddrModalOpen, setAddrModalOpen] = useState(false);
  const [draftName, setDraftName] = useState(address.name);
  const [draftPhone, setDraftPhone] = useState(address.phone);
  const [draftLine1, setDraftLine1] = useState(address.line1);
  const [draftCity, setDraftCity] = useState(address.cityStateZip);
  const [addrError, setAddrError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="px-5 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">shopping_bag</span>
        </div>
        <h2 className="font-display text-[20px] font-bold text-on-surface">
          No items waiting for checkout
        </h2>
        <p className="text-[13px] text-on-surface-variant">
          Add pastel capsule pieces to your bag first.
        </p>
        <button
          type="button"
          onClick={() => navigate('discover')}
          className="px-6 py-3 rounded-full bg-primary text-on-primary text-[13px] font-bold"
        >
          Browse Pastel Collection
        </button>
      </div>
    );
  }

  const shippingCost = shippingMethod === 'flash' ? 5.99 : 0;
  const promoRule = appliedPromo ? VALID_PROMOS[appliedPromo] : undefined;
  const voucherDiscount = promoRule
    ? promoRule.type === 'fixed'
      ? promoRule.value
      : Number((cartSubtotal * promoRule.value).toFixed(2))
    : 0;

  const totalPayable = Math.max(
    0,
    Number((cartSubtotal - bundleDiscount - voucherDiscount + shippingCost).toFixed(2))
  );
  const totalSavings = Number((bundleDiscount + voucherDiscount).toFixed(2));
  const klarnaInstallment = (totalPayable / 4).toFixed(2);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      setPromoError('');
      return;
    }
    if (VALID_PROMOS[code]) {
      setAppliedPromo(code);
      setPromoError('');
      showToast(VALID_PROMOS[code].label);
    } else {
      setPromoError('Invalid code. Try SPRINGPASTEL, COZY20, or TWINNING.');
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim() || !draftLine1.trim() || !draftCity.trim()) {
      setAddrError('Please complete recipient name, street address, and city/zip.');
      return;
    }
    setAddrError('');
    updateAddress({
      name: draftName.trim(),
      phone: draftPhone.trim() || address.phone,
      line1: draftLine1.trim(),
      cityStateZip: draftCity.trim(),
      label: address.label,
    });
    setAddrModalOpen(false);
  };

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    const paymentLabel =
      selectedPayMethod === 'apple'
        ? 'Apple Pay (Prototype)'
        : selectedPayMethod === 'gpay'
          ? 'Google Pay (Prototype)'
          : 'Lilac Premier VISA •••• 4242';

    window.setTimeout(() => {
      const order = placeOrder({
        shippingMethod,
        paymentMethod: paymentLabel,
        voucherCode: appliedPromo || undefined,
        voucherDiscount,
      });
      setIsPlacing(false);
      showToast(`Order ${order.id} placed! Baby Pip is on the way.`);
      navigate('tracking', { orderId: order.id });
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Interactive Feedback Banner */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-full bg-surface-container-high/70 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base material-symbols-filled">
              shield_with_heart
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant">
              Step 2 of 3 • Shipping &amp; Payment
            </span>
          </div>
          <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary-fixed/80">
            Secure SSL
          </span>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="px-5 pt-2 pb-4">
        <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('cart')}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <div className="w-7 h-7 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-sm font-bold">check</span>
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-secondary truncate">Bag</p>
              <p className="text-[10px] text-on-surface-variant leading-none">{cartCount} Items</p>
            </div>
          </button>

          <div className="h-0.5 w-5 bg-secondary-fixed-dim rounded-full shrink-0" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(103,81,141,0.35)]">
              <span className="material-symbols-outlined text-sm">local_shipping</span>
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-primary truncate">Payment</p>
              <p className="text-[10px] text-primary font-semibold leading-none">In progress</p>
            </div>
          </div>

          <div className="h-0.5 w-5 bg-surface-variant rounded-full shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0 opacity-50">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">celebration</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">Joy</span>
          </div>
        </div>
      </div>

      {/* Main Checkout Content */}
      <div className="px-5 flex flex-col gap-4">
        {/* Section 1: Delivery Address */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg material-symbols-filled">
                  cottage
                </span>
              </div>
              <h2 className="font-display text-[17px] text-on-surface font-bold">
                Delivery Cozy-Nest
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAddrModalOpen(true)}
              className="px-3 py-1 rounded-full bg-surface-container-high text-primary text-[11px] font-bold active:scale-95 transition-transform"
            >
              Change
            </button>
          </div>
          <div className="bg-surface-container-low/70 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-on-surface font-bold">{address.name}</span>
              <span className="text-[11px] text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded-full">
                {address.phone}
              </span>
            </div>
            <p className="text-[13px] text-on-surface-variant leading-snug">
              {address.line1}
              <br />
              {address.cityStateZip}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-secondary">
              <span className="material-symbols-outlined text-sm material-symbols-filled">
                favorite
              </span>
              <span className="text-[11px] font-semibold">{address.label}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Shipping Speed */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </div>
              <h2 className="font-display text-[17px] text-on-surface font-bold">Shipping Speed</h2>
            </div>
            <span className="text-[11px] font-bold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
              Doll-Care Box
            </span>
          </div>

          <label
            onClick={() => setShippingMethod('eco')}
            className={`cursor-pointer block rounded-2xl p-3.5 transition-all ${
              shippingMethod === 'eco'
                ? 'bg-gradient-to-r from-primary-fixed/40 to-surface-container-low ring-2 ring-primary/40 shadow-sm'
                : 'bg-surface-container-low/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === 'eco'}
                onChange={() => setShippingMethod('eco')}
                className="mt-1 h-4 w-4 text-primary accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-on-surface flex items-center gap-1.5">
                    AI-Eco Express
                    <span className="material-symbols-outlined text-xs text-primary material-symbols-filled">
                      eco
                    </span>
                  </span>
                  <span className="text-[13px] font-bold text-primary">FREE</span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Estimated arrival in 2-3 cozy days
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] bg-surface-container-lowest text-primary px-2 py-0.5 rounded-full font-bold">
                    100% Recyclable Packaging
                  </span>
                  <span className="text-[10px] bg-secondary-fixed text-secondary px-2 py-0.5 rounded-full font-semibold">
                    Climate Calm
                  </span>
                </div>
              </div>
            </div>
          </label>

          <label
            onClick={() => setShippingMethod('flash')}
            className={`cursor-pointer block rounded-2xl p-3.5 transition-all ${
              shippingMethod === 'flash'
                ? 'bg-gradient-to-r from-secondary-fixed/50 to-surface-container-low ring-2 ring-secondary/40 shadow-sm'
                : 'bg-surface-container-low/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shipping"
                checked={shippingMethod === 'flash'}
                onChange={() => setShippingMethod('flash')}
                className="mt-1 h-4 w-4 text-primary accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-on-surface flex items-center gap-1.5">
                    Same-Day Flash Delivery
                    <span className="material-symbols-outlined text-xs text-secondary material-symbols-filled">
                      bolt
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-on-surface tabular-nums">+$5.99</span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Arrives today before 7:00 PM
                </p>
              </div>
            </div>
          </label>
        </div>

        {/* Section 3: Payment Method */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">credit_card</span>
              </div>
              <h2 className="font-display text-[17px] text-on-surface font-bold">Payment Method</h2>
            </div>
            <span className="text-[10px] uppercase font-bold text-primary bg-primary-fixed/60 px-2 py-0.5 rounded-full">
              Simulated Demo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedPayMethod('apple')}
              className={`h-11 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-[12px] font-bold ${
                selectedPayMethod === 'apple'
                  ? 'bg-on-surface text-surface ring-2 ring-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">phone_iphone</span>
              <span>Apple Pay</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPayMethod('gpay')}
              className={`h-11 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-[12px] font-bold ${
                selectedPayMethod === 'gpay'
                  ? 'bg-primary text-on-primary ring-2 ring-primary-fixed'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              <span>G-Pay</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPayMethod('visa')}
            className={`text-left rounded-2xl p-4 bg-gradient-to-br from-primary-container/90 to-primary text-on-primary shadow-[0_8px_20px_rgba(103,81,141,0.28)] flex flex-col justify-between h-36 relative overflow-hidden transition-all ${
              selectedPayMethod === 'visa' ? 'ring-3 ring-secondary-container' : 'opacity-80'
            }`}
          >
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-secondary/30 blur-2xl" />
            <div className="flex items-center justify-between relative z-10 w-full">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-fixed text-sm material-symbols-filled">
                  stars
                </span>
                <span className="text-[11px] text-primary-fixed tracking-wider font-bold">
                  LILAC PREMIER CARD
                </span>
              </div>
              <span className="font-display text-[18px] italic font-extrabold text-on-primary">
                VISA
              </span>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-7 h-5 rounded-md bg-secondary-fixed-dim/90 flex items-center justify-center shadow-inner">
                <div className="w-4 h-3 rounded-sm bg-secondary/40" />
              </div>
              <span className="font-mono tracking-widest text-[15px] text-on-primary font-bold">
                •••• 4242
              </span>
            </div>
            <div className="flex items-center justify-between relative z-10 w-full">
              <div>
                <p className="text-[10px] text-primary-fixed leading-none">Cardholder</p>
                <p className="text-[12px] font-bold text-on-primary tracking-wide uppercase">
                  {address.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-primary-fixed leading-none">Expires</p>
                <p className="text-[12px] font-bold text-on-primary">09/28</p>
              </div>
            </div>
          </button>

          {/* Klarna Calculator */}
          <div className="bg-secondary-container/30 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">
                K.
              </div>
              <div>
                <p className="text-[12px] text-on-surface font-bold">4 interest-free payments</p>
                <p className="text-[12px] text-on-surface-variant tabular-nums">
                  Pay ${klarnaInstallment} every 2 weeks
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-base">
              check_circle
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-1 text-on-surface-variant/80">
            <span className="material-symbols-outlined text-xs">info</span>
            <span className="text-[11px]">
              Prototype checkout: uses simulated payment &amp; promo state. No real card charge.
            </span>
          </div>
        </div>

        {/* Section 4: Promo & Voucher */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] text-on-surface font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-lg">loyalty</span>
              Promo &amp; Voucher
            </h2>
            <span className="text-[11px] text-secondary font-bold">
              {appliedPromo ? '1 Applied' : 'Try SPRINGPASTEL'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-container-low rounded-full px-4 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">
                confirmation_number
              </span>
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="SPRINGPASTEL or COZY20"
                className="bg-transparent border-none outline-none text-[12px] text-on-surface font-bold tracking-wider w-full uppercase"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-5 py-2.5 rounded-full bg-primary-fixed text-primary text-[12px] font-bold active:scale-95 transition-all shadow-sm"
            >
              {appliedPromo === promoInput.trim().toUpperCase() && appliedPromo ? 'Applied' : 'Apply'}
            </button>
          </div>
          {promoError && <p className="text-[11px] text-error font-semibold px-1">{promoError}</p>}
          {promoRule && (
            <div className="flex items-center justify-between text-secondary px-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm material-symbols-filled">
                  check_circle
                </span>
                <span className="text-[12px] font-semibold">{promoRule.label}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoInput('');
                }}
                className="text-[11px] underline text-outline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Section 5: Order Mini Preview & Summary */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] text-on-surface font-bold">
              Cart Items ({cartCount})
            </h2>
            <span className="text-[11px] text-primary font-bold">Bundle Set</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="shrink-0 w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden relative shadow-sm"
              >
                <SmartImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 bg-surface/90 text-on-surface text-[9px] px-1 rounded-sm font-bold capitalize">
                  {item.audience}
                </span>
              </div>
            ))}
            <div className="shrink-0 w-24 h-16 rounded-xl bg-secondary-fixed/40 p-2 flex flex-col justify-center">
              <span className="text-[10px] text-secondary font-bold leading-tight">
                Family Match
              </span>
              <span className="text-[11px] text-on-secondary-fixed-variant leading-tight">
                Pastel Harmony
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 text-[13px]">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Items Subtotal ({cartCount} pcs)</span>
              <span className="font-semibold text-on-surface tabular-nums">
                ${cartSubtotal.toFixed(2)}
              </span>
            </div>
            {bundleDiscount > 0 && (
              <div className="flex items-center justify-between text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Family Bundle Saver (15%)
                </span>
                <span className="font-bold tabular-nums">-${bundleDiscount.toFixed(2)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="flex items-center justify-between text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">sell</span>
                  Voucher ({appliedPromo})
                </span>
                <span className="font-bold tabular-nums">-${voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>Estimated Shipping</span>
              <span className="text-primary font-bold tabular-nums">
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 mt-1 flex items-baseline justify-between bg-surface-container-low/80 p-3 rounded-xl">
              <div>
                <span className="font-display text-[18px] font-bold text-on-surface">
                  Total Payable
                </span>
                {totalSavings > 0 && (
                  <p className="text-[11px] text-secondary font-semibold tabular-nums">
                    Total savings: ${totalSavings.toFixed(2)}
                  </p>
                )}
              </div>
              <span className="font-display text-[25px] font-bold text-primary tabular-nums">
                ${totalPayable.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Guarantee Pill */}
        <div className="rounded-2xl bg-primary-fixed/50 p-3.5 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-lg material-symbols-filled">
              verified
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-on-primary-fixed leading-tight">
              Doll-Scale Fit Guarantee
            </p>
            <p className="text-[11px] text-on-primary-fixed-variant leading-snug">
              If sizes don&apos;t match your family perfectly, exchange easily within 30 days for
              free!
            </p>
          </div>
        </div>

        {/* Place Order CTA */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={isPlacing}
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(103,81,141,0.28)] active:scale-[0.98] transition-all disabled:opacity-80"
          >
            <span className={`material-symbols-outlined text-xl ${isPlacing ? 'animate-spin' : ''}`}>
              {isPlacing ? 'sync' : 'shopping_cart_checkout'}
            </span>
            <span>
              {isPlacing ? 'Securing Order...' : `Place Order • $${totalPayable.toFixed(2)}`}
            </span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant/80">
            <span className="material-symbols-outlined text-sm text-primary">lock</span>
            <span className="text-[11px]">256-Bit Encrypted &amp; Doll-Scale Fit Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Edit Address Modal */}
      {isAddrModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleSaveAddress}
            className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Edit Delivery Cozy-Nest
              </h3>
              <button
                type="button"
                onClick={() => setAddrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Recipient Full Name"
              className="w-full rounded-full bg-surface-container-low px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full rounded-full bg-surface-container-low px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={draftLine1}
              onChange={(e) => setDraftLine1(e.target.value)}
              placeholder="Street & Apt"
              className="w-full rounded-full bg-surface-container-low px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={draftCity}
              onChange={(e) => setDraftCity(e.target.value)}
              placeholder="City, State ZIP"
              className="w-full rounded-full bg-surface-container-low px-4 py-3 text-[13px] outline-none focus:ring-2 focus:ring-primary"
            />
            {addrError && <p className="text-[11px] text-error font-semibold">{addrError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Save Address
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
