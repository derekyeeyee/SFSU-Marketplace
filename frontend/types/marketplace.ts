// --- Backend API response shape (snake_case, matches Python dict) ---

export interface PostApi {
  id: string;
  type: string;
  title: string;
  price: number;
  image_key: string | null;
  created_at: string | null;
  sold_at: string | null;
  user: string;
}

// --- Frontend shapes (camelCase) ---

export interface Post {
  id: string;
  type: string;
  title: string;
  price: number;
  imageUrl: string | null;
  createdAt: string | null;
  soldAt: string | null;
  user: string;
}

/** Lean shape consumed by the landing-page carousel. */
export interface FeaturedItem {
  id: string;
  title: string;
  imageUrl: string;
}

/** Payload sent when creating a new listing. */
export interface CreatePostInput {
  type: "item" | "request";
  title: string;
  price: number;
  description: string;
  imageKey: string;
}

// --- Auth types (ready for accounts table) ---

export interface User {
  id: string;
  email: string;
  name: string;
}
