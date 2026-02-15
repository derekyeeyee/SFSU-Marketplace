"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
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

    const ok =
      mode === "login"
        ? await login(username, password)
        : await register(username, email, password);

    setSubmitting(false);

    if (ok) {
      router.push("/");
    } else {
      setError(
        mode === "login"
          ? "Invalid username or password."
          : "Registration failed. Try a different username/email."
      );
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen flex-col bg-background page-bg-decoration">
      <Header />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 animate-fade-in">
        <div className="w-full max-w-md">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 relative h-16 w-16">
              <Image src="/SFSULogo.png" alt="SFSU" fill className="object-contain" sizes="64px" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="mt-1.5 text-sm text-text-muted">
              {isLogin
                ? "Sign in to your GatorsList account."
                : "Join GatorsList to start buying and selling."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-sm">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-background p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  isLogin
                    ? "btn-primary shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  !isLogin
                    ? "btn-primary shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Your username"
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
                />
              </label>

              {!isLogin && (
                <label className="flex flex-col gap-1.5 animate-fade-in">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!isLogin}
                    placeholder="you@sfsu.edu"
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-text-muted/50"
                />
              </label>

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
                {submitting
                  ? "Please wait…"
                  : isLogin
                    ? "Log In"
                    : "Create Account"}
              </button>
            </form>
          </div>

          {/* Help text */}
          <p className="mt-6 text-center text-xs text-text-muted/60">
            GatorsList is exclusively for SFSU students.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
