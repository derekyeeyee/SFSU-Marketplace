"use client";

import { useRef } from "react";
import Image from "next/image";
import { FeaturedItem } from "@/types/marketplace";

interface ItemCarouselProps {
  items: FeaturedItem[];
}

export default function ItemCarousel({ items }: ItemCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasItems = items.length > 0;

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative w-full">
      {!hasItems ? (
        <div className="rounded-xl border border-white/20 bg-white/90 px-5 py-6 text-center text-sm text-foreground">
          No featured items available yet.
        </div>
      ) : null}

      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-md transition-colors hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasItems}
      >
        <ChevronLeft />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-2 py-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/20 bg-white/90 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-36 w-full overflow-hidden bg-gray-100">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="224px"
              />
            </div>
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium text-foreground truncate">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white shadow-md transition-colors hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasItems}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

/* Inline SVG icons to avoid extra deps */
function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
