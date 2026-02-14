"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { user, logout } = useAuth();

  const headerClass = transparent
    ? "sticky top-0 z-50 w-full border-b border-white/20 bg-black/25 backdrop-blur-md"
    : "sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md";
  const primaryLinkClass = transparent
    ? "text-sm font-semibold tracking-wide text-white transition-colors hover:text-gold-light"
    : "text-sm font-semibold tracking-wide text-purple-deep transition-colors hover:text-purple-mid";
  const secondaryLinkClass = transparent
    ? "text-sm font-medium text-white/85 transition-colors hover:text-white"
    : "text-sm font-medium text-foreground/70 transition-colors hover:text-purple-deep";
  const createButtonClass = transparent
    ? "flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 text-white transition-all hover:bg-white/10"
    : "flex h-8 w-8 items-center justify-center rounded-lg border border-border text-purple-deep transition-all hover:bg-surface-hover";
  const authButtonClass = transparent
    ? "rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-purple-deep shadow-md transition-all hover:bg-gold-light hover:shadow-lg"
    : "rounded-lg bg-purple-deep px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md";
  const logoutClass = transparent
    ? "text-sm font-medium text-white/85 transition-colors hover:text-white cursor-pointer"
    : "text-sm font-medium text-foreground/70 transition-colors hover:text-purple-deep cursor-pointer";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left nav */}
        <nav className="flex items-center gap-6">
          <Link href="/" className={primaryLinkClass}>
            Home
          </Link>
          <Link href="/items" className={secondaryLinkClass}>
            Available Items
          </Link>
          <Link href="/requests" className={secondaryLinkClass}>
            Item Requests
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link
            href={user ? "/create" : "/login"}
            className={createButtonClass}
            title="Create listing"
          >
            <PlusIcon />
          </Link>

          {user ? (
            <>
              <span className={secondaryLinkClass}>{user.name}</span>
              <button type="button" onClick={logout} className={logoutClass}>
                Log Out
              </button>
            </>
          ) : (
            <Link href="/login" className={authButtonClass}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
