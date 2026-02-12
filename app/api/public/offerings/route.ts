import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        grade: { select: { id: true, name: true } },
        chapters: {
          select: {
            worksheets: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
      orderBy: [{ grade: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    });

    const subjectOfferings = subjects
      .filter((s) => s.chapters.some((ch) => ch.worksheets.length > 0))
      .map((s) => {
        const sp = s.salePrice || s.price;
        const mp = s.mrp > sp ? s.mrp : 0;
        const disc = mp > 0 ? Math.round(((mp - sp) / mp) * 100) : 0;
        return {
          type: "SUBJECT" as const,
          id: s.id,
          title: s.name,
          gradeName: s.grade.name,
          mrp: mp,
          salePrice: sp,
          discountPercent: disc,
          isActive: true,
        };
      });

    const packages = await prisma.package.findMany({
      where: { isActive: true },
    });

    const allSubjects = await prisma.subject.findMany({
      include: { grade: { select: { id: true, name: true } } },
    });

    const subjectMap = new Map(allSubjects.map((s) => [s.id, s]));

    const gradeSubjectCounts = new Map<string, number>();
    for (const s of allSubjects) {
      gradeSubjectCounts.set(s.grade.id, (gradeSubjectCounts.get(s.grade.id) || 0) + 1);
    }

    const packageOfferings = packages
      .map((pkg) => {
        const pkgSubjects = pkg.subjectIds
          .map((sid) => subjectMap.get(sid))
          .filter(Boolean) as typeof allSubjects;

        if (pkgSubjects.length === 0) return null;

        const gradeIds = new Set(pkgSubjects.map((s) => s.grade.id));
        if (gradeIds.size !== 1) return null;

        const gradeId = Array.from(gradeIds)[0];
        const gradeName = pkgSubjects[0].grade.name;
        const totalForGrade = gradeSubjectCounts.get(gradeId) || 0;
        const includesAll = pkgSubjects.length >= totalForGrade && totalForGrade > 0;

        const sp = pkg.salePrice || pkg.price;
        const mp = pkg.mrp > sp ? pkg.mrp : 0;
        const disc = mp > 0 ? Math.round(((mp - sp) / mp) * 100) : 0;

        return {
          type: "GRADE_PACK" as const,
          id: pkg.id,
          title: pkg.name,
          gradeName,
          mrp: mp,
          salePrice: sp,
          discountPercent: disc,
          includesAllSubjects: includesAll,
          subjectCount: pkgSubjects.length,
          isActive: pkg.isActive,
        };
      })
      .filter(Boolean);

    return NextResponse.json([...subjectOfferings, ...packageOfferings]);
  } catch (err) {
    console.error("Public offerings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
