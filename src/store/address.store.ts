import { create } from 'zustand';
import type { Address } from '@/types/commerce';

interface AddressStore {
  addresses: Address[];
  replaceAddresses: (addresses: Address[]) => void;
  clearAddresses: () => void;
  /** Local-only fallback for rare guest flows; prefer address-sync helpers when logged in. */
  addAddressLocal: (address: Omit<Address, 'id'>) => Address;
  getDefault: () => Address | undefined;
}

function newId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAddressStore = create<AddressStore>()((set, get) => ({
  addresses: [],

  replaceAddresses: (addresses) => set({ addresses: [...addresses] }),

  clearAddresses: () => set({ addresses: [] }),

  addAddressLocal: (address) => {
    const entry: Address = {
      ...address,
      id: newId(),
      isDefault: address.isDefault ?? get().addresses.length === 0,
    };
    set((state) => ({
      addresses: entry.isDefault
        ? [...state.addresses.map((a) => ({ ...a, isDefault: false })), entry]
        : [...state.addresses, entry],
    }));
    return entry;
  },

  getDefault: () => get().addresses.find((a) => a.isDefault) ?? get().addresses[0],
}));
