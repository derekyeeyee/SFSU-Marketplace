"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? "border-b border-white/10 bg-black/20 backdrop-blur-xl"
          : "border-b border-border/60 bg-surface/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo + nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <Image
                src="/SFSULogo.png"
                alt="SFSU"
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="font-[family-name:var(--font-heading)]">
              <span
                className={`text-lg font-extrabold tracking-tight ${
                  transparent ? "text-white" : "gradient-text"
                }`}
              >
                Gators
              </span>
              <span
                className={`text-lg font-extrabold tracking-tight ${
                  transparent ? "text-gold" : "gradient-text-gold"
                }`}
              >
                List
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink
              href="/items"
              label="Browse"
              active={isActive("/items")}
              transparent={transparent}
            />
            <NavLink
              href="/requests"
              label="Requests"
              active={isActive("/requests")}
              transparent={transparent}
            />
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <NavLink
            href={user ? "/create" : "/login"}
            label="Sell"
            active={isActive("/create")}
            transparent={transparent}
          />

          {user && (
            <NavLink
              href="/messages"
              label="Messages"
              active={isActive("/messages") || pathname.startsWith("/messages/")}
              transparent={transparent}
            />
          )}

          {user ? (
            <div className="flex items-center gap-3 ml-1">
              <button
                type="button"
                onClick={logout}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  transparent
                    ? "text-white/70 hover:text-white"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                Log Out
              </button>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold font-[family-name:var(--font-heading)] ${
                  transparent
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-purple-deep/10 text-purple-deep"
                }`}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-primary px-5 py-2 text-sm">
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
  transparent,
}: {
  href: string;
  label: string;
  active: boolean;
  transparent: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        transparent
          ? active
            ? "text-white bg-white/10"
            : "text-white/70 hover:text-white hover:bg-white/5"
          : active
            ? "text-purple-deep bg-purple-deep/5"
            : "text-foreground/60 hover:text-foreground hover:bg-black/[0.02]"
      }`}
    >
      {label}
    </Link>
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
