"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";
import { createPost } from "@/lib/marketplace-api";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [type, setType] = useState<"item" | "request">("item");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.replace("/login");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSubmitting(true);

    const postId = await createPost(
      {
        type,
        title: title.trim(),
        price: parseFloat(price) || 0,
        description: description.trim(),
        imageKey: imageKey.trim(),
      },
      user.name,
    );

    setSubmitting(false);

    if (postId) {
      router.push(`/listings/${postId}`);
    } else {
      setError("Failed to create listing. Please try again.");
    }
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="text-2xl font-extrabold text-foreground">
          Create a Listing
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Post an item for sale or request something you need.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Type toggle */}
          <div className="flex rounded-lg border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setType("item")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors cursor-pointer ${
                type === "item"
                  ? "bg-purple-deep text-white shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              Item for Sale
            </button>
            <button
              type="button"
              onClick={() => setType("request")}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors cursor-pointer ${
                type === "request"
                  ? "bg-purple-deep text-white shadow-sm"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              Item Request
            </button>
          </div>

          {/* Title */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What are you listing?"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
          </label>

          {/* Price */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Price ($)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00 for free"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the item, condition, pick-up details…"
              className="resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
          </label>

          {/* Image key */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Image filename
            </span>
            <input
              type="text"
              value={imageKey}
              onChange={(e) => setImageKey(e.target.value)}
              placeholder="e.g. ChairPlaceholder.jpg (optional)"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
            <span className="text-xs text-text-muted">
              Enter the R2 object key. File upload coming soon.
            </span>
          </label>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-purple-deep py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Creating…" : "Create Listing"}
          </button>
        </form>
      </main>
    </div>
  );
}
