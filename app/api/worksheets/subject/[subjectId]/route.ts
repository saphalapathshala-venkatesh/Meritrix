import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../../lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId } = await params;
  const userId = session.user.id;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      grade: { select: { name: true } },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          worksheets: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            include: {
              completions: {
                where: { userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const hasSubjectPurchase = await prisma.subjectPurchase.findFirst({
    where: { userId, subjectId, paymentStatus: "SUCCESS" },
  });

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

  const hasPurchased = !!hasSubjectPurchase || hasPackageAccess;

  const chapters = subject.chapters.map((ch) => ({
    id: ch.id,
    name: ch.name,
    worksheets: ch.worksheets.map((ws) => ({
      id: ws.id,
      title: ws.title,
      tier: ws.tier,
      isFree: ws.isFree,
      isLocked: !ws.isFree && !hasPurchased,
      isCompleted: ws.completions.length > 0,
      pdfUrl: ws.pdfUrl,
    })),
  }));

  return NextResponse.json({
    subject: {
      id: subject.id,
      name: subject.name,
      gradeName: subject.grade.name,
      price: subject.price,
      hasPurchased,
    },
    chapters,
  });
}
