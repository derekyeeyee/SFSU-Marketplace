"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
        <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-white/60">
          No featured items available yet.
        </div>
      ) : null}

      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-purple-deep shadow-lg transition-all hover:bg-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
        disabled={!hasItems}
      >
        <ChevronLeft />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listings/${item.id}`}
            className="group flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-purple-deep/5 to-transparent">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="224px"
              />
            </div>
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-purple-deep transition-colors">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-purple-deep shadow-lg transition-all hover:bg-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-0 cursor-pointer"
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
      strokeWidth="2.5"
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
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
