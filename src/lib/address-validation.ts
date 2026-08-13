import type { Address } from '@/types/commerce';
import { cn } from '@/lib/utils';

export type AddressRequiredField =
  | 'name'
  | 'mobile'
  | 'addressLine1'
  | 'city'
  | 'state'
  | 'postalCode';

export const ADDRESS_FIELD_ERROR_CLASS =
  'border-destructive focus-visible:ring-destructive aria-invalid:border-destructive';

export function getMissingAddressFields(
  form: Pick<
    Address,
    'name' | 'mobile' | 'addressLine1' | 'city' | 'state' | 'stateCode' | 'postalCode'
  >,
): AddressRequiredField[] {
  const missing: AddressRequiredField[] = [];
  if (!form.name?.trim()) missing.push('name');
  if (!form.mobile?.trim()) missing.push('mobile');
  if (!form.addressLine1?.trim()) missing.push('addressLine1');
  if (!form.postalCode?.trim()) missing.push('postalCode');
  if (!form.city?.trim()) missing.push('city');
  if (!form.state?.trim() || !form.stateCode?.trim()) missing.push('state');
  return missing;
}

export function addressFieldClass(invalid: boolean, className?: string) {
  return cn('mt-1', invalid && ADDRESS_FIELD_ERROR_CLASS, className);
}
