import { create } from 'zustand';
import type { Address } from '@/types/commerce';

export type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

interface CheckoutStore {
  step: CheckoutStep;
  shippingAddress: Address | null;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'razorpay' | 'stripe';
  createAccount: boolean;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  guestMobile: string;
  setStep: (step: CheckoutStep) => void;
  setShippingAddress: (address: Address | null) => void;
  setShippingMethod: (method: 'standard' | 'express') => void;
  setPaymentMethod: (method: 'cod' | 'razorpay' | 'stripe') => void;
  setGuestDetails: (details: Partial<Pick<CheckoutStore, 'guestEmail' | 'guestFirstName' | 'guestLastName' | 'guestMobile' | 'createAccount'>>) => void;
  reset: () => void;
}

const initialState = {
  step: 'address' as CheckoutStep,
  shippingAddress: null as Address | null,
  shippingMethod: 'standard' as const,
  paymentMethod: 'cod' as const,
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
  setShippingMethod: (shippingMethod) => set({ shippingMethod }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setGuestDetails: (details) => set((state) => ({ ...state, ...details })),
  reset: () => set(initialState),
}));
