/**
 * Format a price in FCFA
 * @param price - Price in FCFA
 * @returns Formatted price string (e.g., "19 500 FCFA")
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '0 FCFA';
  
  // Format with spaces as thousands separator
  const formatted = Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Format a price with compact notation for small spaces
 * @param price - Price in FCFA
 * @returns Formatted price string (e.g., "19.5K FCFA" for prices >= 10,000)
 */
export function formatPriceCompact(price: number | null | undefined): string {
  if (price === null || price === undefined) return '0 FCFA';
  
  const roundedPrice = Math.round(price);
  
  if (roundedPrice >= 1000000) {
    return `${(roundedPrice / 1000000).toFixed(1)}M FCFA`;
  }
  
  if (roundedPrice >= 10000) {
    return `${(roundedPrice / 1000).toFixed(1)}K FCFA`;
  }
  
  return formatPrice(roundedPrice);
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage
 */
export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round((1 - salePrice / originalPrice) * 100);
}
