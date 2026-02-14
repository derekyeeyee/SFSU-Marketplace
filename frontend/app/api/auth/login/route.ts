import { NextRequest, NextResponse } from "next/server";

// TODO: Proxy to real backend auth once accounts table is ready.
// For now, returns a stub user so the frontend flow works end-to-end.

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  // Stub: accept any credentials, return a fake user.
  // Replace with: const res = await fetch(`${BACKEND_URL}/auth/login`, ...);
  const user = {
    id: "stub-user-1",
    email,
    name: email.split("@")[0],
  };

  return NextResponse.json({ user });
}
