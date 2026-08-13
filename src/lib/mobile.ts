/** Indian-style mobile: exactly 10 digits, numbers only, must not start with 0. */
export const MOBILE_PATTERN = /^[1-9]\d{9}$/;

export const MOBILE_ERROR_MESSAGE =
  'Mobile must be a 10-digit number and cannot start with 0';

/** Strip non-digits, drop leading zeros, cap at 10 digits. */
export function sanitizeMobileInput(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
}

export function isValidMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value.trim());
}

export function getMobileValidationError(value: string): string | null {
  const mobile = value.trim();
  if (!mobile) return 'Mobile number is required';
  if (/\D/.test(mobile)) return 'Mobile must contain only numbers';
  if (mobile.startsWith('0')) return 'Mobile number cannot start with 0';
  if (mobile.length !== 10) return 'Mobile must be exactly 10 digits';
  if (!isValidMobile(mobile)) return MOBILE_ERROR_MESSAGE;
  return null;
}
