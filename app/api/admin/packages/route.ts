import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const packages = await prisma.package.findMany({
      include: { _count: { select: { purchases: true } } },
    });

    const result = packages.map((pkg) => ({
      ...pkg,
      purchaseCount: pkg._count.purchases,
      _count: undefined,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin packages GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().int(),
  mrp: z.number().int().optional().default(0),
  salePrice: z.number().int().optional().default(0),
  subjectIds: z.array(z.string()),
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

    const d = parsed.data;
    const finalSalePrice = d.salePrice || d.price;
    const pkg = await prisma.package.create({ data: { ...d, salePrice: finalSalePrice, price: finalSalePrice } });
    return NextResponse.json(pkg, { status: 201 });
  } catch (err) {
    console.error("Admin packages POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().int(),
  mrp: z.number().int().optional().default(0),
  salePrice: z.number().int().optional().default(0),
  subjectIds: z.array(z.string()),
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

    const { id, ...data } = parsed.data;
    const finalSalePrice = data.salePrice || data.price;
    const pkg = await prisma.package.update({ where: { id }, data: { ...data, salePrice: finalSalePrice, price: finalSalePrice } });
    return NextResponse.json(pkg);
  } catch (err) {
    console.error("Admin packages PUT error:", err);
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

    await prisma.package.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin packages DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
