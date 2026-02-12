interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "var(--text-2)" }}>{label}</span>
          <span style={{ color: "var(--muted)" }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: "#E2E8F0" }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: "var(--progress)",
          }}
        />
      </div>
    </div>
  );
}
