"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
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
      <div className="min-h-screen bg-background">
        <Header />
        <p className="py-20 text-center text-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-br from-purple-deep to-purple-mid px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Messages
        </h1>
        <p className="mt-2 text-sm text-white/80">
          Your conversations with other Gators.
        </p>
      </section>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {loading ? (
          <p className="text-center text-text-muted">
            Loading conversations…
          </p>
        ) : conversations.length === 0 ? (
          <p className="text-center text-text-muted">
            No conversations yet. Message a seller to get started!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => (
              <Link
                key={conv.conversationId}
                href={`/messages/${conv.conversationId}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Avatar initial */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-deep/10 text-sm font-bold text-purple-deep">
                  {conv.otherUsername.charAt(0).toUpperCase()}
                </div>

                {/* Preview */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {conv.otherUsername}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted">
                      {formatRelativeTime(conv.lastTimestamp)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-text-muted">
                    Re: {conv.listingTitle}
                  </p>
                  <p className="truncate text-sm text-foreground/70">
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
