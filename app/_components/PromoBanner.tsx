import Link from "next/link";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
}

export default function PromoBanner({
  title,
  subtitle,
  ctaText,
  ctaHref,
  imageSrc,
}: PromoBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.06)",
        minHeight: "260px",
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10, 50, 50, 0.88) 0%, rgba(10, 50, 50, 0.7) 50%, rgba(10, 50, 50, 0.45) 100%)",
        }}
      />
      <div className="relative flex flex-col justify-center h-full px-8 py-10 md:px-12 md:py-14 max-w-xl">
        <h3
          className="text-xl md:text-2xl font-bold tracking-tight mb-2"
          style={{ color: "#FFFFFF", lineHeight: "1.3" }}
        >
          {title}
        </h3>
        <p
          className="text-sm md:text-base mb-6"
          style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.6" }}
        >
          {subtitle}
        </p>
        <div>
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--on-primary)",
              color: "var(--primary)",
            }}
          >
            {ctaText}
            <svg
              className="ml-2"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
