import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const grades = await prisma.grade.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(grades);
  } catch (err) {
    console.error("Admin grades GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
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

    const grade = await prisma.grade.create({ data: parsed.data });
    return NextResponse.json(grade, { status: 201 });
  } catch (err) {
    console.error("Admin grades POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
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
    const grade = await prisma.grade.update({ where: { id }, data });
    return NextResponse.json(grade);
  } catch (err) {
    console.error("Admin grades PUT error:", err);
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

    await prisma.grade.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin grades DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
