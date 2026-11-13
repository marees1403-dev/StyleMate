import React, { useMemo, useState } from 'react';
import { AdminSubNav } from '../components/AdminSubNav';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';

export const AdminInventoryScreen: React.FC = () => {
  const {
    products,
    purchaseOrders,
    restockProduct,
    notifyWaitlist,
    notifiedProductIds,
    adjustProductStock,
    showToast,
  } = useApp();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'low' | 'oos'>('all');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [isPoModalOpen, setPoModalOpen] = useState(false);
  const [isBulkOpen, setBulkOpen] = useState(false);

  const enrichedProducts = useMemo(() => {
    return products
      .map((p) => {
        const total = Object.values(p.stockBySize).reduce((s, n) => s + n, 0);
        const health: 'healthy' | 'low' | 'oos' =
          total === 0 ? 'oos' : total < p.reorderPoint ? 'low' : 'healthy';
        const priority = health === 'oos' ? 0 : health === 'low' ? 1 : 2;
        return { ...p, totalStock: total, health, priority };
      })
      .sort((a, b) => a.priority - b.priority || a.totalStock - b.totalStock);
  }, [products]);

  const counts = {
    all: enrichedProducts.length,
    healthy: enrichedProducts.filter((p) => p.health === 'healthy').length,
    low: enrichedProducts.filter((p) => p.health === 'low').length,
    oos: enrichedProducts.filter((p) => p.health === 'oos').length,
  };

  const filtered = enrichedProducts.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.health === statusFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const handleFastTrackRestock = () => {
    enrichedProducts
      .filter((p) => p.health === 'low' || p.health === 'oos')
      .slice(0, 2)
      .forEach((p) => restockProduct(p.id, 200));
    setAlertDismissed(true);
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-4">
      <AdminSubNav />

      {/* Operational Header */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-fixed text-primary">
              <span className="material-symbols-outlined text-sm material-symbols-filled">
                warehouse
              </span>
            </span>
            <span className="font-display text-[18px] font-bold text-on-surface">
              Inventory &amp; Stock Health
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sync Active
          </span>
        </div>
        <p className="text-[12px] text-on-surface-variant">
          Real-time SKU velocity, capsule safety thresholds &amp; automated restock queue.
        </p>
      </section>

      {/* Search & Filter Controls */}
      <section className="px-5 space-y-2.5">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant/70 text-lg pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, item name, or capsule tag..."
            className="w-full h-11 pl-10 pr-10 rounded-full bg-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-[0_2px_10px_rgba(103,81,141,0.06)]"
          />
          <button
            type="button"
            aria-label="Filter Critical Stock"
            onClick={() => setStatusFilter('low')}
            className="absolute right-3 text-primary flex items-center justify-center p-1 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg material-symbols-filled">
              auto_awesome
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-on-primary shadow-[0_4px_14px_rgba(103,81,141,0.25)]'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span>All Stock</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('healthy')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === 'healthy'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span>Healthy</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-[10px] font-bold">
              {counts.healthy}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('low')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === 'low'
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-secondary-fixed text-on-secondary-fixed'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>Low Stock</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">
              {counts.low}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('oos')}
            className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === 'oos'
                ? 'bg-error text-on-error shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span>Out of Stock</span>
            <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
              {counts.oos}
            </span>
          </button>
        </div>
      </section>

      {/* Urgent Alert Banner */}
      {!alertDismissed && counts.low + counts.oos > 0 && (
        <section className="px-5">
          <div className="relative overflow-hidden rounded-2xl bg-secondary-container p-4 shadow-[0_4px_20px_rgba(128,81,91,0.12)]">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-on-secondary-container/10 flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-xl material-symbols-filled">
                  warning
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-secondary-container/80">
                    Weekend Drop Risk
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                </div>
                <p className="text-[13px] text-on-secondary-container font-bold leading-tight">
                  {counts.low + counts.oos} High-demand AI Capsule items need restock ahead of
                  weekend drop!
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFastTrackRestock}
                    className="px-3 py-1.5 rounded-full bg-secondary text-on-secondary text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">flash_on</span>
                    <span>Fast-Track Restock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertDismissed(true)}
                    className="px-3 py-1.5 rounded-full bg-surface-container-lowest/80 text-on-secondary-container text-[11px] font-semibold active:scale-95 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Turnover & Health Pulse */}
      <section className="px-5">
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[0_4px_18px_rgba(157,133,197,0.10)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl material-symbols-filled">
                insights
              </span>
              <span className="font-display text-[16px] font-bold text-on-surface">
                Turnover &amp; Health Pulse
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">
              Past 30 Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-surface-container-low flex flex-col justify-between">
              <span className="text-[11px] text-on-surface-variant font-semibold">
                Inventory Turn Rate
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-[22px] text-primary font-bold">6.2x</span>
                <span className="text-[11px] text-emerald-600 flex items-center font-bold">
                  <span className="material-symbols-outlined text-xs">arrow_upward</span>+0.8x
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant/80 mt-1">
                Target benchmark: 5.5x
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low flex flex-col justify-between">
              <span className="text-[11px] text-on-surface-variant font-semibold">
                Safety Stock Health
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-[22px] text-on-surface font-bold">
                  {Math.round((counts.healthy / Math.max(1, counts.all)) * 100)}%
                </span>
                <span className="text-[11px] text-on-secondary-container font-bold">
                  {counts.low + counts.oos === 0 ? 'Optimal' : 'Monitoring'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((counts.healthy / Math.max(1, counts.all)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Inventory Cards */}
      <section className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold text-on-surface">
            Catalog Items ({filtered.length})
          </h2>
          <span className="text-[11px] text-on-surface-variant">Sorted by Risk Priority</span>
        </div>

        {filtered.map((item) => {
          const isLow = item.health === 'low';
          const isOos = item.health === 'oos';
          const barPct = Math.min(100, Math.round((item.totalStock / Math.max(1, item.reorderPoint * 2)) * 100));
          const isNotified = notifiedProductIds.includes(item.id);
          const sizeEntries = Object.entries(item.stockBySize).slice(0, 3);

          return (
            <article
              key={item.id}
              className="rounded-2xl bg-surface-container-lowest p-4 shadow-[0_6px_22px_rgba(157,133,197,0.12)] space-y-3 relative overflow-hidden"
            >
              {isLow && <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary" />}
              <div className="flex gap-3 pt-0.5">
                <div className="w-16 h-20 rounded-xl bg-surface-container-high overflow-hidden shrink-0 relative">
                  <SmartImage
                    src={item.image}
                    alt={item.shortTitle}
                    className={`w-full h-full object-cover ${isOos ? 'grayscale-[30%] opacity-80' : ''}`}
                  />
                  {isLow && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[9px] font-bold">
                      HOT
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-on-surface-variant block font-semibold">
                    SKU: {item.sku}
                  </span>
                  <h3 className="font-display text-[16px] font-bold text-on-surface truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {isOos ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">block</span>
                        Out of Stock ({item.wishlistedWaitCount || 89} Wishlisted)
                      </span>
                    ) : isLow ? (
                      <>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs material-symbols-filled">
                            error
                          </span>
                          Critical Low Stock
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          ROP: {item.reorderPoint} pcs
                        </span>
                      </>
                    ) : item.isRestockScheduled ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">local_shipping</span>
                        Restock Scheduled ({item.inboundEta})
                      </span>
                    ) : (
                      <>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs material-symbols-filled">
                            check_circle
                          </span>
                          Healthy Stock
                        </span>
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-primary">
                            speed
                          </span>
                          {item.velocityPerDay} pcs / day
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-on-surface font-semibold">Current Stock</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isOos ? 'text-error' : isLow ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    {item.totalStock} pcs total
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOos ? 'bg-error' : isLow ? 'bg-secondary' : 'bg-primary'
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>

                {isLow && (
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {sizeEntries.map(([sz, qty]) => (
                      <div
                        key={sz}
                        className={`px-2 py-1.5 rounded-xl flex flex-col items-center text-center ${
                          qty <= 2 ? 'bg-secondary-container/40' : 'bg-surface-container-lowest'
                        }`}
                      >
                        <span className="text-[10px] text-on-surface-variant">Size {sz}</span>
                        <span
                          className={`text-[12px] font-bold tabular-nums ${
                            qty <= 2 ? 'text-error' : 'text-on-surface'
                          }`}
                        >
                          {qty} left{qty <= 2 ? ' 🚨' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!isLow && !isOos && (
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                    <span>
                      {item.inboundQty
                        ? `Inbound: +${item.inboundQty} units (${item.inboundEta})`
                        : `Runway: ${(item.totalStock / Math.max(1, item.velocityPerDay)).toFixed(1)} days remaining`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPoModalOpen(true)}
                      className="text-primary font-semibold underline underline-offset-2"
                    >
                      {item.isRestockScheduled ? 'Track PO' : 'Capsule Anchor'}
                    </button>
                  </div>
                )}

                {isOos && (
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-0.5">
                    <span className="flex items-center gap-1 text-secondary font-medium">
                      <span className="material-symbols-outlined text-xs">favorite</span>
                      {item.wishlistedWaitCount || 89} shoppers waiting for drop
                    </span>
                    <span>Est. Demand: $4,272</span>
                  </div>
                )}
              </div>

              {isLow && (
                <button
                  type="button"
                  onClick={() => restockProduct(item.id, 200)}
                  className="w-full py-2.5 px-4 rounded-full bg-secondary text-on-secondary font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(128,81,91,0.24)] active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-lg">bolt</span>
                  <span>Auto-Order 200 Units</span>
                </button>
              )}

              {isOos && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => notifyWaitlist(item.id)}
                    className="py-2.5 px-3 rounded-full bg-surface-container-high text-primary font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isNotified ? 'mark_email_read' : 'campaign'}
                    </span>
                    <span>{isNotified ? 'Broadcast Ready ✓' : 'Notify 89 Shoppers'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => restockProduct(item.id, 150)}
                    className="py-2.5 px-3 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">add_box</span>
                    <span>Restock +150</span>
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Bottom Floating Action Cluster */}
      <section className="px-5 pt-2">
        <div className="p-3 rounded-2xl bg-surface-container-highest/90 backdrop-blur-md shadow-[0_8px_24px_rgba(103,81,141,0.18)] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="py-3 px-3 rounded-full bg-surface-container-lowest text-on-surface font-bold text-[12px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-primary text-lg">
                playlist_add_check
              </span>
              <span className="truncate">Bulk Stock Update</span>
            </button>
            <button
              type="button"
              onClick={() => setPoModalOpen(true)}
              className="py-3 px-3 rounded-full bg-primary text-on-primary font-bold text-[12px] shadow-[0_4px_14px_rgba(103,81,141,0.25)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">order_approve</span>
              <span className="truncate">Supplier POs ({purchaseOrders.length})</span>
            </button>
          </div>
          <div className="text-center">
            <span className="text-[11px] text-on-surface-variant/80 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">verified</span>
              StyleMate AI Engine auto-balances SKU inventory every 15 min.
            </span>
          </div>
        </div>
      </section>

      {/* Supplier POs Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Active Supplier Purchase Orders
              </h3>
              <button
                type="button"
                onClick={() => setPoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-2.5 max-h-[60dvh] overflow-y-auto">
              {purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-on-surface">
                      {po.id} • {po.productTitle}
                    </p>
                    <p className="text-[11px] text-outline">
                      SKU {po.sku} • {po.supplier} • {po.createdAt}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-bold text-primary block">
                      +{po.units} pcs
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stock Update Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 bg-on-surface/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-surface rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[18px] font-bold text-on-surface">
                Quick Size Stock Adjuster
              </h3>
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="space-y-2.5 max-h-[55dvh] overflow-y-auto">
              {products.slice(0, 4).map((p) => {
                const firstSize = p.sizes[0];
                const qty = p.stockBySize[firstSize] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="bg-surface-container-lowest p-3 rounded-2xl flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[13px] font-bold text-on-surface truncate">
                        {p.shortTitle}
                      </p>
                      <p className="text-[11px] text-outline">Size {firstSize}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustProductStock(p.id, firstSize, -5)}
                        className="w-7 h-7 rounded-full bg-surface-container-high font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="text-[13px] font-bold w-8 text-center tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustProductStock(p.id, firstSize, 10)}
                        className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                setBulkOpen(false);
                showToast('Bulk warehouse inventory adjustments saved!');
              }}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-[13px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
