"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { fetchConversations } from "@/lib/marketplace-api";
import { ConversationPreview } from "@/types/marketplace";

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

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;
    async function load() {
      const data = await fetchConversations(user!.id);
      if (active) {
        setConversations(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-purple-deep/20 border-t-purple-deep animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background page-bg-decoration">
      <Header />

      {/* Hero */}
      <section className="page-hero px-6 py-10">
        <div className="relative z-10 mx-auto max-w-6xl flex items-center justify-between">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Messages
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Your conversations with other Gators.
            </p>
          </div>
          {conversations.length > 0 && !loading && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-medium text-white/70">
              {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            </span>
          )}
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/40 bg-surface p-4">
                <div className="skeleton h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-deep/5 flex items-center justify-center mb-5">
              <svg className="h-10 w-10 text-purple-deep/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-foreground">No conversations yet</h2>
            <p className="text-text-muted text-sm mt-1.5 max-w-xs mx-auto">
              Start by messaging a seller on an item you&apos;re interested in.
            </p>
            <Link href="/items" className="btn-primary inline-block mt-5 px-6 py-2.5 text-sm">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger-children">
            {conversations.map((conv) => (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.conversationId}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-surface p-4 card-hover"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-deep to-purple-mid text-sm font-bold text-white shadow-sm font-[family-name:var(--font-heading)]">
                  {conv.otherUsername.charAt(0).toUpperCase()}
                </div>

                {/* Preview */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground group-hover:text-purple-deep transition-colors">
                      {conv.otherUsername}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted/60">
                      {formatRelativeTime(conv.lastTimestamp)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-text-muted">
                    Re: {conv.listingTitle}
                  </p>
                  <p className="truncate text-sm text-foreground/55">
                    {conv.lastMessage}
                  </p>
                </div>

                {/* Arrow */}
                <svg className="h-5 w-5 shrink-0 text-text-muted/20 transition-all group-hover:text-purple-deep/40 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
