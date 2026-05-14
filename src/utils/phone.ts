/** Strip everything that isn't a digit from an Indian mobile number. */
export const stripPhone = (raw: string): string => raw.replace(/\D/g, '');

/** Display format: XXXXX XXXXX for Indian 10-digit numbers. */
export const formatPhoneDisplay = (raw: string): string => {
  const digits = stripPhone(raw).slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
};

/** Storage format: +91XXXXXXXXXX. */
export const normalizePhone = (raw: string): string => {
  const digits = stripPhone(raw).replace(/^91/, '').slice(0, 10);
  return digits.length === 10 ? `+91${digits}` : '';
};

/** Check whether the raw string contains a valid 10-digit Indian mobile. */
export const isValidIndianMobile = (raw: string): boolean => {
  const digits = stripPhone(raw).replace(/^91/, '');
  return /^[6-9]\d{9}$/.test(digits);
};

/** Strip +91 prefix for display. */
export const displayNationalPhone = (e164: string): string => {
  const digits = e164.replace(/^\+91/, '');
  return formatPhoneDisplay(digits);
};
