import { create } from 'zustand';
import type { Address } from '@/types/commerce';

export type CheckoutStep = 'address' | 'payment' | 'review';

interface CheckoutStore {
  step: CheckoutStep;
  shippingAddress: Address | null;
  /** Catalog payment method id (e.g. PSM-...). */
  paymentMethodId: string | null;
  createAccount: boolean;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestMobile: string;
  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Address | null) => void;
  setPaymentMethodId: (paymentMethodId: string | null) => void;
  setPaymentMethod: (paymentMethodId: string | null) => void;
  setGuestDetails: (details: Partial<Pick<CheckoutStore, 'guestEmail' | 'guestFirstName' | 'guestLastName' | 'guestMobile' | 'createAccount'>>) => void;
  reset: () => void;
}

const initialState = {
  step: 'address' as CheckoutStep,
  shippingAddress: null as Address | null,
  paymentMethodId: null as string | null,
  createAccount: false,
  guestEmail: '',
  guestFirstName: '',
  guestLastName: '',
  guestMobile: '',
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setShippingAddress: (shippingAddress) => set({ shippingAddress }),
  setPaymentMethodId: (paymentMethodId) => set({ paymentMethodId }),
  setPaymentMethod: (paymentMethodId) => set({ paymentMethodId }),
  setGuestDetails: (details) => set((state) => ({ ...state, ...details })),
  reset: () => set(initialState),
}));
