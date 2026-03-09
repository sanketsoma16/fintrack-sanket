/**
 * Format amount as Indian Rupee (₹).
 * Uses en-IN locale for Indian number grouping (e.g. 1,00,000).
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};
