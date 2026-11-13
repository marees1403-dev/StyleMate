import React, { useState } from 'react';
import { AdminSubNav } from '../components/AdminSubNav';
import { useApp } from '../context/AppContext';

export const AdminReportsScreen: React.FC = () => {
  const { feedbackReports, tweakRigMesh, resolveAllFlaggedReports, showToast } = useApp();
  const [segment, setSegment] = useState<'overview' | 'sizing' | 'color' | 'complaints'>('overview');
  const [dateWindow, setDateWindow] = useState<'30d' | '7d' | 'all'>('30d');

  const openTicketsCount = feedbackReports.filter(
    (r) => r.severity === 'High Priority' || r.severity === 'Medium'
  ).length;

  const filteredReports = feedbackReports.filter((r) => {
    if (segment === 'overview') return true;
    if (segment === 'sizing') {
      return (
        r.attributionTags.includes('Wrong Fit') ||
        r.attributionTags.includes('Correct Size') ||
        r.notes.toLowerCase().includes('sleeve') ||
        r.notes.toLowerCase().includes('size')
      );
    }
    if (segment === 'color') {
      return (
        r.attributionTags.includes('Color Mismatch') ||
        r.attributionTags.includes('Color Match') ||
        r.notes.toLowerCase().includes('shade') ||
        r.notes.toLowerCase().includes('color')
      );
    }
    return r.severity === 'High Priority' || r.severity === 'Medium';
  });

  const handleExportAudit = () => {
    const lines = [
      'STYLEMATE AI — QUALITATIVE DRAPE & SENTIMENT AUDIT',
      `Window: ${dateWindow === '30d' ? 'Last 30 Days' : dateWindow === '7d' ? 'Last 7 Days' : 'All Time'}`,
      `AI Fit Satisfaction: 94.2% | Open Triage Tickets: ${openTicketsCount}`,
      '',
      ...feedbackReports.map(
        (r) => `[${r.code}] (${r.severity}) ${r.itemTitle}: "${r.notes}" -> ${r.status}`
      ),
    ];
    try {
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stylemate-quality-audit.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore fallback
    }
    showToast('Quality Audit Report downloaded!');
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <AdminSubNav />

      {/* Top Ops Header */}
      <div className="px-5 pt-3 pb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
              Research &amp; Engine Ops
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              setDateWindow((w) => (w === '30d' ? '7d' : w === '7d' ? 'all' : '30d'))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              calendar_today
            </span>
            <span className="text-[11px] font-semibold text-on-surface">
              {dateWindow === '30d' ? 'Last 30 Days' : dateWindow === '7d' ? 'Last 7 Days' : 'All Time'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>
        </div>

        <div>
          <h2 className="font-display text-[25px] font-bold text-on-surface leading-tight">
            Quality &amp; Sentiment Intelligence
          </h2>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            Real-time qualitative drape audit &amp; customer perception telemetry
          </p>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-highest rounded-full overflow-x-auto no-scrollbar mt-1">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'sizing', label: 'Sizing & Drape' },
              { id: 'color', label: 'Color Accuracy' },
              { id: 'complaints', label: 'Customer Complaints', dot: openTicketsCount > 0 },
            ] as const
          ).map((t) => {
            const active = segment === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSegment(t.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-[0_2px_8px_rgba(103,81,141,0.25)]'
                    : 'bg-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{t.label}</span>
                {'dot' in t && t.dot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Overview Bento Cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mt-1">
        <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.08)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                sentiment_very_satisfied
              </span>
            </span>
            <span className="text-[10px] text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>+1.4%
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-[24px] font-bold text-on-surface leading-none tabular-nums">
              {dateWindow === '7d' ? '95.1%' : '94.2%'}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">AI Fit Satisfaction</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.08)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </span>
            <span className="text-[10px] text-secondary font-bold bg-secondary-container px-2 py-0.5 rounded-full">
              Tier 1
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-[24px] font-bold text-on-surface leading-none tabular-nums">
              4.8 <span className="text-[12px] text-outline font-normal">/ 5.0</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Relevance Score</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.08)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">assignment_return</span>
            </span>
            <span className="text-[10px] text-on-secondary-container font-bold bg-secondary-container px-2 py-0.5 rounded-full">
              -15.9% vs Ind.
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-[24px] font-bold text-on-surface leading-none tabular-nums">
              2.1%
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Dissatisfaction Rate</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-[0_4px_18px_rgba(157,133,197,0.08)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">inbox</span>
            </span>
            <span className="text-[10px] text-on-primary-fixed-variant font-bold bg-primary-fixed px-2 py-0.5 rounded-full">
              Triage
            </span>
          </div>
          <div className="mt-3">
            <div className="font-display text-[24px] font-bold text-on-surface leading-none tabular-nums">
              {openTicketsCount} Active
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Open Tickets</p>
          </div>
        </div>
      </div>

      {/* Physical vs 3D Reality Match */}
      <div className="px-5 mt-5">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">view_in_ar</span>
              <h3 className="font-display text-[17px] font-bold text-on-surface">
                Physical vs 3D Reality Match
              </h3>
            </div>
            <span className="text-[10px] text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-full">
              Engine v4.2
            </span>
          </div>

          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5 text-[12px]">
              <span className="font-semibold text-on-surface">True to 3D Drape Avatar</span>
              <span className="font-bold text-primary">92%</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px] text-outline">
              <span>Simulated cloth fall &amp; stretch tension</span>
              <span>4,120 ratings</span>
            </div>
          </div>

          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5 text-[12px]">
              <span className="font-semibold text-on-surface">Color Matches Chibi Palette</span>
              <span className="font-bold text-secondary">96%</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-secondary rounded-full" style={{ width: '96%' }} />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px] text-outline">
              <span>sRGB &amp; D65 daylight spectrophotometer sync</span>
              <span>5,890 ratings</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 text-[12px]">
              <span className="font-semibold text-on-surface">
                Fabric Texture Feel in Real Life
              </span>
              <span className="font-bold text-primary-container">89%</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '89%' }} />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px] text-outline">
              <span>Tactile softness vs prompt render</span>
              <span>3,640 ratings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Tuning Action */}
      <div className="px-5 mt-4">
        <div className="rounded-2xl bg-surface-container p-4 shadow-[0_4px_18px_rgba(157,133,197,0.1)]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                  Automated Tuning Action
                </span>
                <span className="text-[11px] text-outline">Deployed 2h ago</span>
              </div>
              <p className="text-[13px] text-on-surface mt-1 leading-snug">
                Latent space recommendation vector adjustment:{' '}
                <span className="font-bold text-secondary">+4.2% penalty</span> on sleeve length
                discrepancy.
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[13px] text-primary">
                    model_training
                  </span>
                  Weights updated for Rig_v9
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly & Sentiment Feed */}
      <div className="px-5 mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[18px] font-bold text-on-surface">
            Anomaly &amp; Sentiment Feed ({filteredReports.length})
          </h3>
          <span className="text-[11px] text-outline font-semibold">Live Sync</span>
        </div>

        {filteredReports.map((rep) => {
          const isHigh = rep.severity === 'High Priority';
          const isMed = rep.severity === 'Medium';
          const isPos = rep.severity === 'Positive Research Insight';
          const isRes = rep.severity === 'Resolved';

          return (
            <div
              key={rep.id}
              className={`p-4 rounded-2xl shadow-[0_4px_18px_rgba(157,133,197,0.08)] flex flex-col gap-2.5 ${
                isPos
                  ? 'bg-surface-container-low'
                  : isRes
                    ? 'bg-surface-container-lowest opacity-85'
                    : 'bg-surface-container-lowest'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-on-surface">{rep.code}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : isMed
                          ? 'bg-surface-container-highest text-on-surface-variant'
                          : isPos
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-surface-container text-outline'
                    }`}
                  >
                    {rep.severity}
                  </span>
                </div>
                <span className="text-[11px] text-outline">{rep.timeAgo}</span>
              </div>

              <p className="text-[13px] text-on-surface leading-snug">“{rep.notes}”</p>

              <div className="flex items-center justify-between pt-1 gap-2">
                {isPos ? (
                  <>
                    <span className="text-[11px] text-primary font-bold truncate">
                      {rep.capsuleName || rep.itemTitle}
                    </span>
                    <span className="text-[11px] text-outline shrink-0">{rep.status}</span>
                  </>
                ) : isRes ? (
                  <>
                    <span className="text-[11px] text-primary font-medium">{rep.status}</span>
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isHigh ? 'bg-secondary' : 'bg-primary'
                        }`}
                      />
                      <span className="text-[11px] text-on-surface-variant truncate">
                        {rep.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => tweakRigMesh(rep.id)}
                      className="px-3 py-1.5 rounded-full bg-surface-container-high text-primary text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">tune</span>
                      Tweak 3D Rig Mesh
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Buttons */}
      <div className="px-5 mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={resolveAllFlaggedReports}
          disabled={openTicketsCount === 0}
          className="w-full py-3.5 px-4 rounded-full bg-primary text-on-primary font-bold text-[13px] shadow-[0_8px_24px_rgba(103,81,141,0.22)] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          {openTicketsCount > 0
            ? `Resolve Flagged Complaints (${openTicketsCount})`
            : 'All Flagged Complaints Resolved ✓'}
        </button>

        <button
          type="button"
          onClick={handleExportAudit}
          className="w-full py-3.5 px-4 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-bold text-[13px] active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          Export Quality Audit Report
        </button>
      </div>
    </div>
  );
};
