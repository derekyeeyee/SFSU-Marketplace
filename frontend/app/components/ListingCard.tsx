import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/types/marketplace";

interface ListingCardProps {
  listing: Listing;
}

function formatPrice(price: number): string {
  if (price <= 0) return "Free";
  return `$${price.toFixed(2)}`;
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isFree = listing.price <= 0;
  const isRequest = listing.type === "request";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-surface card-hover"
    >
      {/* Left accent — gold for items, emerald for requests */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] z-10 rounded-l-2xl opacity-0 transition-opacity group-hover:opacity-100 ${
          isRequest
            ? "bg-gradient-to-b from-emerald-500 via-emerald-400/40 to-transparent"
            : "bg-gradient-to-b from-gold via-gold/40 to-transparent"
        }`}
      />

      {/* Image or request banner */}
      {isRequest ? (
        <div className="relative flex h-32 w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <div className="flex flex-col items-center gap-1.5 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">
              Wanted
            </span>
          </div>
          {/* Budget badge */}
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md font-[family-name:var(--font-heading)]">
              {isFree ? "Any price" : `Budget: ${formatPrice(listing.price)}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-purple-deep/5 to-gold/5">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted/30">
              <ImagePlaceholderIcon />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md font-[family-name:var(--font-heading)] ${
                isFree
                  ? "bg-emerald-500/90 text-white"
                  : "bg-white/90 text-purple-deep"
              }`}
            >
              {formatPrice(listing.price)}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-purple-deep transition-colors">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          {listing.user ? (
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  isRequest
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-br from-purple-deep to-purple-mid"
                }`}
              >
                {listing.user.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-xs text-text-muted">
                {listing.user}
              </span>
            </div>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs text-text-muted/60">
            {formatRelativeTime(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
