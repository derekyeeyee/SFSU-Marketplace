"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ListingCard from "@/app/components/ListingCard";
import { fetchListings } from "@/lib/marketplace-api";
import { Listing } from "@/types/marketplace";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchListings("request");
      if (active) {
        setRequests(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background page-bg-decoration">
      <Header />

      {/* Hero — slimmer, left-aligned */}
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
            className="hidden sm:inline-flex btn-gold px-4 py-2 text-sm animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            + Post Request
          </Link>
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Results count */}
        {!loading && requests.length > 0 && (
          <p className="mb-6 text-sm text-text-muted animate-fade-in">
            Showing <span className="font-semibold text-foreground">{requests.length}</span> {requests.length === 1 ? "request" : "requests"}
          </p>
        )}

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
        ) : requests.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-deep/5 flex items-center justify-center mb-5">
              <svg className="h-10 w-10 text-purple-deep/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground">No requests yet</h2>
            <p className="text-text-muted text-sm mt-1.5 max-w-xs mx-auto">
              Nobody has posted a request yet. Need something? Ask the community!
            </p>
            <Link href="/create" className="btn-primary inline-block mt-5 px-6 py-2.5 text-sm">
              Post a Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 stagger-children">
            {requests.map((req) => (
              <ListingCard key={req.id} listing={req} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
