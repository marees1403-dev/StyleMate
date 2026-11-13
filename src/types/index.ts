export type Audience = 'women' | 'men' | 'kids' | 'family';

export type ScreenId =
  | 'welcome'
  | 'auth'
  | 'home'
  | 'discover'
  | 'pair'
  | 'tryon'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'tracking'
  | 'feedback'
  | 'profile'
  | 'admin-sales'
  | 'admin-inventory'
  | 'admin-reports';

export interface ProductColor {
  name: string;
  shortName: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  verified: boolean;
  rating: number;
  comment: string;
  sizeBought: string;
  date: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  shortTitle: string;
  series: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Shoes' | 'Bags' | 'Family Sets' | 'Accessories';
  audience: Audience;
  price: number;
  originalPrice?: number;
  matchScore: number;
  rating: number;
  reviewCount: number;
  description: string;
  aiReason: string;
  fitConfidence: number;
  fitAdvice: string;
  colors: ProductColor[];
  sizes: string[];
  stockBySize: Record<string, number>;
  reorderPoint: number;
  velocityPerDay: number;
  soldCount: number;
  coBoughtPercent: number;
  demandTag: string;
  tags: string[];
  image: string;
  gallery: string[];
  badge?: string;
  shipsIn?: string;
  isRestockScheduled?: boolean;
  inboundEta?: string;
  inboundQty?: number;
  wishlistedWaitCount?: number;
  reviews: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  audience: Audience;
  matchTag: string;
  stockNote: string;
}

export interface SavedOutfit {
  id: string;
  name: string;
  items: string[];
  totalPrice: number;
  compatibilityScore: number;
  createdAt: string;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  line1: string;
  cityStateZip: string;
  label: string;
}

export interface OrderRecord {
  id: string;
  status: 'Packed' | 'Dispatched' | 'Out for Delivery' | 'Delivered';
  step: number;
  estimatedTouchdown: string;
  courierName: string;
  items: CartItem[];
  subtotal: number;
  bundleDiscount: number;
  voucherCode?: string;
  voucherDiscount: number;
  shippingMethod: 'eco' | 'flash';
  shippingCost: number;
  totalPaid: number;
  paymentMethod: string;
  address: DeliveryAddress;
  deliveryInstructions: string;
  ringSoftly: boolean;
  createdAt: string;
}

export interface FeedbackReport {
  id: string;
  code: string;
  itemId: string;
  itemTitle: string;
  rating: number;
  relevant: boolean;
  wouldWear: 'yes' | 'maybe' | 'no';
  attributionTags: string[];
  harmonyScore: number;
  notes: string;
  severity: 'High Priority' | 'Medium' | 'Positive Research Insight' | 'Resolved';
  status: string;
  timeAgo: string;
  capsuleName?: string;
}

export interface PurchaseOrder {
  id: string;
  sku: string;
  productTitle: string;
  units: number;
  supplier: string;
  status: 'Dispatched' | 'In Transit' | 'Scheduled';
  createdAt: string;
}

export interface FamilyMemberAvatar {
  id: string;
  name: string;
  role: 'Mom' | 'Partner' | 'Kiddo';
  height: string;
  silhouette: string;
  skinTone: string;
  skinHex: string;
  synced: boolean;
}

export interface UserState {
  name: string;
  email: string;
  familyNickname: string;
  isLoggedIn: boolean;
  isGuest: boolean;
  rememberAvatar: boolean;
  stylePts: number;
  audienceFocus: Audience;
  aesthetics: string[];
  avatarMode: 'chibi' | 'mannequin';
  height: string;
  silhouette: string;
  skinTone: string;
  skinHex: string;
  enginePrecision: number;
}
