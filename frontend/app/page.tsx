"use client";

import { useState } from "react";

const BACKEND_URL = "http://localhost:8000";

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function callBackend() {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/hello`);
      const data = (await response.json()) as { message: string };
      setMessage(data.message);
    } catch {
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={callBackend}
          className="rounded bg-black px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Loading..." : "Call Backend"}
        </button>
        <p>{message}</p>
      </div>
    </main>
  );
}
