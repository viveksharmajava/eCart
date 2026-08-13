import type { Address } from '@/types/commerce';
import { httpClient } from './http.client';

export interface PartyAddressDto {
  partyAddressId?: string;
  partyId?: string;
  addressType?: string;
  toName?: string;
  attnName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateProvinceGeoId?: string;
  postalCode?: string;
  countryGeoId?: string;
  phone?: string;
  defaultShipping?: boolean;
}

const CUSTOMER_ADDRESSES_BASE = '/party/customer/addresses';

export function mapPartyAddressToUi(dto: PartyAddressDto): Address | null {
  const id = dto.partyAddressId?.trim();
  if (!id) return null;
  const countryCode = dto.countryGeoId?.trim() || 'IN';
  return {
    id,
    name: dto.toName?.trim() || 'Address',
    mobile: dto.phone?.trim() || '',
    addressLine1: dto.address1?.trim() || '',
    landmark: dto.address2?.trim() || undefined,
    city: dto.city?.trim() || '',
    state: dto.attnName?.trim() || dto.stateProvinceGeoId?.trim() || '',
    stateCode: dto.stateProvinceGeoId?.trim() || undefined,
    country: countryCode === 'IN' ? 'India' : countryCode,
    postalCode: dto.postalCode?.trim() || '',
    isDefault: Boolean(dto.defaultShipping),
  };
}

export function mapUiAddressToParty(address: Omit<Address, 'id'> | Address): PartyAddressDto {
  const country = (address.country || 'IN').trim();
  // party_address.country_geo_id is VARCHAR(20) — prefer ISO code over full name
  const countryGeoId =
    country.toLowerCase() === 'india' || country.toLowerCase() === 'in' ? 'IN' : country.slice(0, 20);
  const stateGeoId = (address.stateCode || address.state || '').trim().slice(0, 20);

  return {
    addressType: 'SHIPPING',
    toName: address.name,
    attnName: address.state,
    address1: address.addressLine1,
    address2: address.landmark,
    city: address.city,
    stateProvinceGeoId: stateGeoId || undefined,
    postalCode: address.postalCode,
    countryGeoId,
    phone: address.mobile,
    defaultShipping: Boolean(address.isDefault),
  };
}

export async function listPartyAddresses(_partyId: string, authHeader: string): Promise<Address[]> {
  const rows = await httpClient<PartyAddressDto[]>(CUSTOMER_ADDRESSES_BASE, { authHeader });
  return (rows ?? [])
    .map(mapPartyAddressToUi)
    .filter((a): a is Address => a != null);
}

export async function createPartyAddress(
  _partyId: string,
  address: Omit<Address, 'id'>,
  authHeader: string,
): Promise<Address> {
  const created = await httpClient<PartyAddressDto>(CUSTOMER_ADDRESSES_BASE, {
    method: 'POST',
    authHeader,
    body: mapUiAddressToParty(address),
  });
  const mapped = mapPartyAddressToUi(created);
  if (!mapped) throw new Error('Failed to create address');
  return mapped;
}

export async function updatePartyAddress(
  _partyId: string,
  addressId: string,
  address: Omit<Address, 'id'> | Address,
  authHeader: string,
): Promise<Address> {
  const updated = await httpClient<PartyAddressDto>(
    `${CUSTOMER_ADDRESSES_BASE}/${encodeURIComponent(addressId)}`,
    {
      method: 'PUT',
      authHeader,
      body: {
        ...mapUiAddressToParty(address),
        partyAddressId: addressId,
      },
    },
  );
  const mapped = mapPartyAddressToUi(updated);
  if (!mapped) throw new Error('Failed to update address');
  return mapped;
}

export async function deletePartyAddress(
  _partyId: string,
  addressId: string,
  authHeader: string,
): Promise<void> {
  await httpClient<void>(`${CUSTOMER_ADDRESSES_BASE}/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
    authHeader,
  });
}

export async function setDefaultPartyAddress(
  _partyId: string,
  addressId: string,
  authHeader: string,
): Promise<Address> {
  const updated = await httpClient<PartyAddressDto>(
    `${CUSTOMER_ADDRESSES_BASE}/${encodeURIComponent(addressId)}/default-shipping`,
    {
      method: 'PUT',
      authHeader,
    },
  );
  const mapped = mapPartyAddressToUi(updated);
  if (!mapped) throw new Error('Failed to set default address');
  return mapped;
}
