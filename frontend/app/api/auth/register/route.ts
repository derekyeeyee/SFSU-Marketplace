import { NextRequest, NextResponse } from "next/server";

// TODO: Proxy to real backend auth once accounts table is ready.
// For now, returns a stub user so the frontend flow works end-to-end.

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body as {
    name: string;
    email: string;
    password: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 },
    );
  }

  // Stub: always succeed, return a fake user.
  // Replace with: const res = await fetch(`${BACKEND_URL}/auth/register`, ...);
  const user = {
    id: "stub-user-" + Date.now(),
    email,
    name,
  };

  return NextResponse.json({ user }, { status: 201 });
}
