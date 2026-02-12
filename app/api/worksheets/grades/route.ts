import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function GET() {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const grades = await prisma.grade.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, sortOrder: true },
  });

  return NextResponse.json({ grades });
}
