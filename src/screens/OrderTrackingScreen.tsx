import React, { useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';

export const OrderTrackingScreen: React.FC = () => {
  const {
    orders,
    activeOrderId,
    setActiveOrderId,
    updateOrderInstructions,
    toggleOrderRingSoftly,
    advanceOrderTrackingStep,
    navigate,
    showToast,
  } = useApp();

  const order = orders.find((o) => o.id === activeOrderId) || orders[0];
  const [honking, setHonking] = useState(false);
  const [isRecalc, setIsRecalc] = useState(false);
  const [isCallOpen, setCallOpen] = useState(false);
  const [isInstrOpen, setInstrOpen] = useState(false);
  const [draftInstr, setDraftInstr] = useState(order?.deliveryInstructions || '');

  if (!order) {
    return (
      <div className="px-5 py-12 text-center space-y-4">
        <h2 className="font-display text-[20px] font-bold text-on-surface">No active orders yet</h2>
        <button
          type="button"
          onClick={() => navigate('discover')}
          className="px-6 py-3 rounded-full bg-primary text-on-primary text-[13px] font-bold"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const handleHonk = () => {
    setHonking(true);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio playback blocked cleanly
    }
    window.setTimeout(() => setHonking(false), 1400);
  };

  const handleTrackGps = () => {
    setIsRecalc(true);
    window.setTimeout(() => {
      advanceOrderTrackingStep(order.id);
      setIsRecalc(false);
      showToast('Live GPS pinged! Delivery milestone updated.');
    }, 800);
  };

  const handleSaveInstructions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftInstr.trim()) return;
    updateOrderInstructions(order.id, draftInstr.trim());
    setInstrOpen(false);
  };

  const milestones = [
    {
      step: 1,
      title: 'Order Snuggled & Packed',
      time: order.createdAt,
      desc: 'Wrapped in marshmallow-soft doll-care tissue & sealed with hugs.',
      icon: 'check',
    },
    {
      step: 2,
      title: 'Dispatched with Giggles',
      time: '1:40 PM',
      desc: 'Loaded onto the Pastel Express tiny van. Siren sounded: “Wee-woo!”',
      icon: 'check',
    },
    {
      step: 3,
      title: 'Out for Toddler Sprint Delivery',
      time: 'ACTIVE NOW',
      desc: 'Courier spotted skipping near your block! Holding your parcel tight with two small hands.',
      icon: 'directions_run',
    },
    {
      step: 4,
      title: 'Delivered to Cozy-Nest',
      time: order.estimatedTouchdown,
      desc: 'Safely tucked by your doorstep with a tiny wave.',
      icon: 'cottage',
    },
  ];

  const vanLeftPct =
    order.step === 1 ? '18%' : order.step === 2 ? '36%' : order.step === 3 ? '58%' : '82%';

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Multi-Order Switcher if user placed additional orders */}
      {orders.length > 1 && (
        <div className="px-5 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setActiveOrderId(o.id);
                setDraftInstr(o.deliveryInstructions);
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 ${
                o.id === order.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {o.id} • {o.status}
            </button>
          ))}
        </div>
      )}

      {/* Status Chip & Order Header Banner */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_8px_24px_rgba(157,133,197,0.12)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-secondary-fixed/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary-fixed/40 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              {order.step === 4 ? 'Delivered & Cozy' : 'En Route & Cozy'}
            </span>
            <span className="text-[12px] text-tertiary font-semibold tracking-wider">
              {order.id}
            </span>
          </div>
          <div className="mt-2 relative z-10">
            <p className="text-[12px] text-tertiary">Estimated Touchdown</p>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-[24px] text-on-surface font-bold tracking-tight">
                {order.estimatedTouchdown}
              </h2>
              <span className="text-[11px] text-primary font-bold bg-primary-fixed px-2.5 py-0.5 rounded-full">
                {order.shippingMethod === 'flash' ? 'Flash Express' : 'Naptime Express'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Courier Mascot Speech Bubble */}
      <div className="px-5 py-2.5">
        <div className="bg-surface-container-low rounded-3xl p-4 shadow-[0_8px_24px_rgba(157,133,197,0.1)]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-md bg-surface-container-high p-1">
                <SmartImage
                  src={ASSETS.courierPip}
                  alt="Courier Baby Pip"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <span className="absolute -bottom-2 -right-1 bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs material-symbols-filled">
                  local_shipping
                </span>
                Chief Baby
              </span>
            </div>

            <div className="relative bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex-1 text-left">
              <div className="flex items-center gap-1.5 text-secondary text-[12px] font-bold mb-1">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
                <span>Courier Pip shouts:</span>
              </div>
              <p className="text-[13px] text-on-surface leading-snug">
                “Hang tight! Your Chief Toddler Courier is speeding through naptime to hand-deliver
                your pastel fits! 📦💨 No wrinkles guaranteed!”
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-tertiary bg-surface-container-high px-2 py-0.5 rounded-full">
                  Speed: 4.8 juice-boxes/hr
                </span>
                <span className="text-[10px] text-primary bg-primary-fixed px-2 py-0.5 rounded-full font-bold">
                  100% Cotton-Safe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Milestones Timeline */}
      <div className="px-5 py-2.5">
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_4px_18px_rgba(157,133,197,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[17px] text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary material-symbols-filled">
                verified
              </span>
              Journey to Cozy-Nest
            </h3>
            <span className="text-[11px] text-tertiary bg-surface-container px-2.5 py-1 rounded-full font-semibold">
              Step {order.step} of 4
            </span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-[3px] before:bg-surface-container-high">
            {milestones.map((m) => {
              const isDone = order.step > m.step || (order.step === 4 && m.step === 4);
              const isCurrent = order.step === m.step && order.step < 4;
              const isFuture = order.step < m.step;

              return (
                <div
                  key={m.step}
                  className={`relative flex items-start gap-3 ${isFuture ? 'opacity-55' : ''}`}
                >
                  <div
                    className={`absolute -left-[30px] w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                      isDone
                        ? 'bg-primary text-on-primary shadow-sm'
                        : isCurrent
                          ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(255,194,205,0.8)] animate-bounce'
                          : 'bg-surface-container-highest text-tertiary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm font-bold">
                      {isDone ? 'check' : m.icon}
                    </span>
                  </div>

                  {isCurrent ? (
                    <div className="bg-secondary-container/40 p-3 rounded-2xl flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-[14px] text-on-surface font-bold flex items-center gap-1.5">
                          {m.title}
                          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                        </h4>
                        <span className="text-[10px] text-secondary font-bold">ACTIVE NOW</span>
                      </div>
                      <p className="text-[12px] text-on-surface-variant mt-0.5 font-medium">
                        {m.desc}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-[14px] text-on-surface font-semibold">
                          {m.title}
                        </h4>
                        <span className="text-[11px] text-tertiary">{m.time}</span>
                      </div>
                      <p className="text-[12px] text-tertiary mt-0.5">{m.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Mini-Radar Map Card */}
      <div className="px-5 py-2.5">
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.12)] overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display text-[17px] text-on-surface font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">pin_drop</span>
                Live Mini-Radar
              </h3>
              <p className="text-[12px] text-tertiary">
                {order.step === 4 ? 'Arrived at Porch Bench!' : '0.4 miles away • Estimated 8 mins'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleHonk}
              className="px-3 py-1.5 bg-surface-container-high rounded-full text-[12px] font-bold text-on-surface flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  honking ? 'text-secondary animate-ping' : 'text-primary'
                }`}
              >
                {honking ? 'music_note' : 'volume_up'}
              </span>
              {honking ? '*Beep Beep!*' : 'Honk Horn!'}
            </button>
          </div>

          <div className="relative w-full h-44 rounded-2xl bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
            <svg
              className="absolute inset-0 w-full h-full text-surface-container-highest"
              preserveAspectRatio="none"
              viewBox="0 0 400 200"
            >
              <path
                d="M 0,100 Q 100,40 200,100 T 400,90"
                fill="none"
                stroke="#ebddfa"
                strokeLinecap="round"
                strokeWidth="28"
              />
              <path
                d="M 0,100 Q 100,40 200,100 T 400,90"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="20"
              />
              <path
                d="M 0,100 Q 100,40 200,100 T 400,90"
                fill="none"
                stroke="#8069a7"
                strokeDasharray="6,8"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>

            <div className="absolute left-5 top-5 bg-surface-container-lowest/90 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-xs">park</span>
              <span className="text-[11px] font-semibold text-on-surface">Bubble Park</span>
            </div>
            <div className="absolute right-5 bottom-5 bg-secondary-container px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-on-secondary-container text-xs">
                home
              </span>
              <span className="text-[11px] text-on-secondary-container font-bold">
                Your Doorstep
              </span>
            </div>

            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700"
              style={{ left: vanLeftPct }}
            >
              <div className="bg-secondary text-on-secondary text-[10px] px-2 py-0.5 rounded-full shadow-md font-bold whitespace-nowrap flex items-center gap-1 mb-1">
                <span>Mia &amp; Kiddo Van</span>
              </div>
              <div className="w-11 h-11 bg-surface-container-lowest rounded-full p-1 shadow-lg ring-4 ring-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-secondary">
                  airport_shuttle
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Contact Card */}
      <div className="px-5 py-2.5">
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.12)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner">
                <span className="material-symbols-outlined text-2xl">child_care</span>
              </div>
              <div>
                <h4 className="font-display text-[16px] text-on-surface font-bold">
                  {order.courierName}
                </h4>
                <p className="text-[11px] text-primary font-semibold">
                  Certified Outfit Guardian • 5.0 ★
                </p>
              </div>
            </div>
            <span className="bg-surface-container-high text-on-surface text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-xs text-secondary">
                verified_user
              </span>
              Top Rated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={() => setCallOpen(true)}
              className="flex items-center justify-center gap-1.5 py-3 px-3 bg-primary-fixed hover:bg-primary-container hover:text-on-primary-container text-on-primary-fixed rounded-full font-bold text-[13px] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">call</span>
              <span>Call Dispatch</span>
            </button>
            <button
              type="button"
              onClick={() => {
                toggleOrderRingSoftly(order.id);
                showToast(
                  !order.ringSoftly
                    ? 'Tiptoe mode activated! Baby Pip will ring softly.'
                    : 'Standard doorbell chime restored.'
                );
              }}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-full font-bold text-[13px] active:scale-95 transition-all ${
                order.ringSoftly
                  ? 'bg-secondary text-on-secondary shadow-md'
                  : 'bg-secondary-fixed text-on-secondary-fixed'
              }`}
            >
              <span className="material-symbols-outlined text-lg">doorbell</span>
              <span>{order.ringSoftly ? 'Tiptoe Active ✓' : '“Ring Softly!”'}</span>
            </button>
          </div>

          {order.ringSoftly && (
            <div className="mt-3 p-2.5 bg-surface-container-high rounded-2xl text-center text-[12px] text-on-surface font-medium">
              Baby Pip noted: “Tiptoe delivery activated! No loud bell!” 🤫🧸
            </div>
          )}
        </div>
      </div>

      {/* Inside This Box Card */}
      <div className="px-5 py-2.5">
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_4px_18px_rgba(157,133,197,0.12)]">
          <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
            <div>
              <h3 className="font-display text-[17px] text-on-surface font-bold">Inside This Box</h3>
              <p className="text-[12px] text-tertiary">
                {order.items.length} pastel treasures carefully inspected
              </p>
            </div>
            <span className="text-[11px] bg-surface-container px-2.5 py-1 rounded-full text-on-surface font-bold">
              {order.items.length} Items
            </span>
          </div>

          <div className="divide-y divide-surface-variant/50">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-low shrink-0 overflow-hidden p-1 shadow-sm">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display text-[14px] font-bold text-on-surface truncate">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-tertiary">
                      Size: {item.size} • {item.color}
                    </p>
                  </div>
                </div>
                <span className="text-[14px] text-on-surface shrink-0 font-bold tabular-nums">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-3 border-t border-surface-variant flex items-center justify-between">
            <div>
              <span className="font-display text-[14px] text-tertiary font-semibold block">
                Order Total Paid
              </span>
              <span className="text-[11px] text-outline">{order.deliveryInstructions}</span>
            </div>
            <span className="font-display text-[22px] text-primary font-bold tabular-nums">
              ${order.totalPaid.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Triggers */}
      <div className="px-5 pt-2 pb-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleTrackGps}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-[14px] shadow-[0_8px_24px_rgba(103,81,141,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className={`material-symbols-outlined text-xl ${isRecalc ? 'animate-spin' : ''}`}>
            {isRecalc ? 'sync' : 'satellite_alt'}
          </span>
          <span>{isRecalc ? 'Recalculating Stride...' : 'Track Live GPS 📍'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDraftInstr(order.deliveryInstructions);
              setInstrOpen(true);
            }}
            className="py-3.5 bg-surface-container-high text-on-surface font-bold text-[12px] rounded-full flex items-center justify-center gap-1.5 hover:bg-surface-variant active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Instructions</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('feedback')}
            className="py-3.5 bg-secondary-container text-on-secondary-container font-bold text-[12px] rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-base">stars</span>
            <span>Rate Fit (+50 Pts)</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-5 pt-1">
        <p className="text-[12px] text-tertiary flex items-center justify-center gap-1">
          <span>Powered by StyleMate Toddler Fleet</span>
          <span className="material-symbols-outlined text-xs text-secondary material-symbols-filled">
            favorite
          </span>
          <span>Tiptoes &amp; Smiles</span>
        </p>
      </div>

      {/* Call Dispatch Modal */}
      {isCallOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-surface rounded-3xl p-5 shadow-2xl text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h3 className="font-display text-[18px] font-bold text-on-surface">
              Pastel Fleet Dispatch
            </h3>
            <p className="text-[12px] text-on-surface-variant">
              Courier Baby Pip is 0.4 miles from {order.address.line1}. Direct dispatch line: +1
              (800) 555-CHIBI.
            </p>
            <button
              type="button"
              onClick={() => {
                setCallOpen(false);
                showToast('Dispatch pinged! Baby Pip waved back.');
              }}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Send Wave to Driver
            </button>
          </div>
        </div>
      )}

      {/* Delivery Instructions Modal */}
      {isInstrOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleSaveInstructions}
            className="w-full max-w-[400px] bg-surface rounded-3xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Delivery Instructions
              </h3>
              <button
                type="button"
                onClick={() => setInstrOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={draftInstr}
              onChange={(e) => setDraftInstr(e.target.value)}
              placeholder="e.g. Leave softly on the porch bench..."
              className="w-full rounded-2xl bg-surface-container-low p-3 text-[13px] text-on-surface outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Update Instructions
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
