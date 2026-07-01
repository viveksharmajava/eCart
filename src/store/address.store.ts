import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '@/types/commerce';

function newId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AddressStore {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Address | undefined;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (address) => {
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

      updateAddress: (id, patch) => {
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }));
      },

      removeAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefault: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        }));
      },

      getDefault: () => get().addresses.find((a) => a.isDefault) ?? get().addresses[0],
    }),
    { name: 'playpro-addresses' },
  ),
);
