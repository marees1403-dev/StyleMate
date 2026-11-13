import React, { useState } from 'react';
import { AdminSubNav } from '../components/AdminSubNav';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';
import { HOURLY_VELOCITY_DATA } from '../data/catalog';

export const AdminSalesScreen: React.FC = () => {
  const { products, orders, openProduct, navigate, showToast } = useApp();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [exportState, setExportState] = useState<'idle' | 'preparing' | 'done'>('idle');

  const extraOrdersCount = Math.max(0, orders.length - 1);
  const extraUnits = orders.slice(0, extraOrdersCount).reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const extraRevenue = Math.round(
    orders.slice(0, extraOrdersCount).reduce((sum, o) => sum + o.totalPaid, 0)
  );

  const rangeMetrics = HOURLY_VELOCITY_DATA[dateRange];
  const displayUnits = rangeMetrics.units + extraUnits;
  const displayRevenue = rangeMetrics.revenue + extraRevenue;

  const categories = ['All Categories', 'Women Tops', 'Trousers', 'Kids Duo', 'Footwear'];

  const rankedProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .filter((p) => {
      if (categoryFilter === 'All Categories') return true;
      if (categoryFilter === 'Women Tops') return p.category === 'Tops' && p.audience === 'women';
      if (categoryFilter === 'Trousers') return p.category === 'Bottoms';
      if (categoryFilter === 'Kids Duo') return p.audience === 'kids' || p.category === 'Family Sets';
      if (categoryFilter === 'Footwear') return p.category === 'Shoes';
      return true;
    });

  const handleExportCsv = () => {
    setExportState('preparing');
    const headers = ['Rank', 'SKU', 'Title', 'Category', 'UnitsSold', 'Price', 'EstimatedRevenue'];
    const rows = rankedProducts.map((p, idx) => [
      idx + 1,
      p.sku,
      `"${p.title.replace(/"/g, '""')}"`,
      p.category,
      p.soldCount,
      p.price.toFixed(2),
      (p.soldCount * p.price).toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    window.setTimeout(() => {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stylemate-sales-${dateRange}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        // fallback toast only
      }
      setExportState('done');
      showToast(`Exported stylemate-sales-${dateRange}.csv`);
      window.setTimeout(() => setExportState('idle'), 1800);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <AdminSubNav />

      {/* Top Admin Welcome & Live Status Banner */}
      <div className="px-5 pt-3 pb-2">
        <div className="bg-gradient-to-r from-surface-container-high via-surface-container-lowest to-surface-container p-4 rounded-2xl shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-sm shrink-0">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <p className="text-[10px] text-primary uppercase tracking-wider font-bold">
                  Admin Portal Live
                </p>
              </div>
              <h2 className="font-display text-[17px] font-bold text-on-surface truncate">
                Sales &amp; Units Sold
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold shadow-sm active:scale-95 transition-all shrink-0"
          >
            <span
              className={`material-symbols-outlined text-base ${
                exportState === 'preparing'
                  ? 'animate-spin text-primary'
                  : exportState === 'done'
                    ? 'text-secondary'
                    : 'text-primary'
              }`}
            >
              {exportState === 'preparing'
                ? 'progress_activity'
                : exportState === 'done'
                  ? 'check_circle'
                  : 'download'}
            </span>
            <span>
              {exportState === 'preparing'
                ? 'Preparing...'
                : exportState === 'done'
                  ? 'Exported!'
                  : 'Export CSV'}
            </span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Pill Selector */}
      <div className="px-5 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="tablist">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All-Time' },
            ] as const
          ).map((r) => {
            const active = dateRange === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all shrink-0 ${
                  active
                    ? 'text-on-primary bg-primary shadow-[0_4px_14px_rgba(103,81,141,0.25)]'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Metrics Bento Grid */}
      <div className="px-5 py-2 grid grid-cols-1 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-fixed/30 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-base text-primary">checkroom</span>
              <span className="text-[12px] font-semibold text-on-surface-variant">
                Total Units Sold
              </span>
            </div>
            <p className="font-display text-[26px] text-on-surface font-bold tracking-tight tabular-nums">
              {displayUnits.toLocaleString()}{' '}
              <span className="text-[14px] text-on-surface-variant font-normal">pcs</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                {rangeMetrics.growth}
              </span>
              <span className="text-[11px] text-on-surface-variant">vs previous period</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0 relative z-10 shadow-inner">
            <span className="material-symbols-outlined text-2xl">loyalty</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-secondary-container/40 rounded-full blur-lg pointer-events-none" />
            <div>
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-2">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
              <span className="text-[11px] text-on-surface-variant block font-semibold">
                Gross Revenue
              </span>
              <p className="font-display text-[19px] text-on-surface font-bold mt-0.5 tabular-nums">
                ${displayRevenue.toLocaleString()}
              </p>
            </div>
            <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">Avg. Order</span>
              <span className="font-bold text-on-surface tabular-nums">
                ${rangeMetrics.avgOrder.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-primary-fixed/40 rounded-full blur-lg pointer-events-none" />
            <div>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-2">
                <span className="material-symbols-outlined text-lg material-symbols-filled">
                  diversity_1
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant block font-semibold">
                Bundle Attach
              </span>
              <p className="font-display text-[19px] text-on-surface font-bold mt-0.5 tabular-nums">
                {rangeMetrics.bundleRate}%
              </p>
            </div>
            <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px]">
              <span className="text-on-surface-variant">Co-Purchase</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-bold">
                +5.2%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Trigger Alert Banner */}
      <div className="px-5 py-2">
        <div
          onClick={() => navigate('admin-inventory')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('admin-inventory')}
          className="cursor-pointer p-3.5 rounded-2xl bg-secondary-fixed/70 text-on-secondary-fixed flex items-start gap-3 shadow-sm active:scale-[0.99] transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-lg">auto_awesome_motion</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold">Restock Trigger Activated</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-secondary text-[10px] font-bold uppercase tracking-wider">
                Fast Moving
              </span>
            </div>
            <p className="text-[12px] mt-0.5 leading-snug">
              Mohair Cardigan (Size S) and Chunky Sneakers (EU 38) hit re-order threshold. Tap to
              review inventory.
            </p>
          </div>
          <span className="material-symbols-outlined text-xl shrink-0">chevron_right</span>
        </div>
      </div>

      {/* Hourly Sales Velocity Chart */}
      <div className="px-5 py-2">
        <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.12)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-on-surface">Hourly Sales Velocity</h3>
                <p className="text-[11px] text-on-surface-variant">
                  Peaks during AI Virtual Try-On sessions
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container text-primary font-bold">
              {rangeMetrics.peakLabel}
            </span>
          </div>

          <div className="w-full h-28 flex items-end justify-between gap-2 pt-4 px-1">
            {rangeMetrics.bars.map((bar) => (
              <div
                key={bar.label}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative"
              >
                {bar.isPeak && (
                  <span className="absolute -top-4 text-[10px] font-bold text-primary tabular-nums">
                    {rangeMetrics.peakCount}
                  </span>
                )}
                <div
                  className={`w-full rounded-full transition-all duration-500 ${
                    bar.isPeak
                      ? 'bg-primary shadow-[0_2px_8px_rgba(103,81,141,0.4)]'
                      : bar.isPink
                        ? 'bg-secondary-fixed'
                        : 'bg-primary-fixed'
                  }`}
                  style={{ height: `${bar.pct}%` }}
                />
                <span
                  className={`text-[10px] ${
                    bar.isPeak ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between text-on-surface-variant text-[11px] bg-surface-container/50 px-3 py-1.5 rounded-full">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">bubble_chart</span>
              64% completed via 3D Room Match
            </span>
            <span className="font-bold text-on-surface">+22m try-on</span>
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-[18px] font-bold text-on-surface">Top Sold Products</h3>
          <span className="text-[11px] text-on-surface-variant font-semibold">
            Ranked by Volume
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all ${
                  active
                    ? 'text-on-primary bg-primary shadow-sm'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Sold Products Ranking List */}
      <div className="px-5 py-2 flex flex-col gap-3">
        {rankedProducts.map((prod, idx) => {
          const estRev = Math.round(prod.soldCount * prod.price);
          return (
            <div
              key={prod.id}
              onClick={() => openProduct(prod.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openProduct(prod.id)}
              className="cursor-pointer p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex gap-3 relative overflow-hidden active:scale-[0.99] transition-transform"
            >
              <div
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-1 ${
                  idx === 0
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {idx + 1}
              </div>

              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <SmartImage
                  src={prod.image}
                  alt={prod.shortTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[10px] text-on-surface flex items-center gap-0.5 font-bold">
                  <span className="material-symbols-outlined text-[11px] text-secondary material-symbols-filled">
                    star
                  </span>
                  {prod.rating.toFixed(1)}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-primary font-bold tracking-wide uppercase">
                      SKU: {prod.sku}
                    </span>
                    <span className="font-display text-[16px] text-on-surface font-bold tabular-nums">
                      ${estRev.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-[14px] text-on-surface font-bold leading-tight truncate mt-0.5">
                    {prod.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between gap-1 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold tabular-nums">
                    {prod.soldCount} sold
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-semibold">
                    <span className="material-symbols-outlined text-xs text-primary material-symbols-filled">
                      auto_awesome
                    </span>
                    <span>{prod.demandTag}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Executive Quick Action Bar */}
      <div className="px-5 pt-3">
        <div className="p-4 rounded-2xl bg-surface-container-high/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-on-surface truncate">
                Weekly Inventory Audit
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                Synced 4 mins ago with warehouse
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('admin-inventory')}
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-[12px] font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1 shrink-0"
          >
            <span>Full Audit</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
