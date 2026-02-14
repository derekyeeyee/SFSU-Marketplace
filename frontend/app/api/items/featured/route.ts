import { NextResponse } from "next/server";
import { FEATURED_ITEM_CATALOG } from "@/lib/featured-items-catalog";
import { buildObjectUrl } from "@/lib/object-storage";
import { FeaturedItemApi } from "@/types/marketplace";

export async function GET() {
  const items: FeaturedItemApi[] = FEATURED_ITEM_CATALOG.map((item) => ({
    id: item.id,
    title: item.title,
    image_url: buildObjectUrl(item.imageKey),
  }));

  return NextResponse.json(items);
}
