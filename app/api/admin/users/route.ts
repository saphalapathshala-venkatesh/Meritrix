import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;

    const users = await prisma.user.findMany({
      where: search ? { email: { contains: search, mode: "insensitive" } } : undefined,
      select: { id: true, email: true, name: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const blockSchema = z.object({
  action: z.literal("block"),
  userId: z.string(),
  isBlocked: z.boolean(),
});

const deleteSchema = z.object({
  action: z.literal("delete"),
  userId: z.string(),
});

const resetPasswordSchema = z.object({
  action: z.literal("reset-password"),
  userId: z.string(),
  newPassword: z.string().min(6),
});

const postSchema = z.discriminatedUnion("action", [blockSchema, deleteSchema, resetPasswordSchema]);

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (data.action === "block") {
      await prisma.user.update({ where: { id: data.userId }, data: { isBlocked: data.isBlocked } });
      if (data.isBlocked) {
        await prisma.session.deleteMany({ where: { userId: data.userId } });
      }
      return NextResponse.json({ success: true });
    }

    if (data.action === "delete") {
      await prisma.user.delete({ where: { id: data.userId } });
      return NextResponse.json({ success: true });
    }

    if (data.action === "reset-password") {
      const hashed = await hashPassword(data.newPassword);
      await prisma.user.update({ where: { id: data.userId }, data: { passwordHash: hashed } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Admin users POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
