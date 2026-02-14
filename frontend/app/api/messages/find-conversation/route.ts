import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const listingid = searchParams.get("listingid");
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  if (!listingid || !user1 || !user2) {
    return NextResponse.json(
      { error: "listingid, user1, user2 required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ listingid, user1, user2 });
  try {
    const res = await fetch(
      `${BACKEND_URL}/messages/find-conversation?${params}`,
    );
    if (!res.ok) {
      return NextResponse.json(
        { conversationid: null },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ conversationid: null }, { status: 502 });
  }
}
