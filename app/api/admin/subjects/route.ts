import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const subjects = await prisma.subject.findMany({
      include: { grade: { select: { name: true, sortOrder: true } } },
      orderBy: [{ grade: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    });
    return NextResponse.json(subjects);
  } catch (err) {
    console.error("Admin subjects GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  gradeId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().int(),
  sortOrder: z.number().int(),
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

    const subject = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error("Admin subjects POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  gradeId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().int(),
  sortOrder: z.number().int(),
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
    const subject = await prisma.subject.update({ where: { id }, data });
    return NextResponse.json(subject);
  } catch (err) {
    console.error("Admin subjects PUT error:", err);
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

    await prisma.subject.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin subjects DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
