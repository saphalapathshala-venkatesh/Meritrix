const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return cadFormatter.format(amount);
}

export function computeDiscount(mrp: number, sale: number): number {
  if (mrp > 0 && mrp > sale) {
    return Math.round(((mrp - sale) / mrp) * 100);
  }
  return 0;
}
