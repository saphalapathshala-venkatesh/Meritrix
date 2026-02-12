"use client";

import PriceBlock from "./PriceBlock";

interface CourseCardProps {
  type: "SUBJECT" | "GRADE_PACK";
  title: string;
  gradeName: string;
  mrp: number;
  salePrice: number;
  subjectCount?: number;
  onBuy: () => void;
  buying: boolean;
}

export default function CourseCard({
  type,
  title,
  gradeName,
  mrp,
  salePrice,
  subjectCount,
  onBuy,
  buying,
}: CourseCardProps) {
  const isSubject = type === "SUBJECT";
  const tag = isSubject ? "Subject Course" : "Grade Package";
  const noPrice = !salePrice || salePrice <= 0;
  const ctaText = isSubject ? "Buy Now" : "Buy Grade Pack";

  return (
    <div
      className="rounded-xl flex flex-col h-full select-none"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
      }}
    >
      <div className="p-5 flex-1 flex flex-col">
        <span
          className="self-start text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
          style={{
            backgroundColor: isSubject ? "var(--primary-soft)" : "rgba(139, 92, 246, 0.1)",
            color: isSubject ? "var(--primary)" : "#7C3AED",
          }}
        >
          {tag}
        </span>

        <h3
          className="text-base font-semibold leading-snug mb-1"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h3>

        <p className="text-xs mb-1" style={{ color: "var(--text-2)" }}>
          {isSubject ? `Grade: ${gradeName}` : "All Subjects Included"}
        </p>

        {!isSubject && subjectCount && subjectCount > 0 && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Includes {subjectCount} subjects
          </p>
        )}

        <div className="mt-auto">
          {noPrice ? (
            <p className="mt-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
              Contact us
            </p>
          ) : (
            <PriceBlock mrp={mrp} salePrice={salePrice} />
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={onBuy}
          disabled={buying || noPrice}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--on-primary)",
          }}
        >
          {buying ? "Processing…" : noPrice ? "Contact Us" : ctaText}
        </button>
      </div>
    </div>
  );
}
