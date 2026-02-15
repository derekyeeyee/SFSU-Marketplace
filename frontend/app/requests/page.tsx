"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import { fetchListings } from "@/lib/marketplace-api";
import { Listing } from "@/types/marketplace";

type SortOption = "newest" | "price-low" | "price-high";

function sortListings(items: Listing[], sort: SortOption): Listing[] {
  const sorted = [...items];
  switch (sort) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

export default function RequestsPage() {
  const [allRequests, setAllRequests] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchListings("request");
      if (active) {
        setAllRequests(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = q
      ? allRequests.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.user.toLowerCase().includes(q),
        )
      : allRequests;
    return sortListings(base, sort);
  }, [allRequests, search, sort]);

  return (
    <div className="flex min-h-screen flex-col bg-background page-bg-decoration">
      <Header />

      {/* Hero */}
      <section className="page-hero px-6 py-10">
        <div className="relative z-10 mx-auto max-w-6xl flex items-center justify-between">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Item Requests
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              See what fellow Gators are looking for.
            </p>
          </div>
          <Link
            href="/create"
            className="hidden sm:inline-flex text-sm font-medium text-white/70 underline underline-offset-4 decoration-white/30 transition-colors hover:text-white hover:decoration-white/60 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Post Request
          </Link>
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Search + Sort controls */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted/50"
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
              placeholder="Search requests…"
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50 focus:border-purple-mid/30"
            />
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-sm text-text-muted">
                <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "request" : "requests"}
              </span>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-all cursor-pointer hover:border-purple-mid/30"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Budget: Low → High</option>
              <option value="price-high">Budget: High → Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/40 bg-surface">
                <div className="skeleton h-48 w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <div className="skeleton h-5 w-5 rounded-full" />
                    <div className="skeleton h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-deep/5 flex items-center justify-center mb-5">
              <svg className="h-10 w-10 text-purple-deep/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {search ? "No matching requests" : "No requests yet"}
            </h2>
            <p className="text-text-muted text-sm mt-1.5 max-w-xs mx-auto">
              {search
                ? `No requests matching "${search}". Try a different search.`
                : "Nobody has posted a request yet. Need something? Ask the community!"}
            </p>
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="btn-secondary inline-block mt-5 px-6 py-2.5 text-sm cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link href="/create" className="btn-primary inline-block mt-5 px-6 py-2.5 text-sm">
                Post a Request
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 stagger-children">
            {filtered.map((req) => (
              <ListingCard key={req.id} listing={req} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
