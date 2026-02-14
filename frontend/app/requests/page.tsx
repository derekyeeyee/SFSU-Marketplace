"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import PostCard from "@/app/components/PostCard";
import { fetchPosts } from "@/lib/marketplace-api";
import { Post } from "@/types/marketplace";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchPosts("request");
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page hero */}
      <section className="bg-gradient-to-br from-purple-deep to-purple-mid px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Item Requests
        </h1>
        <p className="mt-2 text-sm text-white/80">
          See what fellow Gators are looking for.
        </p>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <p className="text-center text-text-muted">Loading requests…</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-text-muted">
            No item requests right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {requests.map((req) => (
              <PostCard key={req.id} post={req} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
