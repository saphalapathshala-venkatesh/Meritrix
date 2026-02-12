import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import {
  normalizeIdentifier,
  hashPassword,
  createSession,
  buildSessionCookie,
} from "../../../../lib/auth";

const registerSchema = z.object({
  identifier: z
    .string()
    .min(3, "Identifier must be at least 3 characters")
    .max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  name: z.string().min(1, "Name is required").max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { identifier, password, name } = parsed.data;
    const normalized = normalizeIdentifier(identifier);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalized }, { phone: normalized }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this identifier already exists." },
        { status: 409 }
      );
    }

    const isEmail = normalized.includes("@");
    const isPhone = /^\d{7,15}$/.test(normalized);

    const user = await prisma.user.create({
      data: {
        email: isEmail ? normalized : `${normalized}@placeholder.local`,
        phone: isPhone ? normalized : null,
        passwordHash: await hashPassword(password),
        name: name || normalized,
        role: "STUDENT",
      },
    });

    const userAgent = req.headers.get("user-agent");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || null;
    const rawToken = await createSession(user.id, userAgent, ip);

    const res = NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
    res.headers.set("Set-Cookie", buildSessionCookie(rawToken));
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
