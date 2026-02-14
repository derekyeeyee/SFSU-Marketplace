"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";
import { fetchMessages, sendMessage } from "@/lib/marketplace-api";
import { Message } from "@/types/marketplace";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;
    async function load() {
      const data = await fetchMessages(params.conversationId);
      if (active) {
        setMessages(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [params.conversationId, user, authLoading, router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim() || messages.length === 0) return;

    setSending(true);

    // Determine recipient from existing messages
    const first = messages[0];
    const recipientId =
      first.senderId === user.id ? first.recipientId : first.senderId;

    const result = await sendMessage({
      senderid: user.id,
      recipientid: recipientId,
      listingid: first.listingId,
      message: text.trim(),
      conversationid: params.conversationId,
    });

    if (result) {
      setText("");
      // Refresh the thread
      const updated = await fetchMessages(params.conversationId);
      setMessages(updated);
    }

    setSending(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="py-20 text-center text-text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {/* Back link */}
      <div className="border-b border-border px-6 py-3">
        <Link
          href="/messages"
          className="text-sm text-text-muted transition-colors hover:text-purple-deep"
        >
          ← Back to Messages
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <p className="text-center text-text-muted">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-text-muted">
              No messages in this conversation yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? "bg-purple-deep text-white"
                          : "border border-border bg-surface text-foreground"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="mt-1 text-xs text-text-muted">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Compose box */}
      <div className="border-t border-border bg-surface px-6 py-4">
        <form
          onSubmit={handleSend}
          className="mx-auto flex max-w-2xl items-center gap-3"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-lg bg-purple-deep px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md disabled:opacity-60 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
