import React, { useState } from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';

const POSITIVE_TAGS = ['Correct Size', 'Color Match', 'Right Price'];
const NEGATIVE_TAGS = ['Wrong Fit', 'Color Mismatch', 'Too Expensive'];

export const FeedbackScreen: React.FC = () => {
  const { products, user, submitFeedback, navigate } = useApp();

  const [selectedItemId, setSelectedItemId] = useState(products[0].id);
  const [rating, setRating] = useState(5);
  const [relevant, setRelevant] = useState(true);
  const [wouldWear, setWouldWear] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Correct Size', 'Color Match']);
  const [harmonyScore, setHarmonyScore] = useState(9);
  const [notes, setNotes] = useState(
    'The baby mohair texture preview in 3D looked exact in person! Co-purchase suggested slacks were a dream pairing for family photos.'
  );
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedItemId) || products[0];
  const trousersProduct = products.find((p) => p.id === 'prod-trousers') || products[1];
  const sneakersProduct = products.find((p) => p.id === 'prod-sneakers') || products[2];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      itemId: selectedProduct.id,
      itemTitle: selectedProduct.title,
      rating,
      relevant,
      wouldWear,
      attributionTags: selectedTags,
      harmonyScore,
      notes,
    });
    setSubmitted(true);
  };

  const ratingLabel =
    rating === 5
      ? '5.0 • Exceptional Match'
      : rating === 4
        ? '4.0 • Great Pastel Fit'
        : rating === 3
          ? '3.0 • Room to Calibrate'
          : `${rating}.0 • Needs Rig Adjustment`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full px-5 pb-10 space-y-4">
      {/* Sub-header & Mission Ribbon */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base material-symbols-filled">
              auto_awesome
            </span>
            <span className="text-[11px] text-primary font-bold uppercase tracking-wider">
              Reinforcement Tuning
            </span>
          </div>
          <h2 className="font-display text-[20px] font-bold text-on-surface">
            Help StyleMate Learn
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-secondary-fixed/60 px-3 py-1.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-secondary text-sm material-symbols-filled">
            stars
          </span>
          <span className="text-[11px] text-on-secondary-fixed font-bold">+50 Pts</span>
        </div>
      </div>

      {/* Personal Aesthetic Snapshot */}
      <div className="relative overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-variant rounded-3xl p-4 shadow-[0_8px_24px_rgba(103,81,141,0.08)]">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 top-3 text-primary-fixed-dim/70 select-none">
          <span className="material-symbols-outlined text-4xl">psychology</span>
        </div>
        <div className="relative z-10 flex flex-col space-y-2.5">
          <p className="text-[13px] text-on-surface-variant pr-8 leading-snug">
            Your tactile ratings directly refine our latent drape embeddings and match predictions.
          </p>
          <div className="bg-surface-container-lowest/85 backdrop-blur-md rounded-2xl p-3 flex flex-col space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-tertiary font-semibold">Active Persona</span>
              <span className="text-[11px] text-primary font-bold bg-primary-fixed/50 px-2.5 py-0.5 rounded-full">
                Soft Pastel Dollcore
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-sm material-symbols-filled">
                  favorite
                </span>
                <span className="text-[12px] text-on-surface font-semibold">Engine Precision</span>
              </div>
              <span className="text-[14px] text-secondary font-bold tabular-nums">
                {user.enginePrecision}%
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${user.enginePrecision}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="bg-primary-fixed/70 border border-primary/20 rounded-3xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-[14px]">
            <span className="material-symbols-outlined material-symbols-filled">check_circle</span>
            <span>Feedback Tuned! +50 StylePts Earned</span>
          </div>
          <p className="text-[12px] text-on-primary-fixed-variant">
            Your StylePts balance is now <strong>{user.stylePts} Pts</strong> and your report was
            synced to Qualitative Research Operations.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('admin-reports')}
              className="px-3.5 py-2 rounded-full bg-primary text-on-primary text-[11px] font-bold"
            >
              View in Qualitative Reports
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-3.5 py-2 rounded-full bg-surface-container-lowest text-on-surface text-[11px] font-bold"
            >
              Rate Another Item
            </button>
          </div>
        </div>
      )}

      {/* Item Evaluation Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex flex-col space-y-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
            Select Garment to Rate
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="max-w-[200px] bg-surface-container-low rounded-full px-3 py-1 text-[11px] font-bold text-primary outline-none"
          >
            {products.slice(0, 6).map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-container shrink-0 shadow-inner">
            <SmartImage
              src={selectedProduct.image}
              alt={selectedProduct.shortTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-surface-container-lowest/90 rounded-full px-1.5 py-0.5 shadow-sm">
              <span className="text-[10px] text-primary font-bold">3D Fit</span>
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
                Try-On Rating
              </span>
              <span className="text-[12px] text-on-surface-variant font-bold tabular-nums">
                ${selectedProduct.price.toFixed(2)}
              </span>
            </div>
            <h3 className="font-display text-[17px] font-bold text-on-surface truncate">
              {selectedProduct.title}
            </h3>
            <p className="text-[12px] text-tertiary">Matched for: Family Weekend Stroll</p>
          </div>
        </div>

        {/* 5-Star Rating Selector */}
        <div className="flex flex-col items-center py-2.5 bg-surface-container-low rounded-2xl">
          <span className="text-[11px] text-tertiary mb-1.5 font-semibold">
            Tap to rate satisfaction
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} Star`}
                onClick={() => setRating(star)}
                className={`transition-transform active:scale-90 ${
                  star <= rating ? 'text-primary' : 'text-outline-variant'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-3xl ${
                    star <= rating ? 'material-symbols-filled' : ''
                  }`}
                >
                  star
                </span>
              </button>
            ))}
          </div>
          <span className="text-[12px] text-primary font-bold mt-1">{ratingLabel}</span>
        </div>

        {/* Binary Questions */}
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-[12px] text-on-surface font-semibold block mb-2">
              Was this recommendation relevant to your style?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRelevant(true)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-[12px] font-bold active:scale-95 transition-all ${
                  relevant
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-lg material-symbols-filled">
                  thumb_up
                </span>
                Relevant
              </button>
              <button
                type="button"
                onClick={() => setRelevant(false)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-[12px] font-bold active:scale-95 transition-all ${
                  !relevant
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-lg">thumb_down</span>
                Irrelevant
              </button>
            </div>
          </div>

          <div>
            <span className="text-[12px] text-on-surface font-semibold block mb-2">
              Would you wear this complete outfit out?
            </span>
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'yes', label: 'Yes, love it!' },
                  { id: 'maybe', label: 'Maybe' },
                  { id: 'no', label: 'Not for me' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWouldWear(opt.id)}
                  className={`flex-1 py-2 px-2.5 rounded-full text-[12px] text-center active:scale-95 transition-all font-bold ${
                    wouldWear === opt.id
                      ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Attribution Tags */}
        <div className="pt-1">
          <span className="text-[11px] text-tertiary uppercase tracking-wider font-bold block mb-2">
            Detailed Attribution Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[...POSITIVE_TAGS, ...NEGATIVE_TAGS].map((tag) => {
              const active = selectedTags.includes(tag);
              const isPos = POSITIVE_TAGS.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                    active
                      ? isPos
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-secondary text-on-secondary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span>{tag}</span>
                  {active && <span className="material-symbols-outlined text-sm">check</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Co-Purchase Pairing Quality */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_18px_rgba(157,133,197,0.12)] flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">palette</span>
            <h3 className="font-display text-[17px] font-bold text-on-surface">
              Co-Purchase Pairing Quality
            </h3>
          </div>
          <span className="text-[11px] bg-surface-container-high text-primary px-2.5 py-1 rounded-full font-bold">
            Capsule #14
          </span>
        </div>

        <div className="bg-surface-container-low p-3 rounded-2xl flex items-center justify-around gap-2">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest shadow-sm">
              <SmartImage
                src={selectedProduct.image}
                alt={selectedProduct.shortTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-tertiary mt-1 font-semibold">Cardigan</span>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-sm">add</span>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest shadow-sm">
              <SmartImage
                src={trousersProduct.image}
                alt={trousersProduct.shortTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-tertiary mt-1 font-semibold">Blush Slacks</span>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-sm">add</span>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-highest shadow-sm">
              <SmartImage
                src={sneakersProduct.image}
                alt={sneakersProduct.shortTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-tertiary mt-1 font-semibold">Sneakers</span>
          </div>
        </div>

        {/* Harmony Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="harmony-slider" className="text-[12px] text-on-surface font-semibold">
              How harmonized did the colors feel?
            </label>
            <div className="flex items-center gap-1 bg-primary-fixed/60 px-2.5 py-0.5 rounded-full">
              <span className="text-[13px] text-on-primary-fixed font-bold tabular-nums">
                {harmonyScore}
              </span>
              <span className="text-[11px] text-tertiary">/ 10</span>
            </div>
          </div>
          <input
            id="harmony-slider"
            type="range"
            min={1}
            max={10}
            value={harmonyScore}
            onChange={(e) => setHarmonyScore(Number(e.target.value))}
            className="w-full h-2.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-tertiary px-1">
            <span>Clashing (1)</span>
            <span className="text-primary font-bold">Harmonious ({harmonyScore})</span>
            <span>Perfection (10)</span>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="review-notes"
            className="text-[12px] text-on-surface font-semibold flex items-center justify-between"
          >
            <span>Styling Observation (Optional)</span>
            <span className="text-[11px] text-tertiary font-normal">Encrypted Research</span>
          </label>
          <div className="relative">
            <textarea
              id="review-notes"
              rows={3}
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share how the outfit draped or why this aesthetic clicked..."
              className="w-full bg-surface-container-low text-on-surface text-[13px] rounded-2xl p-3 pb-7 focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-tertiary-fixed-dim"
            />
            <span className="absolute bottom-2.5 right-3 text-[11px] text-tertiary tabular-nums">
              {notes.length} / 300
            </span>
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="pt-1 flex flex-col space-y-3">
        <button
          type="submit"
          className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-[14px] shadow-[0_8px_24px_rgba(103,81,141,0.25)] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl material-symbols-filled">
            auto_awesome
          </span>
          <span>Submit Feedback &amp; Earn 50 StylePts</span>
        </button>

        <div className="flex items-start gap-2 px-3 py-2 bg-surface-container-low/70 rounded-2xl">
          <span className="material-symbols-outlined text-tertiary text-base mt-0.5">science</span>
          <p className="text-[11px] text-tertiary leading-snug">
            <strong className="font-semibold text-on-surface-variant">
              Research Prototype Note:
            </strong>{' '}
            Explicit human-in-the-loop ratings update reciprocal rank scores and sync directly to
            the Admin Qualitative Reports feed.
          </p>
        </div>
      </div>
    </form>
  );
};
