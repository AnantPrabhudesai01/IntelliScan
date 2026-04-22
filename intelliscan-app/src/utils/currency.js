export const CURRENCY_SYMBOL = '₹';

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString('en-IN');
}
