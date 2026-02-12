import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdminApi } from "../../../../lib/admin-auth";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const sessions = await prisma.liveSession.findMany({
      orderBy: { scheduledAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Admin sessions GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { title, description, sessionType, category, maxStudents, pricePerSlot, scheduledAt, durationMins, meetingUrl } = body;

      if (!title || !scheduledAt) {
        return NextResponse.json({ error: "Title and scheduled time are required." }, { status: 400 });
      }

      const session = await prisma.liveSession.create({
        data: {
          title,
          description: description || null,
          sessionType: sessionType || "ONE_ON_ONE",
          category: category || "general",
          mode: "ONLINE_LIVE",
          maxStudents: Number(maxStudents) || 1,
          pricePerSlot: Number(pricePerSlot) || 0,
          scheduledAt: new Date(scheduledAt),
          durationMins: Number(durationMins) || 60,
          meetingUrl: meetingUrl || null,
        },
      });

      return NextResponse.json({ session });
    }

    if (action === "toggle") {
      const { id, isActive } = body;
      if (Boolean(isActive)) {
        const existing = await prisma.liveSession.findUnique({ where: { id } });
        if (existing && !existing.meetingUrl) {
          return NextResponse.json(
            { error: "Cannot activate a session without a meeting link. Add a Zoom/Meet URL first." },
            { status: 400 }
          );
        }
      }
      const session = await prisma.liveSession.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
      });
      return NextResponse.json({ session });
    }

    if (action === "delete") {
      const { id } = body;
      await prisma.liveSession.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Admin sessions POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
