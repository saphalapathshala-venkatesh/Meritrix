import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(coupons);
  } catch (err) {
    console.error("Admin coupons GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  code: z.string().min(1),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().nullable().optional(),
  minAmount: z.number().int(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { expiresAt, ...rest } = parsed.data;
    const coupon = await prisma.coupon.create({
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    console.error("Admin coupons POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().nullable().optional(),
  minAmount: z.number().int(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export async function PUT(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, expiresAt, ...rest } = parsed.data;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...rest,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json(coupon);
  } catch (err) {
    console.error("Admin coupons PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin coupons DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
