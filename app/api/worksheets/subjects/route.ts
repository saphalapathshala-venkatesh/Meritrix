import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gradeId = req.nextUrl.searchParams.get("gradeId");
  if (!gradeId) {
    return NextResponse.json({ error: "gradeId required" }, { status: 400 });
  }

  const subjects = await prisma.subject.findMany({
    where: { gradeId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, price: true },
  });

  return NextResponse.json({ subjects });
}
