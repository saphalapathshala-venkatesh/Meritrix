import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: {
        category: "vedic",
        isActive: true,
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        sessionType: true,
        mode: true,
        maxStudents: true,
        scheduledAt: true,
        durationMins: true,
        _count: { select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } },
      },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      sessionType: s.sessionType,
      mode: s.mode,
      maxStudents: s.maxStudents,
      scheduledAt: s.scheduledAt,
      durationMins: s.durationMins,
      bookedCount: s._count.bookings,
      spotsLeft: s.maxStudents - s._count.bookings,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (err) {
    console.error("Vedic sessions list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
