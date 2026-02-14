"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, user } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const errorMsg =
      mode === "login"
        ? await login(username, password)
        : await register(username, email, password);

    setSubmitting(false);

    if (!errorMsg) {
      router.push("/");
    } else {
      setError(errorMsg);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="text-center text-3xl font-extrabold text-foreground">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="mt-2 text-center text-sm text-text-muted">
          {isLogin
            ? "Sign in to your GatorsList account."
            : "Join GatorsList to start buying and selling."}
        </p>

        {/* Mode toggle */}
        <div className="mt-8 flex rounded-lg border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors cursor-pointer ${
              isLogin
                ? "bg-purple-deep text-white shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors cursor-pointer ${
              !isLogin
                ? "bg-purple-deep text-white shadow-sm"
                : "text-text-muted hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Your username"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
          </label>

          {!isLogin && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isLogin}
                placeholder="you@sfsu.edu"
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-purple-mid focus:ring-2 focus:ring-purple-mid/20"
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-purple-deep py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-mid hover:shadow-md disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? "Please wait…"
              : isLogin
                ? "Log In"
                : "Create Account"}
          </button>
        </form>
      </main>
    </div>
  );
}
