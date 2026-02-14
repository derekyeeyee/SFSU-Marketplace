import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const conversationid = searchParams.get("conversationid");
  const listingid = searchParams.get("listingid");

  const params = new URLSearchParams();
  if (conversationid) params.set("conversationid", conversationid);
  if (listingid) params.set("listingid", listingid);

  try {
    const res = await fetch(`${BACKEND_URL}/messages?${params}`);
    if (!res.ok) return NextResponse.json([], { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }
    return NextResponse.json(await res.json(), { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 502 },
    );
  }
}
