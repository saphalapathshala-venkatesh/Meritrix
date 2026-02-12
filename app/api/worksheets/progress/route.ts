import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { worksheetId, completed } = body;

  if (!worksheetId || typeof completed !== "boolean") {
    return NextResponse.json(
      { error: "worksheetId and completed (boolean) required" },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  const worksheet = await prisma.worksheet.findUnique({
    where: { id: worksheetId },
    include: {
      chapter: {
        include: {
          subject: {
            include: {
              subjectPurchases: {
                where: { userId, paymentStatus: "SUCCESS" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!worksheet || !worksheet.isPublished) {
    return NextResponse.json({ error: "Worksheet not found" }, { status: 404 });
  }

  const subjectId = worksheet.chapter.subject.id;
  const hasSubjectPurchase = worksheet.chapter.subject.subjectPurchases.length > 0;

  let hasPackageAccess = false;
  if (!hasSubjectPurchase) {
    const packagePurchases = await prisma.packagePurchase.findMany({
      where: { userId, paymentStatus: "SUCCESS" },
      include: { package: { select: { subjectIds: true } } },
    });
    hasPackageAccess = packagePurchases.some((pp) =>
      pp.package.subjectIds.includes(subjectId)
    );
  }

  const hasAccess = worksheet.isFree || hasSubjectPurchase || hasPackageAccess;

  if (!hasAccess) {
    return NextResponse.json({ error: "Worksheet is locked" }, { status: 403 });
  }

  if (completed) {
    await prisma.worksheetCompletion.upsert({
      where: { userId_worksheetId: { userId, worksheetId } },
      update: { completedAt: new Date() },
      create: { userId, worksheetId },
    });
  } else {
    await prisma.worksheetCompletion
      .delete({ where: { userId_worksheetId: { userId, worksheetId } } })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true, completed });
}
