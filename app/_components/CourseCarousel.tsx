"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import CourseCard from "./CourseCard";

export interface Offering {
  type: "SUBJECT" | "GRADE_PACK";
  id: string;
  title: string;
  gradeName: string;
  mrp: number;
  salePrice: number;
  discountPercent?: number;
  subjectCount?: number;
  isActive?: boolean;
  includesAllSubjects?: boolean;
}

interface CourseCarouselProps {
  offerings: Offering[];
  onBuy: (offering: Offering) => void;
  buyingId: string | null;
}

function getVisibleCount() {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
}

export default function CourseCarousel({ offerings, onBuy, buyingId }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = offerings.length;
  const maxIndex = Math.max(0, total - visibleCount);

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [maxIndex, currentIndex]);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 10000);
  }, [maxIndex]);

  useEffect(() => {
    if (!isPaused && total > visibleCount) {
      startAutoSlide();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, total, visibleCount, startAutoSlide]);

  const goTo = (idx: number) => {
    setCurrentIndex(Math.min(idx, maxIndex));
    startAutoSlide();
  };

  const prev = () => goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  const next = () => goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);

  if (total === 0) return null;

  const slidePercent = 100 / visibleCount;
  const showNav = total > visibleCount;
  const dotCount = maxIndex + 1;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * slidePercent}%)`,
          }}
        >
          {offerings.map((o) => (
            <div
              key={`${o.type}-${o.id}`}
              className="flex-shrink-0 px-2"
              style={{ width: `${slidePercent}%` }}
            >
              <CourseCard
                type={o.type}
                title={o.title}
                gradeName={o.gradeName}
                mrp={o.mrp}
                salePrice={o.salePrice}
                subjectCount={o.subjectCount}
                onBuy={() => onBuy(o)}
                buying={buyingId === o.id}
              />
            </div>
          ))}
        </div>
      </div>

      {showNav && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--primary-soft)",
              color: "var(--primary)",
            }}
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L4 7l4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all cursor-pointer rounded-full"
                style={{
                  width: i === currentIndex ? "18px" : "6px",
                  height: "6px",
                  backgroundColor: i === currentIndex ? "var(--primary)" : "var(--border)",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--primary-soft)",
              color: "var(--primary)",
            }}
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 3L10 7l-4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
