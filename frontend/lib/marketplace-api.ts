import { Post, PostApi, FeaturedItem, CreatePostInput } from "@/types/marketplace";
import { buildObjectUrl } from "@/lib/object-storage";

function mapPost(raw: PostApi): Post {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    price: raw.price,
    imageUrl: raw.image_key ? buildObjectUrl(raw.image_key) : null,
    createdAt: raw.created_at,
    soldAt: raw.sold_at,
    user: raw.user,
  };
}

export async function fetchPosts(type: "item" | "request"): Promise<Post[]> {
  try {
    const params = new URLSearchParams({ type });
    const response = await fetch(`/api/posts?${params}`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as PostApi[];
    return payload.map(mapPost);
  } catch {
    return [];
  }
}

export async function fetchPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`/api/posts/${id}`, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as PostApi;
    return mapPost(payload);
  } catch {
    return null;
  }
}

export async function createPost(
  input: CreatePostInput,
  userName: string,
): Promise<string | null> {
  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: input.type,
        title: input.title,
        price: input.price,
        description: input.description,
        image_key: input.imageKey || null,
        user: userName,
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { id: string };
    return data.id;
  } catch {
    return null;
  }
}

export async function fetchFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    const response = await fetch("/api/items/featured", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as PostApi[];
    return payload
      .map(mapPost)
      .filter((p): p is Post & { imageUrl: string } => p.imageUrl !== null)
      .map((p) => ({ id: p.id, title: p.title, imageUrl: p.imageUrl }));
  } catch {
    return [];
  }
}
