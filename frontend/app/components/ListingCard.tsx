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

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-surface card-hover"
    >
      {/* Gold left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold via-gold/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-10 rounded-l-2xl" />

      {/* Image */}
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

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-purple-deep transition-colors">
          {listing.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          {listing.user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-deep to-purple-mid text-[10px] font-bold text-white">
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
