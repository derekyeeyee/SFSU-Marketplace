"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import { fetchPost } from "@/lib/marketplace-api";
import { Post } from "@/types/marketplace";

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
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await fetchPost(params.id);
      if (active) {
        setPost(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="py-20 text-center text-text-muted">
          Loading listing…
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-foreground">
            Listing Not Found
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            This listing may have been removed or doesn't exist.
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

  const isRequest = post.type === "request";
  const backHref = isRequest ? "/requests" : "/items";
  const backLabel = isRequest ? "Item Requests" : "Available Items";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-muted">
          <Link href={backHref} className="hover:text-purple-deep transition-colors">
            ← {backLabel}
          </Link>
        </nav>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-gray-100 md:w-1/2">
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.title}
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
              {post.title}
            </h1>

            <p className="text-3xl font-bold text-purple-deep">
              {formatPrice(post.price)}
            </p>

            <div className="flex flex-col gap-1 text-sm text-text-muted">
              {post.user && <span>Posted by {post.user}</span>}
              <span>{formatDate(post.createdAt)}</span>
            </div>

            {post.soldAt && (
              <span className="w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-dark">
                Sold
              </span>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex gap-3">
              {/* TODO: Wire to messaging once messages table is ready */}
              <button
                type="button"
                className="flex-1 rounded-lg bg-purple-deep py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md cursor-pointer"
              >
                {isRequest ? "I Have This" : "Message Seller"}
              </button>
            </div>
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
