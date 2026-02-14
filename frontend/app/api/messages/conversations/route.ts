import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const userid = request.nextUrl.searchParams.get("userid");
  if (!userid) {
    return NextResponse.json(
      { error: "userid is required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/messages/conversations/${userid}`,
    );
    if (!res.ok) return NextResponse.json([], { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
