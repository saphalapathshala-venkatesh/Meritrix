import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const subjectId = req.nextUrl.searchParams.get("subjectId");
    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(chapters);
  } catch (err) {
    console.error("Admin chapters GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  subjectId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
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

    const chapter = await prisma.chapter.create({ data: parsed.data });
    return NextResponse.json(chapter, { status: 201 });
  } catch (err) {
    console.error("Admin chapters POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
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
    const chapter = await prisma.chapter.update({ where: { id }, data });
    return NextResponse.json(chapter);
  } catch (err) {
    console.error("Admin chapters PUT error:", err);
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

    await prisma.chapter.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin chapters DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
