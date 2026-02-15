"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

      <main className="relative z-10 flex-1 mx-auto w-full max-w-4xl px-6 py-12 animate-fade-in">
        <div className="flex flex-col gap-10 md:flex-row">
          {/* Left: Form */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-purple-deep to-purple-light" />
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                Create a Listing
              </h1>
            </div>
            <p className="ml-[19px] text-sm text-text-muted mb-8">
              Post an item for sale or request something you need.
            </p>

            <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Type toggle */}
                <div className="flex rounded-xl bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setType("item")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                      type === "item"
                        ? "btn-primary shadow-sm"
                        : "text-text-muted hover:text-foreground"
                    }`}
                  >
                    Item for Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("request")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                      type === "request"
                        ? "btn-primary shadow-sm"
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
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Price ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00 for free"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
                  />
                </label>

                {/* Image upload */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Photo (optional)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-48 w-full rounded-xl border border-border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 hover:scale-110 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-36 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-sm text-text-muted transition-all hover:border-purple-mid/40 hover:text-purple-mid hover:bg-purple-deep/[0.02] cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      Click to upload an image
                    </button>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 animate-fade-in">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary mt-2 py-3 text-sm cursor-pointer"
                >
                  {submitting ? "Creating…" : "Create Listing"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Tips sidebar */}
          <aside className="md:w-72 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border/60 bg-surface p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-3">Tips for a great listing</h3>
              <ul className="space-y-3">
                <li className="flex gap-2.5 text-sm text-text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold-dark">1</span>
                  <span>Use a clear, descriptive title that helps buyers find your item.</span>
                </li>
                <li className="flex gap-2.5 text-sm text-text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold-dark">2</span>
                  <span>Add a photo — listings with images get 3x more interest.</span>
                </li>
                <li className="flex gap-2.5 text-sm text-text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold-dark">3</span>
                  <span>Set price to $0 for free items or trades.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
