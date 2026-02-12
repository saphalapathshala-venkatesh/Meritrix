import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { buildClearSessionCookie, COOKIE_NAME_EXPORT } from "../../../../lib/auth";

export async function GET() {
  const clearHeaders = {
    "Set-Cookie": buildClearSessionCookie(),
  };

  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME_EXPORT)?.value;

    if (!rawToken) {
      return NextResponse.json({ user: null }, { status: 401, headers: clearHeaders });
    }

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const session = await prisma.session.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401, headers: clearHeaders });
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json({ user: null }, { status: 401, headers: clearHeaders });
    }

    if (session.user.isBlocked) {
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json({ user: null, reason: "blocked" }, { status: 403, headers: clearHeaders });
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
