"use client";

import { formatMoney, computeDiscount } from "../../lib/utils/format-money";

interface PriceBlockProps {
  mrp: number;
  salePrice: number;
}

export default function PriceBlock({ mrp, salePrice }: PriceBlockProps) {
  const discount = computeDiscount(mrp, salePrice);
  const showMrp = mrp > 0 && mrp > salePrice;

  return (
    <div className="mt-6">
      {showMrp && (
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            MRP
          </span>
          <span
            className="text-sm line-through"
            style={{ color: "var(--muted)" }}
          >
            {formatMoney(mrp)}
          </span>
          {discount > 0 && (
            <span
              className="ml-auto text-xs px-2 py-1 rounded-full font-medium"
              style={{
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              {discount}% OFF
            </span>
          )}
        </div>
      )}
      <span
        className="text-3xl font-semibold"
        style={{ color: "var(--text)" }}
      >
        {formatMoney(salePrice)}
      </span>
    </div>
  );
}
