"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import PostCard from "@/app/components/PostCard";
import { fetchPosts } from "@/lib/marketplace-api";
import { Post } from "@/types/marketplace";

export default function ItemsPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchPosts("item");
      if (active) {
        setItems(data);
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
          Available Items
        </h1>
        <p className="mt-2 text-sm text-white/80">
          Browse items for sale from fellow Gators.
        </p>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <p className="text-center text-text-muted">Loading items…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-text-muted">
            No items available right now. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
