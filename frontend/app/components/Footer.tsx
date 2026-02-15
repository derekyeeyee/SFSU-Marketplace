import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-gold/20 bg-purple-deep text-white">
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src="/SFSULogo.png"
                  alt="SFSU Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
                  Gators<span className="text-gold">List</span>
                </span>
              </div>
            </div>
            <p className="max-w-xs text-sm text-white/50 leading-relaxed">
              The student marketplace for San Francisco State University. Buy, sell, and trade with fellow Gators.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex gap-16">
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 font-[family-name:var(--font-heading)]">
                Marketplace
              </h4>
              <Link href="/items" className="text-sm text-white/60 transition-colors hover:text-gold">
                Available Items
              </Link>
              <Link href="/requests" className="text-sm text-white/60 transition-colors hover:text-gold">
                Item Requests
              </Link>
              <Link href="/create" className="text-sm text-white/60 transition-colors hover:text-gold">
                Create Listing
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 font-[family-name:var(--font-heading)]">
                Account
              </h4>
              <Link href="/login" className="text-sm text-white/60 transition-colors hover:text-gold">
                Log In
              </Link>
              <Link href="/messages" className="text-sm text-white/60 transition-colors hover:text-gold">
                Messages
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} GatorsList · San Francisco State University
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gold/60" />
            <div className="h-2 w-2 rounded-full bg-purple-light/60" />
            <div className="h-2 w-2 rounded-full bg-gold/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
