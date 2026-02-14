import {
  Listing,
  ListingApi,
  FeaturedItem,
  CreateListingInput,
  Message,
  MessageApi,
  ConversationPreview,
  ConversationPreviewApi,
} from "@/types/marketplace";
import { buildObjectUrl } from "@/lib/object-storage";

// ================================================================
// Listings
// ================================================================

function mapListing(raw: ListingApi): Listing {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    price: raw.price,
    imageUrl: raw.imagekey ? buildObjectUrl(raw.imagekey) : null,
    createdAt: raw.createdat,
    soldAt: raw.soldat,
    user: raw.user,
  };
}

export async function fetchListings(
  type: "item" | "request",
): Promise<Listing[]> {
  try {
    const params = new URLSearchParams({ type });
    const res = await fetch(`/api/listings?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const payload = (await res.json()) as ListingApi[];
    return payload.map(mapListing);
  } catch {
    return [];
  }
}

export async function fetchListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`/api/listings/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const payload = (await res.json()) as ListingApi;
    return mapListing(payload);
  } catch {
    return null;
  }
}

export async function createListing(
  input: CreateListingInput,
  userName: string,
): Promise<string | null> {
  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: input.type,
        title: input.title,
        price: input.price,
        image_key: input.imageKey || null,
        user: userName,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return data.id;
  } catch {
    return null;
  }
}

export async function fetchFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    const res = await fetch("/api/listings/featured", { cache: "no-store" });
    if (!res.ok) return [];
    const payload = (await res.json()) as ListingApi[];
    return payload
      .map(mapListing)
      .filter(
        (l): l is Listing & { imageUrl: string } => l.imageUrl !== null,
      )
      .map((l) => ({ id: l.id, title: l.title, imageUrl: l.imageUrl }));
  } catch {
    return [];
  }
}

// ================================================================
// Messages
// ================================================================

function mapMessage(raw: MessageApi): Message {
  return {
    id: raw.id,
    senderId: raw.senderid ?? "",
    conversationId: raw.conversationid ?? "",
    message: raw.message ?? "",
    listingId: raw.listingid ?? "",
    recipientId: raw.recipientid ?? "",
    timestamp: raw.timestamp,
    isRead: raw.isread ?? false,
  };
}

function mapConversation(raw: ConversationPreviewApi): ConversationPreview {
  return {
    conversationId: raw.conversationid,
    lastMessage: raw.lastmessage,
    lastTimestamp: raw.lasttimestamp,
    listingId: raw.listingid,
    listingTitle: raw.listingtitle,
    otherUserId: raw.otheruserid,
    otherUsername: raw.otherusername,
  };
}

export async function sendMessage(body: {
  senderid: string;
  recipientid: string;
  listingid: string;
  message: string;
  conversationid?: string;
}): Promise<{ id: string; conversationid: string } | null> {
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string; conversationid: string };
  } catch {
    return null;
  }
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  try {
    const params = new URLSearchParams({ conversationid: conversationId });
    const res = await fetch(`/api/messages?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const payload = (await res.json()) as MessageApi[];
    return payload.map(mapMessage);
  } catch {
    return [];
  }
}

export async function fetchConversations(
  userId: string,
): Promise<ConversationPreview[]> {
  try {
    const params = new URLSearchParams({ userid: userId });
    const res = await fetch(`/api/messages/conversations?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as ConversationPreviewApi[];
    return payload.map(mapConversation);
  } catch {
    return [];
  }
}

export async function findConversation(
  listingId: string,
  user1: string,
  user2: string,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      listingid: listingId,
      user1,
      user2,
    });
    const res = await fetch(`/api/messages/find-conversation?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { conversationid: string | null };
    return data.conversationid;
  } catch {
    return null;
  }
}
