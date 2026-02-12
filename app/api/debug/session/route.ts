import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });
  } catch (err) {
    console.error("Debug session error:", err);
    return NextResponse.json({ error: "Failed to check session" }, { status: 500 });
  }
}
