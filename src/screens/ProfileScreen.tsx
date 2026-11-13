import React from 'react';
import { SmartImage } from '../components/SmartImage';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/catalog';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    familyAvatars,
    toggleFamilyMemberSync,
    savedOutfits,
    wishlistIds,
    products,
    orders,
    openProduct,
    toggleWishlist,
    navigate,
    logoutUser,
    equipTryOnItem,
    showToast,
  } = useApp();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleLoadSavedOutfit = (itemIds: string[]) => {
    itemIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      const slot =
        prod.category === 'Bottoms'
          ? 'bottom'
          : prod.category === 'Shoes'
            ? 'shoes'
            : prod.category === 'Bags' || prod.category === 'Accessories'
              ? 'bag'
              : 'top';
      equipTryOnItem(slot, prod.id);
    });
    navigate('tryon');
  };

  return (
    <div className="flex flex-col w-full px-5 pb-10 space-y-5">
      {/* User Header Card */}
      <div className="mt-3 bg-gradient-to-br from-surface-container-high via-primary-fixed/60 to-secondary-fixed/50 rounded-3xl p-5 shadow-[0_8px_24px_rgba(103,81,141,0.12)] relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-surface-container-lowest shadow-md shrink-0">
            <SmartImage
              src={ASSETS.profileAvatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-[21px] font-bold text-on-surface truncate">
                {user.name}
              </h1>
              <span className="material-symbols-outlined text-primary text-base material-symbols-filled">
                verified
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant truncate">{user.familyNickname}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[11px] font-bold tabular-nums">
                {user.stylePts.toLocaleString()} StylePts
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary text-[11px] font-bold">
                {user.enginePrecision}% AI Precision
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-surface-container-lowest/60 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {user.aesthetics.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-surface-container-lowest/85 text-[10px] font-bold text-on-surface"
              >
                {tag}
              </span>
            ))}
          </div>
          {user.isLoggedIn ? (
            <button
              type="button"
              onClick={logoutUser}
              className="text-[11px] font-bold text-secondary hover:underline shrink-0"
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('auth')}
              className="px-3 py-1 rounded-full bg-primary text-on-primary text-[11px] font-bold shrink-0"
            >
              Log In
            </button>
          )}
        </div>
      </div>

      {/* Admin Operations Portal Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_4px_18px_rgba(103,81,141,0.10)] border border-primary/15 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">storefront</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Merchant Console
              </span>
              <h2 className="font-display text-[16px] font-bold text-on-surface leading-tight">
                Admin Operations Portal
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate('admin-sales')}
            className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-primary-fixed/50 text-left transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            <p className="text-[11px] font-bold text-on-surface mt-1 leading-tight">
              Sales &amp; Units
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('admin-inventory')}
            className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-primary-fixed/50 text-left transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-secondary text-lg">inventory_2</span>
            <p className="text-[11px] font-bold text-on-surface mt-1 leading-tight">
              Stock Health
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('admin-reports')}
            className="p-2.5 rounded-2xl bg-surface-container-low hover:bg-primary-fixed/50 text-left transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-primary text-lg">psychology</span>
            <p className="text-[11px] font-bold text-on-surface mt-1 leading-tight">
              Quality Ops
            </p>
          </button>
        </div>
      </div>

      {/* Family Avatars */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold text-on-surface">Family Avatars</h2>
          <button
            type="button"
            onClick={() => navigate('tryon')}
            className="text-[12px] font-bold text-primary"
          >
            Open 3D Room →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {familyAvatars.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                toggleFamilyMemberSync(member.id);
                showToast(`${member.name} avatar sync toggled!`);
              }}
              className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm flex flex-col items-center text-center gap-1.5 active:scale-95 transition-transform"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-on-surface shadow-inner"
                style={{ backgroundColor: member.skinHex }}
              >
                {member.name[0]}
              </div>
              <span className="text-[13px] font-bold text-on-surface">{member.name}</span>
              <span className="text-[10px] text-outline">{member.role}</span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  member.synced
                    ? 'bg-primary-fixed text-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {member.synced ? 'Synced' : 'Paused'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold text-on-surface">
            Recent Orders ({orders.length})
          </h2>
          <button
            type="button"
            onClick={() => navigate('feedback')}
            className="text-[12px] font-bold text-secondary"
          >
            Tune AI (+50 Pts)
          </button>
        </div>
        <div className="space-y-2.5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
            >
              <div
                onClick={() => navigate('tracking', { orderId: order.id })}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-on-surface">{order.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                    {order.status}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {order.items.length} pieces • ${order.totalPaid.toFixed(2)} •{' '}
                  {order.estimatedTouchdown}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('tracking', { orderId: order.id })}
                  className="px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-[11px] font-bold"
                >
                  Track
                </button>
                <button
                  type="button"
                  onClick={() => navigate('feedback')}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-bold"
                >
                  Rate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Outfits */}
      <div className="space-y-2.5">
        <h2 className="font-display text-[18px] font-bold text-on-surface">
          Saved Style Book ({savedOutfits.length})
        </h2>
        <div className="space-y-2.5">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-on-surface truncate">{outfit.name}</p>
                <p className="text-[11px] text-on-surface-variant">
                  {outfit.items.length} pieces • {outfit.compatibilityScore}% Match • $
                  {outfit.totalPrice.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLoadSavedOutfit(outfit.items)}
                className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-[11px] font-bold shrink-0"
              >
                Try in 3D
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="space-y-2.5">
        <h2 className="font-display text-[18px] font-bold text-on-surface">
          Saved Wishlist ({wishlistedProducts.length})
        </h2>
        {wishlistedProducts.length === 0 ? (
          <p className="text-[12px] text-outline bg-surface-container-low p-4 rounded-2xl text-center">
            Tap the heart icon on any item to save pastel favorites here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {wishlistedProducts.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-2.5 shadow-sm relative flex flex-col gap-2"
              >
                <button
                  type="button"
                  aria-label="Remove from wishlist"
                  onClick={() => toggleWishlist(item.id)}
                  className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 text-secondary flex items-center justify-center shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm material-symbols-filled">
                    favorite
                  </span>
                </button>
                <div
                  onClick={() => openProduct(item.id)}
                  className="aspect-square rounded-xl overflow-hidden bg-surface-container-low cursor-pointer"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.shortTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div onClick={() => openProduct(item.id)} className="cursor-pointer">
                  <p className="text-[12px] font-bold text-on-surface truncate">
                    {item.shortTitle}
                  </p>
                  <p className="text-[12px] font-bold text-primary tabular-nums">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
