import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/posts/featured?limit=10`);
    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
