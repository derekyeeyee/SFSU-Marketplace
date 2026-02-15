"use client";

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
    <section className="animate-fade-in-up glass-dark rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-gold to-gold-light" />
        <h2 className="text-lg font-bold text-white tracking-tight">
          Featured Items
        </h2>
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-56 shrink-0 rounded-xl overflow-hidden">
              <div className="skeleton h-36 w-full" />
              <div className="bg-white/90 p-3">
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ItemCarousel items={items} />
      )}
    </section>
  );
}
