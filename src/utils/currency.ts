const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const PLAIN_INR = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/** Format a number as ₹1,23,456 — Indian convention. */
export const formatINR = (amount: number): string => INR_FORMATTER.format(amount);

/** Format a number as 1,23,456 — no symbol (for inputs and tabular layouts). */
export const formatINRPlain = (amount: number): string => PLAIN_INR.format(amount);

/** Parse a user-entered amount string into a number. Strips non-digits. */
export const parseAmount = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) : 0;
};
