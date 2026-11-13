import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Audience,
  CartItem,
  DeliveryAddress,
  FamilyMemberAvatar,
  FeedbackReport,
  OrderRecord,
  Product,
  PurchaseOrder,
  SavedOutfit,
  ScreenId,
  UserState,
} from '../types';
import {
  DEFAULT_ADDRESS,
  INITIAL_CART_ITEMS,
  INITIAL_FAMILY_AVATARS,
  INITIAL_FEEDBACK_REPORTS,
  INITIAL_ORDERS,
  INITIAL_POS,
  INITIAL_PRODUCTS,
} from '../data/catalog';

interface ToastState {
  id: number;
  message: string;
  tone?: 'primary' | 'secondary' | 'error';
}

interface AppContextValue {
  screen: ScreenId;
  screenHistory: ScreenId[];
  navigate: (next: ScreenId, options?: { productId?: string; orderId?: string }) => void;
  goBack: () => void;

  user: UserState;
  setAudienceFocus: (audience: Audience) => void;
  toggleAesthetic: (tag: string) => void;
  completeOnboarding: () => void;
  loginUser: (email: string, rememberAvatar: boolean) => void;
  registerUser: (email: string, familyNickname: string, rememberAvatar: boolean) => void;
  continueAsGuest: () => void;
  logoutUser: () => void;
  updateUserBody: (updates: Partial<Pick<UserState, 'height' | 'silhouette' | 'skinTone' | 'skinHex' | 'avatarMode'>>) => void;

  familyAvatars: FamilyMemberAvatar[];
  toggleFamilyMemberSync: (id: string) => void;

  products: Product[];
  selectedProductId: string;
  openProduct: (productId: string) => void;
  addReviewToProduct: (productId: string, author: string, rating: number, comment: string, sizeBought: string) => void;

  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  bundleDiscount: number;
  addToCart: (product: Product, options?: { color?: string; size?: string; quantity?: number; matchTag?: string }) => void;
  addCustomCartItems: (items: Omit<CartItem, 'id'>[]) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  moveCartItemToWishlist: (cartItemId: string) => void;

  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, itemIds: string[], totalPrice: number, compatibilityScore: number) => void;

  tryOnSlots: { top: string; bottom: string; shoes: string; bag: string };
  equipTryOnItem: (slot: 'top' | 'bottom' | 'shoes' | 'bag', productId: string) => void;
  resetTryOnOutfit: () => void;

  address: DeliveryAddress;
  updateAddress: (addr: DeliveryAddress) => void;

  orders: OrderRecord[];
  activeOrderId: string;
  setActiveOrderId: (id: string) => void;
  placeOrder: (params: {
    shippingMethod: 'eco' | 'flash';
    paymentMethod: string;
    voucherCode?: string;
    voucherDiscount: number;
  }) => OrderRecord;
  updateOrderInstructions: (orderId: string, instructions: string) => void;
  toggleOrderRingSoftly: (orderId: string) => void;
  advanceOrderTrackingStep: (orderId: string) => void;

  feedbackReports: FeedbackReport[];
  submitFeedback: (payload: {
    itemId: string;
    itemTitle: string;
    rating: number;
    relevant: boolean;
    wouldWear: 'yes' | 'maybe' | 'no';
    attributionTags: string[];
    harmonyScore: number;
    notes: string;
  }) => void;

  purchaseOrders: PurchaseOrder[];
  restockProduct: (productId: string, units: number) => void;
  notifyWaitlist: (productId: string) => void;
  notifiedProductIds: string[];
  tweakRigMesh: (reportId: string) => void;
  resolveAllFlaggedReports: () => void;
  adjustProductStock: (productId: string, size: string, delta: number) => void;

  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toast: ToastState | null;
  showToast: (message: string, tone?: 'primary' | 'secondary' | 'error') => void;
}

const STORAGE_KEY = 'stylemate_app_state_v1';

const DEFAULT_USER: UserState = {
  name: 'Mia Jenkins',
  email: 'mia.jenkins@stylemate.ai',
  familyNickname: 'The Jenkins Clan',
  isLoggedIn: false,
  isGuest: false,
  rememberAvatar: true,
  stylePts: 1420,
  audienceFocus: 'women',
  aesthetics: ['Soft Pastel'],
  avatarMode: 'chibi',
  height: '5\'4" (163 cm)',
  silhouette: 'Petite Silhouette',
  skinTone: 'Warm Fair',
  skinHex: '#E8C3B9',
  enginePrecision: 92.4,
};

