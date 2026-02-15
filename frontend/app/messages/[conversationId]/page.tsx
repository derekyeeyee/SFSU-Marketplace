"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";
import { fetchMessages, sendMessage, fetchListing } from "@/lib/marketplace-api";
import { Message, Listing } from "@/types/marketplace";

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
  const [listing, setListing] = useState<Listing | null>(null);
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

        // Load listing context from the first message's listingId
        if (data.length > 0 && data[0].listingId) {
          const listingData = await fetchListing(data[0].listingId);
          if (active) setListing(listingData);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [params.conversationId, user, authLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim() || messages.length === 0) return;

    setSending(true);

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
      const updated = await fetchMessages(params.conversationId);
      setMessages(updated);
    }

    setSending(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-purple-deep/20 border-t-purple-deep animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {/* Context bar: back link + listing preview */}
      <div className="border-b border-border/60 px-6 py-3 bg-surface/50 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link
            href="/messages"
            className="group inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-purple-deep"
          >
            <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Messages
          </Link>

          {listing && (
            <Link
              href={`/listings/${listing.id}`}
              className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs transition-all hover:border-purple-mid/30 hover:shadow-sm"
            >
              <span className="font-medium text-text-muted">Re:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {listing.title}
              </span>
              <span className="font-bold text-purple-deep">
                {listing.price <= 0 ? "Free" : `$${listing.price}`}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="flex flex-col gap-3 py-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-56"}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-text-muted">
                No messages in this conversation yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {messages.map((msg, idx) => {
                const isMine = msg.senderId === user?.id;
                const showTime =
                  idx === 0 ||
                  (msg.timestamp &&
                    messages[idx - 1].timestamp &&
                    new Date(msg.timestamp).getTime() -
                      new Date(messages[idx - 1].timestamp!).getTime() >
                      300_000);

                return (
                  <div key={msg.id}>
                    {showTime && msg.timestamp && (
                      <p className="text-center text-xs text-text-muted/40 my-4 font-medium">
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
                    <div
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-gradient-to-br from-purple-deep to-purple-mid text-white shadow-sm"
                            : "border border-border/50 bg-surface text-foreground shadow-sm"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Compose box */}
      <div className="border-t border-border/60 bg-surface/80 backdrop-blur-sm px-6 py-4">
        <form
          onSubmit={handleSend}
          className="mx-auto flex max-w-2xl items-center gap-3"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn-primary flex items-center gap-2 px-5 py-3 text-sm cursor-pointer"
          >
            <span>Send</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
