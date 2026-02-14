// ================================================================
// Listing types
// ================================================================

/** Backend API response shape for a listing (matches Python dict keys). */
export interface ListingApi {
  id: string;
  type: string;
  title: string;
  price: number;
  imagekey: string | null;
  createdat: string | null;
  soldat: string | null;
  user: string;
}

/** Frontend-friendly listing shape (camelCase). */
export interface Listing {
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
export interface CreateListingInput {
  type: "item" | "request";
  title: string;
  price: number;
  imageKey: string;
}

// ================================================================
// Auth types
// ================================================================

export interface User {
  id: string;
  username: string;
  email: string;
}

// ================================================================
// Message types
// ================================================================

/** Backend API response shape for a message. */
export interface MessageApi {
  id: string;
  senderid: string | null;
  conversationid: string | null;
  message: string | null;
  listingid: string | null;
  recipientid: string | null;
  timestamp: string | null;
  isread: boolean | null;
}

/** Frontend-friendly message shape. */
export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  message: string;
  listingId: string;
  recipientId: string;
  timestamp: string | null;
  isRead: boolean;
}

/** Backend conversation preview (from aggregation endpoint). */
export interface ConversationPreviewApi {
  conversationid: string;
  lastmessage: string;
  lasttimestamp: string | null;
  listingid: string | null;
  listingtitle: string;
  otheruserid: string;
  otherusername: string;
}

/** Frontend-friendly conversation preview. */
export interface ConversationPreview {
  conversationId: string;
  lastMessage: string;
  lastTimestamp: string | null;
  listingId: string | null;
  listingTitle: string;
  otherUserId: string;
  otherUsername: string;
}
