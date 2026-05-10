/**
 * Format a numeric price as Moroccan Dirham (MAD).
 * Examples:
 *   formatPrice(1234.5)  -> "1 234,50 MAD"
 *   formatPrice(80)      -> "80,00 MAD"
 *   formatPrice(undefined) -> "—"
 */
export function formatPrice(value: number | null | undefined, options: { compact?: boolean } = {}): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';

  if (options.compact && value >= 10000) {
    return `${(value / 1000).toFixed(value >= 100000 ? 0 : 1)}k MAD`;
  }

  // fr-MA gives "1 234,50" with the right thousands/decimal seps
  const formatted = new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} MAD`;
}

/** Parse a "MAD" formatted string back to number (best effort) — not used for inputs */
export function parsePrice(input: string): number {
  return parseFloat(input.replace(/[^0-9.,-]/g, '').replace(/\s/g, '').replace(',', '.'));
}

/** Clean a product name — strips trailing punctuation like "." or ".." that can sneak in from data */
export function cleanProductName(name: string): string {
  return (name ?? '').replace(/[.\s]+$/g, '').trim();
}
