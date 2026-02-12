import { NextRequest, NextResponse } from "next/server";
import { destroySession, buildClearSessionCookie, COOKIE_NAME_EXPORT } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(COOKIE_NAME_EXPORT)?.value;
    if (rawToken) {
      await destroySession(rawToken);
    }

    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", buildClearSessionCookie());
    return res;
  } catch (err) {
    console.error("Logout error:", err);
    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", buildClearSessionCookie());
    return res;
  }
}
