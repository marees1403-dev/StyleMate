import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SmartImage } from '../components/SmartImage';

export const DiscoverScreen: React.FC = () => {
  const { products, user, openProduct, addToCart, toggleWishlist, isWishlisted, navigate } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'price-asc' | 'price-desc' | 'popular'>('match');

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Family Sets', 'Accessories'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesAud =
        user.audienceFocus === 'family' || p.audience === user.audienceFocus || p.audience === 'family';
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && (selectedCategory !== 'All' || matchesAud || q.length > 0) && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return b.soldCount - a.soldCount;
      return b.matchScore - a.matchScore;
    });
  }, [products, search, selectedCategory, user.audienceFocus, sortBy]);

  return (
    <div className="flex flex-col w-full px-5 pt-3 pb-10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[24px] text-on-surface">
            Discover Capsule
          </h1>
          <p className="text-[12px] text-on-surface-variant">
            {filtered.length} pastel pieces harmonized for {user.audienceFocus}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('pair')}
          className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          AI Pair
        </button>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-tertiary text-lg pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cardigan, sneakers, kids..."
            className="w-full pl-10 pr-3 py-2.5 rounded-full bg-surface-container text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          aria-label="Sort catalog"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2.5 rounded-full bg-surface-container-high text-[12px] font-semibold text-on-surface focus:outline-none"
        >
          <option value="match">AI Match</option>
          <option value="popular">Best Selling</option>
          <option value="price-asc">Price: Low</option>
          <option value="price-desc">Price: High</option>
        </select>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-5 px-5">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center flex flex-col items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-primary/60">search_off</span>
          <p className="font-display font-bold text-[16px] text-on-surface">
            No pastel pieces matched "{search}"
          </p>
          <p className="text-[12px] text-on-surface-variant">
            Try clearing your filter or switching category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-2 px-4 py-2 rounded-full bg-primary text-on-primary text-[12px] font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((item) => {
            const liked = isWishlisted(item.id);
            const totalStock = Object.values(item.stockBySize).reduce((s, n) => s + n, 0);
            return (
              <div
                key={item.id}
                onClick={() => openProduct(item.id)}
                className="flex flex-col bg-surface-container-lowest rounded-[2rem] p-2.5 shadow-sm relative group cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-low mb-2">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      totalStock === 0 ? 'grayscale-[40%] opacity-80' : ''
                    }`}
                    fallbackLabel={item.shortTitle}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 text-on-primary text-[10px] font-semibold">
                    {totalStock === 0 ? 'Out of Stock' : `${item.matchScore}% Match`}
                  </span>
                  <button
                    type="button"
                    aria-label="Toggle wishlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id);
                    }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-container-lowest/90 flex items-center justify-center shadow-sm ${
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
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-[13px] font-bold text-on-surface truncate">
                  {item.shortTitle}
                </h3>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[14px] font-bold text-primary tabular-nums">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-outline line-through tabular-nums">
                        ${item.originalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${item.shortTitle} to bag`}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
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
      )}
    </div>
  );
};