const DEFAULT_TRYON_SLOTS = {
  top: 'prod-cardigan',
  bottom: 'prod-trousers',
  shoes: 'prod-sneakers',
  bag: 'prod-heart-bag',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore storage errors
    }
    return null;
  };

  const saved = useMemo(() => loadSaved(), []);

  const [screen, setScreen] = useState<ScreenId>(saved?.screen || 'welcome');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>(saved?.screenHistory || []);
  const [user, setUser] = useState<UserState>(saved?.user || DEFAULT_USER);
  const [familyAvatars, setFamilyAvatars] = useState<FamilyMemberAvatar[]>(
    saved?.familyAvatars || INITIAL_FAMILY_AVATARS
  );
  const [products, setProducts] = useState<Product[]>(saved?.products || INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    saved?.selectedProductId || INITIAL_PRODUCTS[0].id
  );
  const [cart, setCart] = useState<CartItem[]>(saved?.cart || INITIAL_CART_ITEMS);
  const [wishlistIds, setWishlistIds] = useState<string[]>(
    saved?.wishlistIds || ['prod-cardigan', 'prod-heart-bag', 'prod-kids-pinafore', 'prod-puffer-tote']
  );
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(
    saved?.savedOutfits || [
      {
        id: 'outfit-spring-hugs',
        name: 'Spring Hugs Capsule',
        items: ['prod-cardigan', 'prod-trousers', 'prod-sneakers', 'prod-heart-bag'],
        totalPrice: 166.6,
        compatibilityScore: 98,
        createdAt: '2 days ago',
      },
    ]
  );
  const [tryOnSlots, setTryOnSlots] = useState<{
    top: string;
    bottom: string;
    shoes: string;
    bag: string;
  }>(saved?.tryOnSlots || DEFAULT_TRYON_SLOTS);
  const [address, setAddress] = useState<DeliveryAddress>(saved?.address || DEFAULT_ADDRESS);
  const [orders, setOrders] = useState<OrderRecord[]>(saved?.orders || INITIAL_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState<string>(
    saved?.activeOrderId || INITIAL_ORDERS[0].id
  );
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>(
    saved?.feedbackReports || INITIAL_FEEDBACK_REPORTS
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    saved?.purchaseOrders || INITIAL_POS
  );
  const [notifiedProductIds, setNotifiedProductIds] = useState<string[]>(
    saved?.notifiedProductIds || []
  );

  const [isChatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          screen,
          screenHistory: screenHistory.slice(-15),
          user,
          familyAvatars,
          products,
          selectedProductId,
          cart,
          wishlistIds,
          savedOutfits,
          tryOnSlots,
          address,
          orders,
          activeOrderId,
          feedbackReports,
          purchaseOrders,
          notifiedProductIds,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [
    screen,
    screenHistory,
    user,
    familyAvatars,
    products,
    selectedProductId,
    cart,
    wishlistIds,
    savedOutfits,
    tryOnSlots,
    address,
    orders,
    activeOrderId,
    feedbackReports,
    purchaseOrders,
    notifiedProductIds,
  ]);

  const showToast = (message: string, tone: 'primary' | 'secondary' | 'error' = 'primary') => {
    const id = Date.now();
    setToast({ id, message, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2600);
  };

  const navigate = (next: ScreenId, options?: { productId?: string; orderId?: string }) => {
    if (options?.productId) setSelectedProductId(options.productId);
    if (options?.orderId) setActiveOrderId(options.orderId);
    if (next !== screen) {
      setScreenHistory((prev) => [...prev.slice(-14), screen]);
      setScreen(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setScreenHistory((prev) => {
      if (prev.length === 0) {
        setScreen('home');
        return [];
      }
      const next = prev[prev.length - 1];
      setScreen(next);
      return prev.slice(0, -1);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setAudienceFocus = (audienceFocus: Audience) => {
    setUser((prev) => ({ ...prev, audienceFocus }));
  };

  const toggleAesthetic = (tag: string) => {
    setUser((prev) => {
      const exists = prev.aesthetics.includes(tag);
      const next = exists ? prev.aesthetics.filter((t) => t !== tag) : [...prev.aesthetics, tag];
      return { ...prev, aesthetics: next };
    });
  };

  const completeOnboarding = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: true, isGuest: false }));
    navigate('home');
    showToast('Welcome to StyleMate AI! Your moodboard is ready.');
  };

  const loginUser = (email: string, rememberAvatar: boolean) => {
    const firstName = email.split('@')[0]?.split('.')[0] || 'Mia';
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    setUser((prev) => ({
      ...prev,
      email,
      name: formattedName === 'Chibi' ? 'Mia Jenkins' : formattedName,
      isLoggedIn: true,
      isGuest: false,
      rememberAvatar,
    }));
    navigate('home');
    showToast(`Welcome back, ${formattedName === 'Chibi' ? 'Mia' : formattedName}!`);
  };

  const registerUser = (email: string, familyNickname: string, rememberAvatar: boolean) => {
    const firstName = email.split('@')[0]?.split('.')[0] || 'Mia';
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    setUser((prev) => ({
      ...prev,
      email,
      name: formattedName,
      familyNickname: familyNickname || 'The StyleMate Family',
      isLoggedIn: true,
      isGuest: false,
      rememberAvatar,
      stylePts: prev.stylePts + 100,
    }));
    navigate('home');
    showToast('Chibi Closet created! +100 Welcome StylePts awarded.');
  };

  const continueAsGuest = () => {
    setUser((prev) => ({ ...prev, isGuest: true, isLoggedIn: false, name: 'Guest Stylist' }));
    navigate('home');
    showToast('Welcome, Guest Stylist! Happy exploring.');
  };

  const logoutUser = () => {
    setUser((prev) => ({ ...prev, isLoggedIn: false, isGuest: false }));
    navigate('auth');
    showToast('Signed out of StyleMate AI.');
  };

  const updateUserBody = (
    updates: Partial<Pick<UserState, 'height' | 'silhouette' | 'skinTone' | 'skinHex' | 'avatarMode'>>
  ) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const toggleFamilyMemberSync = (id: string) => {
    setFamilyAvatars((prev) =>
      prev.map((m) => (m.id === id ? { ...m, synced: !m.synced } : m))
    );
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    navigate('product', { productId });
  };

  const addReviewToProduct = (
    productId: string,
    author: string,
    rating: number,
    comment: string,
    sizeBought: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newReviews = [
          {
            id: `rev-${Date.now()}`,
            author,
            verified: true,
            rating,
            comment,
            sizeBought,
            date: 'Just now',
          },
          ...p.reviews,
        ];
        return {
          ...p,
          reviewCount: p.reviewCount + 1,
          reviews: newReviews,
        };
      })
    );
    showToast('Thank you! Your verified review is now live.');
  };

  const addToCart = (
    product: Product,
    options?: { color?: string; size?: string; quantity?: number; matchTag?: string }
  ) => {
    const color = options?.color || product.colors[0]?.name || 'Pastel Lilac';
    const size = options?.size || product.sizes[0] || 'S';
    const quantity = options?.quantity || 1;
    const matchTag = options?.matchTag || product.demandTag;

    const totalStock = Object.values(product.stockBySize).reduce((sum, n) => sum + n, 0);
    if (totalStock <= 0) {
      showToast('This item is currently out of stock. Join the drop waitlist!', 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (c) => c.productId === product.id && c.color === color && c.size === size
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          title: product.shortTitle,
          price: product.price,
          image: product.image,
          color,
          size,
          quantity,
          audience: product.audience,
          matchTag,
          stockNote: totalStock < 20 ? `In Stock (${totalStock} left)` : 'In Stock',
        },
      ];
    });
    showToast(`${product.shortTitle} added to your bag!`);
  };

  const addCustomCartItems = (items: Omit<CartItem, 'id'>[]) => {
    setCart((prev) => {
      const next = [...prev];
      items.forEach((item) => {
        const idx = next.findIndex(
          (c) =>
            c.productId === item.productId && c.color === item.color && c.size === item.size
        );
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        } else {
          next.push({
            ...item,
            id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          });
        }
      });
      return next;
    });
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === cartItemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
    showToast('Item removed from bag.');
  };

  const moveCartItemToWishlist = (cartItemId: string) => {
    const found = cart.find((c) => c.id === cartItemId);
    if (found) {
      setWishlistIds((prev) => (prev.includes(found.productId) ? prev : [...prev, found.productId]));
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
      showToast(`${found.title} moved to Saved Wishlist!`);
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist!');
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const saveOutfit = (
    name: string,
    itemIds: string[],
    totalPrice: number,
    compatibilityScore: number
  ) => {
    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}`,
      name,
      items: itemIds,
      totalPrice,
      compatibilityScore,
      createdAt: 'Just now',
    };
    setSavedOutfits((prev) => [newOutfit, ...prev]);
    showToast(`${name} saved to your Style Book!`);
  };

  const equipTryOnItem = (slot: 'top' | 'bottom' | 'shoes' | 'bag', productId: string) => {
    setTryOnSlots((prev) => ({ ...prev, [slot]: productId }));
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      showToast(`Equipped ${prod.shortTitle} on 3D Avatar!`);
    }
  };

  const resetTryOnOutfit = () => {
    setTryOnSlots(DEFAULT_TRYON_SLOTS);
    showToast('3D Stage reset to Sweet Lilac Capsule.');
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const bundleDiscount = useMemo(
    () => (cartCount >= 3 ? Number((cartSubtotal * 0.15).toFixed(2)) : 0),
    [cartCount, cartSubtotal]
  );

  const updateAddress = (addr: DeliveryAddress) => {
    setAddress(addr);
    showToast('Delivery Cozy-Nest address updated!');
  };

  const placeOrder = (params: {
    shippingMethod: 'eco' | 'flash';
    paymentMethod: string;
    voucherCode?: string;
    voucherDiscount: number;
  }): OrderRecord => {
    const shippingCost = params.shippingMethod === 'flash' ? 5.99 : 0;
    const totalPaid = Math.max(
      0,
      Number((cartSubtotal - bundleDiscount - params.voucherDiscount + shippingCost).toFixed(2))
    );
    const orderNumber = `#SM-${Math.floor(89242 + Math.random() * 900)}`;

    const newOrder: OrderRecord = {
      id: orderNumber,
      status: 'Packed',
      step: 1,
      estimatedTouchdown: params.shippingMethod === 'flash' ? 'Today, by 7:00 PM' : 'In 2-3 cozy days',
      courierName: 'Baby Pip',
      items: [...cart],
      subtotal: Number(cartSubtotal.toFixed(2)),
      bundleDiscount,
      voucherCode: params.voucherCode,
      voucherDiscount: params.voucherDiscount,
      shippingMethod: params.shippingMethod,
      shippingCost,
      totalPaid,
      paymentMethod: params.paymentMethod,
      address,
      deliveryInstructions: 'Handle with doll-care! Leave on porch bench.',
      ringSoftly: false,
      createdAt: 'Just now',
    };

    // Update product sold counts & stock
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedQty = cart
          .filter((c) => c.productId === prod.id)
          .reduce((sum, c) => sum + c.quantity, 0);
        if (orderedQty === 0) return prod;
        const nextStockBySize = { ...prod.stockBySize };
        cart
          .filter((c) => c.productId === prod.id)
          .forEach((c) => {
            if (typeof nextStockBySize[c.size] === 'number') {
              nextStockBySize[c.size] = Math.max(0, nextStockBySize[c.size] - c.quantity);
            }
          });
        return {
          ...prod,
          soldCount: prod.soldCount + orderedQty,
          stockBySize: nextStockBySize,
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    setCart([]);
    setUser((prev) => ({
      ...prev,
      stylePts: prev.stylePts + Math.round(totalPaid * 0.5),
    }));

    return newOrder;
  };

  const updateOrderInstructions = (orderId: string, instructions: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryInstructions: instructions } : o))
    );
    showToast('Delivery instructions updated for Baby Pip!');
  };

  const toggleOrderRingSoftly = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ringSoftly: !o.ringSoftly } : o))
    );
  };

  const advanceOrderTrackingStep = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextStep = o.step >= 4 ? 1 : o.step + 1;
        const statusMap: Record<number, OrderRecord['status']> = {
          1: 'Packed',
          2: 'Dispatched',
          3: 'Out for Delivery',
          4: 'Delivered',
        };
        return { ...o, step: nextStep, status: statusMap[nextStep] };
      })
    );
  };

  const submitFeedback = (payload: {
    itemId: string;
    itemTitle: string;
    rating: number;
    relevant: boolean;
    wouldWear: 'yes' | 'maybe' | 'no';
    attributionTags: string[];
    harmonyScore: number;
    notes: string;
  }) => {
    const isNegative =
      payload.rating <= 3 ||
      !payload.relevant ||
      payload.attributionTags.some((t) => ['Wrong Fit', 'Color Mismatch', 'Too Expensive'].includes(t));

    const newReport: FeedbackReport = {
      id: `fb-${Date.now()}`,
      code: isNegative ? `#TCK-${Math.floor(403 + Math.random() * 90)}` : `#FB-${Math.floor(1103 + Math.random() * 90)}`,
      itemId: payload.itemId,
      itemTitle: payload.itemTitle,
      rating: payload.rating,
      relevant: payload.relevant,
      wouldWear: payload.wouldWear,
      attributionTags: payload.attributionTags,
      harmonyScore: payload.harmonyScore,
      notes:
        payload.notes.trim() ||
        `Rated ${payload.rating}/5 stars • Color Harmony ${payload.harmonyScore}/10`,
      severity: isNegative ? 'High Priority' : 'Positive Research Insight',
      status: isNegative ? 'Under Pattern Review' : 'Verified Buyer',
      timeAgo: 'Just now',
      capsuleName: 'Capsule #14 • Soft Pastel Dollcore',
    };

    setFeedbackReports((prev) => [newReport, ...prev]);
    setUser((prev) => ({
      ...prev,
      stylePts: prev.stylePts + 50,
      enginePrecision: Number(Math.min(99.4, prev.enginePrecision + 0.4).toFixed(1)),
    }));
    showToast('Feedback saved! +50 StylePts earned & vector weights updated.');
  };

  const restockProduct = (productId: string, units: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const po: PurchaseOrder = {
      id: `PO #${Math.floor(9480 + Math.random() * 99)}`,
      sku: target.sku,
      productTitle: target.shortTitle,
      units,
      supplier: 'PastelKnit Atelier Mill',
      status: 'Dispatched',
      createdAt: 'Just now',
    };

    setPurchaseOrders((prev) => [po, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const sizeKeys = Object.keys(p.stockBySize);
        const perSize = Math.floor(units / Math.max(1, sizeKeys.length));
        const nextStock = { ...p.stockBySize };
        sizeKeys.forEach((k, i) => {
          nextStock[k] = (nextStock[k] || 0) + perSize + (i === 0 ? units % sizeKeys.length : 0);
        });
        return {
          ...p,
          stockBySize: nextStock,
          isRestockScheduled: true,
          inboundEta: 'ETA Tomorrow',
          inboundQty: units,
        };
      })
    );
    showToast(`${po.id} issued (+${units} units) for ${target.shortTitle}!`);
  };

  const notifyWaitlist = (productId: string) => {
    if (!notifiedProductIds.includes(productId)) {
      setNotifiedProductIds((prev) => [...prev, productId]);
    }
    showToast('Waitlist drop alerts queued for 89 shoppers!');
  };

  const tweakRigMesh = (reportId: string) => {
    setFeedbackReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              severity: 'Resolved',
              status: '3D Rig Mesh Calibrated • Resolved',
            }
          : r
      )
    );
    showToast('3D Rig Mesh updated & ticket resolved!');
  };

  const resolveAllFlaggedReports = () => {
    setFeedbackReports((prev) =>
      prev.map((r) =>
        r.severity === 'High Priority' || r.severity === 'Medium'
          ? { ...r, severity: 'Resolved', status: 'Resolved via Quality Audit Batch' }
          : r
      )
    );
    showToast('All flagged complaints marked as resolved!');
  };

  const adjustProductStock = (productId: string, size: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const current = p.stockBySize[size] || 0;
        return {
          ...p,
          stockBySize: {
            ...p.stockBySize,
            [size]: Math.max(0, current + delta),
          },
        };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        screenHistory,
        navigate,
        goBack,
        user,
        setAudienceFocus,
        toggleAesthetic,
        completeOnboarding,
        loginUser,
        registerUser,
        continueAsGuest,
        logoutUser,
        updateUserBody,
        familyAvatars,
        toggleFamilyMemberSync,
        products,
        selectedProductId,
        openProduct,
        addReviewToProduct,
        cart,
        cartCount,
        cartSubtotal,
        bundleDiscount,
        addToCart,
        addCustomCartItems,
        updateCartQty,
        removeCartItem,
        moveCartItemToWishlist,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        savedOutfits,
        saveOutfit,
        tryOnSlots,
        equipTryOnItem,
        resetTryOnOutfit,
        address,
        updateAddress,
        orders,
        activeOrderId,
        setActiveOrderId,
        placeOrder,
        updateOrderInstructions,
        toggleOrderRingSoftly,
        advanceOrderTrackingStep,
        feedbackReports,
        submitFeedback,
        purchaseOrders,
        restockProduct,
        notifyWaitlist,
        notifiedProductIds,
        tweakRigMesh,
        resolveAllFlaggedReports,
        adjustProductStock,
        isChatOpen,
        setChatOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
