import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import {
  normalizeIdentifier,
  verifyPassword,
  createSession,
  buildSessionCookie,
} from "../../../../lib/auth";

const loginSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { identifier, password } = parsed.data;
    const normalized = normalizeIdentifier(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { phone: normalized }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || null;
    const rawToken = await createSession(user.id, userAgent, ip);

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    res.headers.set("Set-Cookie", buildSessionCookie(rawToken));
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
