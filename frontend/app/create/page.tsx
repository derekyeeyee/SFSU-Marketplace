"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";
import { createListing } from "@/lib/marketplace-api";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [type, setType] = useState<"item" | "request">("item");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) return null;
      const data = (await res.json()) as { key: string };
      return data.key;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSubmitting(true);

    let imageKey = "";
    if (imageFile) {
      const key = await uploadImage(imageFile);
      if (!key) {
        setError("Image upload failed. Please try again.");
        setSubmitting(false);
        return;
      }
      imageKey = key;
    }

    const listingId = await createListing(
      {
        type,
        title: title.trim(),
        price: parseFloat(price) || 0,
        imageKey,
      },
      user.username,
    );

    setSubmitting(false);

    if (listingId) {
      router.push(`/listings/${listingId}`);
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

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Photo (optional)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface text-sm text-text-muted transition-colors hover:border-purple-mid hover:text-purple-mid cursor-pointer"
              >
                Click to upload an image
              </button>
            )}
          </div>

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
