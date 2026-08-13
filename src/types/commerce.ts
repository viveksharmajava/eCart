export interface CartItem {
  productId: string;
  productName: string;
  brandName?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  listPrice?: number;
  currency?: string;
  variantId?: string;
  size?: string;
  color?: string;
  attributes?: Record<string, string>;
}

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
}

export interface User {
  username: string;
  partyId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  user: User | null;
  authHeader: string | null;
  isAuthenticated: boolean;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  addressLine1: string;
  landmark?: string;
  city: string;
  state: string;
  /** ISO-style Indian state code (e.g. MH, KA). */
  stateCode?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  orderItemSeqId?: string;
  statusId?: string;
  cancelQuantity?: number;
}

export interface OrderSummary {
  orderId: string;
  statusId?: string;
  grandTotal?: number;
  currencyUom?: string;
  orderDate?: string;
  orderName?: string;
  partyId?: string;
  items?: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  helpfulCount: number;
  images?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  provider: 'razorpay' | 'stripe' | 'paypal';
  amount: number;
  currency: string;
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentProvider {
  id: PaymentIntent['provider'];
  createIntent(order: OrderSummary): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentResult>;
}

export type AnalyticsEvent =
  | { name: 'product_view'; productId: string }
  | { name: 'add_to_cart'; productId: string; quantity: number; value: number }
  | { name: 'begin_checkout'; cartValue: number }
  | { name: 'purchase'; orderId: string; value: number };
