"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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
      const acctRes = await fetch(
        `/api/accounts/by-username/${listing.user}`,
      );
      if (!acctRes.ok) {
        alert("Could not find seller account.");
        setMessaging(false);
        return;
      }
      const seller = (await acctRes.json()) as { id: string };

      const existingConvId = await findConversation(
        listing.id,
        user.id,
        seller.id,
      );

      if (existingConvId) {
        router.push(`/messages/${existingConvId}`);
      } else {
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
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="mx-auto max-w-4xl flex-1 px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="skeleton aspect-square w-full md:w-1/2 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-10 w-32" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-32" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto max-w-2xl flex-1 px-6 py-20 text-center animate-fade-in">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-deep/5 flex items-center justify-center mb-5">
            <svg className="h-10 w-10 text-purple-deep/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            Listing Not Found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This listing may have been removed or doesn&apos;t exist.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-primary mt-6 px-6 py-2.5 text-sm cursor-pointer"
          >
            Go Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const isRequest = listing.type === "request";
  const backHref = isRequest ? "/requests" : "/items";
  const backLabel = isRequest ? "Item Requests" : "Available Items";
  const isOwnListing = user?.username === listing.user;

  return (
    <div className="flex min-h-screen flex-col bg-background page-bg-decoration">
      <Header />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 py-10 animate-fade-in">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-purple-deep"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </Link>
        </nav>

        <div className="flex flex-col gap-10 md:flex-row">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-purple-deep/5 to-gold/5 md:w-1/2 md:max-h-[480px]">
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
              <div className="flex h-full items-center justify-center text-text-muted/20">
                <ImagePlaceholderIcon />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-4 md:py-2">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider font-[family-name:var(--font-heading)] ${
                isRequest
                  ? "bg-gold/10 text-gold-dark border border-gold/20"
                  : "bg-purple-deep/8 text-purple-deep border border-purple-deep/10"
              }`}
            >
              {isRequest ? "Request" : "For Sale"}
            </span>

            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl tracking-tight">
              {listing.title}
            </h1>

            <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-heading)]">
              {formatPrice(listing.price)}
            </p>

            {/* Seller info card */}
            <div className="rounded-xl border border-border/50 bg-background p-4 flex flex-col gap-2.5">
              {listing.user && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-deep to-purple-mid text-xs font-bold text-white">
                    {listing.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{listing.user}</p>
                    <p className="text-xs text-text-muted">Seller</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <svg className="h-4 w-4 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Posted {formatDate(listing.createdAt)}</span>
              </div>
            </div>

            {listing.soldAt && (
              <span className="w-fit rounded-full bg-gold/15 border border-gold/20 px-3 py-1 text-xs font-bold text-gold-dark">
                Sold
              </span>
            )}

            {/* Actions */}
            {user && !isOwnListing && (
              <button
                type="button"
                onClick={handleMessage}
                disabled={messaging}
                className="btn-primary w-full py-3 text-sm cursor-pointer mt-2"
              >
                {messaging
                  ? "Opening conversation…"
                  : isRequest
                    ? "I Have This"
                    : "Message Seller"}
              </button>
            )}

            {!user && (
              <Link
                href="/login"
                className="mt-2 block rounded-xl border border-border py-3 text-center text-sm font-semibold text-purple-deep transition-all hover:bg-surface-hover hover:border-purple-deep/20"
              >
                Log in to message {isRequest ? "requester" : "seller"}
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
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
