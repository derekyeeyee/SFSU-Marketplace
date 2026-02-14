import { FeaturedItem, FeaturedItemApi } from "@/types/marketplace";

const FEATURED_ITEMS_ENDPOINT = "/api/items/featured";

function mapFeaturedItem(item: FeaturedItemApi): FeaturedItem {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.image_url,
  };
}

export async function fetchFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    const response = await fetch(FEATURED_ITEMS_ENDPOINT, { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as FeaturedItemApi[];
    return payload.map(mapFeaturedItem);
  } catch {
    return [];
  }
}
