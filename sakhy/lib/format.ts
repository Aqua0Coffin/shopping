/**
 * Format helper for Sakhy ecommerce.
 * All prices in DB are stored in paise (1 INR = 100 paise).
 * This converts them to a beautiful Rupees display: e.g. 4850000 paise -> ₹48,500
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
