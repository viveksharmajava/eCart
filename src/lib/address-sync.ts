import type { Address, User } from '@/types/commerce';
import {
  createPartyAddress,
  deletePartyAddress,
  listPartyAddresses,
  setDefaultPartyAddress,
  updatePartyAddress,
} from '@/services/party-address.service';
import { useAddressStore } from '@/store/address.store';
import { useAuthStore } from '@/store/auth.store';

function requireAuth() {
  const user = useAuthStore.getState().user;
  const authHeader = useAuthStore.getState().authHeader;
  if (!user?.partyId || !authHeader) {
    throw new Error('Please sign in to manage addresses');
  }
  return { partyId: user.partyId, authHeader };
}

export async function hydrateAddressesFromParty(user: User, authHeader: string): Promise<void> {
  if (!user.partyId) {
    useAddressStore.getState().clearAddresses();
    return;
  }
  const addresses = await listPartyAddresses(user.partyId, authHeader);
  useAddressStore.getState().replaceAddresses(addresses);
}

/** Always reload addresses for the current session (used by account pages). */
export async function refreshAddressesForCurrentUser(): Promise<Address[]> {
  const { partyId, authHeader } = requireAuth();
  const addresses = await listPartyAddresses(partyId, authHeader);
  useAddressStore.getState().replaceAddresses(addresses);
  return addresses;
}

export async function addAddressForUser(address: Omit<Address, 'id'>): Promise<Address> {
  const { partyId, authHeader } = requireAuth();
  const created = await createPartyAddress(partyId, address, authHeader);
  try {
    const addresses = await listPartyAddresses(partyId, authHeader);
    useAddressStore.getState().replaceAddresses(addresses);
  } catch {
    // Create succeeded — keep at least the new address visible locally
    const existing = useAddressStore.getState().addresses.filter((a) => a.id !== created.id);
    useAddressStore.getState().replaceAddresses(
      created.isDefault
        ? [...existing.map((a) => ({ ...a, isDefault: false })), created]
        : [...existing, created],
    );
  }
  return created;
}

export async function updateAddressForUser(
  id: string,
  patch: Partial<Omit<Address, 'id'>>,
): Promise<Address> {
  const { partyId, authHeader } = requireAuth();
  const current = useAddressStore.getState().addresses.find((a) => a.id === id);
  if (!current) throw new Error('Address not found');
  const updated = await updatePartyAddress(partyId, id, { ...current, ...patch }, authHeader);
  const addresses = await listPartyAddresses(partyId, authHeader);
  useAddressStore.getState().replaceAddresses(addresses);
  return updated;
}

export async function removeAddressForUser(id: string): Promise<void> {
  const { partyId, authHeader } = requireAuth();
  await deletePartyAddress(partyId, id, authHeader);
  const addresses = await listPartyAddresses(partyId, authHeader);
  useAddressStore.getState().replaceAddresses(addresses);
}

export async function setDefaultAddressForUser(id: string): Promise<void> {
  const { partyId, authHeader } = requireAuth();
  await setDefaultPartyAddress(partyId, id, authHeader);
  const addresses = await listPartyAddresses(partyId, authHeader);
  useAddressStore.getState().replaceAddresses(addresses);
}
