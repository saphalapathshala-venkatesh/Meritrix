"use client";

interface CourseCardProps {
  type: "SUBJECT" | "GRADE_PACK";
  title: string;
  gradeName: string;
  mrp: number;
  salePrice: number;
  discountPercent: number;
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
  discountPercent,
  subjectCount,
  onBuy,
  buying,
}: CourseCardProps) {
  const tag = type === "SUBJECT" ? "Subject Course" : "Grade Pack";

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
            backgroundColor: type === "SUBJECT" ? "var(--primary-soft)" : "rgba(139, 92, 246, 0.1)",
            color: type === "SUBJECT" ? "var(--primary)" : "#7C3AED",
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
          {type === "SUBJECT" ? `Grade: ${gradeName}` : "All Subjects"}
        </p>

        {type === "GRADE_PACK" && subjectCount && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Includes {subjectCount} subjects
          </p>
        )}

        <div className="mt-auto pt-4 flex items-baseline gap-2 flex-wrap">
          <span
            className="text-xl font-bold"
            style={{ color: "var(--text)" }}
          >
            ₹{salePrice}
          </span>
          {mrp > salePrice && (
            <>
              <span
                className="text-sm line-through"
                style={{ color: "var(--muted)" }}
              >
                ₹{mrp}
              </span>
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--primary-soft)",
                  color: "var(--primary)",
                }}
              >
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={onBuy}
          disabled={buying}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--on-primary)",
          }}
        >
          {buying ? "Processing…" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
