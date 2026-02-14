"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ItemCarousel from "@/app/components/ItemCarousel";
import { fetchFeaturedItems } from "@/lib/marketplace-api";
import { FeaturedItem } from "@/types/marketplace";

export default function FeaturedItemsSection() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      const featuredItems = await fetchFeaturedItems();
      if (active) {
        setItems(featuredItems);
        setLoading(false);
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-white/20 bg-black/30 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Featured Items</h2>
        <Link
          href="/items"
          className="text-sm font-medium text-gold underline underline-offset-4 transition-colors hover:text-gold-light"
        >
          Browse Items
        </Link>
      </div>
      {loading ? (
        <div className="rounded-xl border border-white/20 bg-white/90 px-5 py-6 text-center text-sm text-foreground">
          Loading featured items...
        </div>
      ) : (
        <ItemCarousel items={items} />
      )}
    </section>
  );
}
