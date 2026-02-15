"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import FeaturedItemsSection from "@/app/components/FeaturedItemsSection";

const CATEGORIES = [
  { label: "Furniture", icon: "🪑", query: "furniture" },
  { label: "Textbooks", icon: "📚", query: "textbook" },
  { label: "Electronics", icon: "💻", query: "electronics" },
  { label: "Clothing", icon: "👕", query: "clothing" },
  { label: "Kitchen", icon: "🍽️", query: "kitchen" },
  { label: "Free Stuff", icon: "🎁", query: "free" },
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/items?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/items");
    }
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <Image
        src="/SFSU Backdrop.jpg"
        alt="San Francisco State University campus"
        fill
        priority
        className="object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-deep/30 via-purple-deep/50 to-black/80" />
      {/* Texture */}
      <div className="absolute inset-0 dot-pattern-light opacity-30" />

      <div className="relative z-10 flex h-full flex-col">
        <Header transparent />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-8 pb-6 pt-14">
          {/* Hero */}
          <section className="mb-6 flex flex-col items-center gap-4 text-center animate-fade-in-up">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                <Image
                  src="/SFSULogo.png"
                  alt="SFSU Gator"
                  fill
                  className="object-contain drop-shadow-lg"
                  sizes="80px"
                />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl font-[family-name:var(--font-heading)]">
                <span>Gators</span>
                <span className="gradient-text-gold">List</span>
              </h1>
            </div>

            <p className="max-w-lg text-base text-white/70 leading-relaxed sm:text-lg">
              The student marketplace for San Francisco State University.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="mt-2 flex w-full max-w-lg items-center gap-2"
            >
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for items, textbooks, furniture…"
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none backdrop-blur-md transition-all focus:border-white/30 focus:bg-white/15"
                />
              </div>
              <button
                type="submit"
                className="btn-gold shrink-0 px-5 py-3 text-sm cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Category quick links */}
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.query}
                  href={`/items?q=${cat.query}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:bg-white/15 hover:text-white hover:border-white/20"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
          </section>

          <FeaturedItemsSection />
        </main>
      </div>
    </div>
  );
}
