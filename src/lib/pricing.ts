/**
 * Single source of truth for cart/checkout pricing.
 * Pure pricing — no taxes, no shipping fees, no COD surcharges.
 */

export interface CartLine {
  price: number;            // unit price (after product-level discount, before customization)
  quantity: number;
  unitDelta?: number;       // any per-unit customization delta (color/size deltas)
}

export interface OrderTotals {
  subtotal: number;
  total: number;
}

export function lineTotal(line: CartLine): number {
  return (line.price + (line.unitDelta ?? 0)) * line.quantity;
}

export function calcOrderTotals(lines: CartLine[]): OrderTotals {
  const subtotal = round2(lines.reduce((sum, l) => sum + lineTotal(l), 0));
  return { subtotal, total: subtotal };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
