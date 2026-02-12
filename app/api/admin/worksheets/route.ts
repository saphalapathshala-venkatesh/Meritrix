import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

const tierEnum = z.enum(["foundational", "skill_builder", "mastery"]);

export async function GET(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const chapterId = req.nextUrl.searchParams.get("chapterId");
    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
    }

    const worksheets = await prisma.worksheet.findMany({
      where: { chapterId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(worksheets);
  } catch (err) {
    console.error("Admin worksheets GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  chapterId: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  tier: tierEnum,
  isFree: z.boolean(),
  isPublished: z.boolean(),
  pdfUrl: z.string().nullable().optional(),
  answerUrl: z.string().nullable().optional(),
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

    const worksheet = await prisma.worksheet.create({ data: parsed.data });
    return NextResponse.json(worksheet, { status: 201 });
  } catch (err) {
    console.error("Admin worksheets POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  chapterId: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  tier: tierEnum,
  isFree: z.boolean(),
  isPublished: z.boolean(),
  pdfUrl: z.string().nullable().optional(),
  answerUrl: z.string().nullable().optional(),
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
    const worksheet = await prisma.worksheet.update({ where: { id }, data });
    return NextResponse.json(worksheet);
  } catch (err) {
    console.error("Admin worksheets PUT error:", err);
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

    await prisma.worksheet.delete({ where: { id: parsed.data.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin worksheets DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
