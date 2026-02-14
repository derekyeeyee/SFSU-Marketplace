import Link from "next/link";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const headerClass = transparent
    ? "sticky top-0 z-50 w-full border-b border-white/20 bg-black/25 backdrop-blur-md"
    : "sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md";
  const primaryLinkClass = transparent
    ? "text-sm font-semibold tracking-wide text-white transition-colors hover:text-gold-light"
    : "text-sm font-semibold tracking-wide text-purple-deep transition-colors hover:text-purple-mid";
  const secondaryLinkClass = transparent
    ? "text-sm font-medium text-white/85 transition-colors hover:text-white"
    : "text-sm font-medium text-foreground/70 transition-colors hover:text-purple-deep";
  const loginButtonClass = transparent
    ? "rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-purple-deep shadow-md transition-all hover:bg-gold-light hover:shadow-lg"
    : "rounded-lg bg-purple-deep px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md";

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
        <div>
          <Link href="/login" className={loginButtonClass}>
            Log In
          </Link>
        </div>
      </div>
    </header>
  );
}
