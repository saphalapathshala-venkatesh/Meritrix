import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSessionFromRequest } from "../../../lib/auth";

export async function GET() {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const subjects = await prisma.subject.findMany({
    orderBy: [{ grade: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      grade: { select: { name: true } },
      chapters: {
        include: {
          worksheets: {
            where: { isPublished: true },
            select: {
              id: true,
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

  const subjectProgress = subjects.map((s) => {
    let total = 0;
    let completed = 0;
    for (const ch of s.chapters) {
      for (const ws of ch.worksheets) {
        total++;
        if (ws.completions.length > 0) completed++;
      }
    }
    return {
      id: s.id,
      name: s.name,
      gradeName: s.grade.name,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const totalWorksheets = subjectProgress.reduce((a, s) => a + s.total, 0);
  const totalCompleted = subjectProgress.reduce((a, s) => a + s.completed, 0);
  const overallPercent = totalWorksheets > 0 ? Math.round((totalCompleted / totalWorksheets) * 100) : 0;

  return NextResponse.json({
    overallPercent,
    totalWorksheets,
    totalCompleted,
    subjects: subjectProgress,
  });
}
