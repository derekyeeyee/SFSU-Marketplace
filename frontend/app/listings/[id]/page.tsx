"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";
import {
  fetchListing,
  sendMessage,
  findConversation,
} from "@/lib/marketplace-api";
import { Listing } from "@/types/marketplace";

function formatPrice(price: number): string {
  if (price <= 0) return "Free";
  return `$${price.toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Unknown date";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchListing(params.id);
      if (active) {
        setListing(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [params.id]);

  async function handleMessage() {
    if (!user || !listing) return;
    setMessaging(true);

    try {
      // Resolve the seller's account ID from their username
      const acctRes = await fetch(
        `/api/accounts/by-username/${listing.user}`,
      );
      if (!acctRes.ok) {
        alert("Could not find seller account.");
        setMessaging(false);
        return;
      }
      const seller = (await acctRes.json()) as { id: string };

      // Check for an existing conversation about this listing
      const existingConvId = await findConversation(
        listing.id,
        user.id,
        seller.id,
      );

      if (existingConvId) {
        router.push(`/messages/${existingConvId}`);
      } else {
        // Start a new conversation with an initial message
        const result = await sendMessage({
          senderid: user.id,
          recipientid: seller.id,
          listingid: listing.id,
          message: `Hi! I'm interested in "${listing.title}".`,
        });

        if (result) {
          router.push(`/messages/${result.conversationid}`);
        } else {
          alert("Failed to start conversation. Please try again.");
        }
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }

    setMessaging(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="py-20 text-center text-text-muted">Loading listing…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-foreground">
            Listing Not Found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This listing may have been removed or doesn&apos;t exist.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 rounded-lg bg-purple-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md cursor-pointer"
          >
            Go Back
          </button>
        </main>
      </div>
    );
  }

  const isRequest = listing.type === "request";
  const backHref = isRequest ? "/requests" : "/items";
  const backLabel = isRequest ? "Item Requests" : "Available Items";
  const isOwnListing = user?.username === listing.user;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-muted">
          <Link
            href={backHref}
            className="transition-colors hover:text-purple-deep"
          >
            ← {backLabel}
          </Link>
        </nav>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-gray-100 md:w-1/2">
            {listing.imageUrl ? (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">
                <ImagePlaceholderIcon />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-4">
            <span className="w-fit rounded-full bg-purple-deep/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-deep">
              {isRequest ? "Request" : "For Sale"}
            </span>

            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {listing.title}
            </h1>

            <p className="text-3xl font-bold text-purple-deep">
              {formatPrice(listing.price)}
            </p>

            <div className="flex flex-col gap-1 text-sm text-text-muted">
              {listing.user && <span>Posted by {listing.user}</span>}
              <span>{formatDate(listing.createdAt)}</span>
            </div>

            {listing.soldAt && (
              <span className="w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-dark">
                Sold
              </span>
            )}

            {/* Actions */}
            {user && !isOwnListing && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleMessage}
                  disabled={messaging}
                  className="flex-1 rounded-lg bg-purple-deep py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {messaging
                    ? "Opening conversation…"
                    : isRequest
                      ? "I Have This"
                      : "Message Seller"}
                </button>
              </div>
            )}

            {!user && (
              <Link
                href="/login"
                className="mt-4 block rounded-lg border border-border py-3 text-center text-sm font-semibold text-purple-deep transition-all hover:bg-surface-hover"
              >
                Log in to message {isRequest ? "requester" : "seller"}
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
