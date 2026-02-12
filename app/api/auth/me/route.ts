import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
