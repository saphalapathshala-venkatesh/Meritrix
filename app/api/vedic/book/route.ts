import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { liveSessionId } = await request.json();
    if (!liveSessionId) {
      return NextResponse.json({ error: "Missing session ID." }, { status: 400 });
    }

    const pass = await prisma.sessionPass.findFirst({
      where: {
        userId: session.user.id,
        passType: "VEDIC_MATHS",
        paymentStatus: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pass) {
      return NextResponse.json({ error: "No active Vedic pass found. Please purchase one first." }, { status: 403 });
    }

    if (pass.usedCredits >= pass.totalCredits) {
      return NextResponse.json({ error: "All session credits have been used. Purchase a new pass to continue." }, { status: 403 });
    }

    const liveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
      include: { _count: { select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } } } },
    });

    if (!liveSession || !liveSession.isActive || liveSession.category !== "vedic") {
      return NextResponse.json({ error: "Session not available." }, { status: 404 });
    }

    if (liveSession._count.bookings >= liveSession.maxStudents) {
      return NextResponse.json({ error: "Session is full." }, { status: 409 });
    }

    const existingBooking = await prisma.liveBooking.findUnique({
      where: { userId_liveSessionId: { userId: session.user.id, liveSessionId } },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "You have already booked this session." }, { status: 409 });
    }

    const [booking] = await prisma.$transaction([
      prisma.liveBooking.create({
        data: {
          userId: session.user.id,
          liveSessionId,
          status: "CONFIRMED",
          amountPaid: 0,
          paymentStatus: "SUCCESS",
          passId: pass.id,
          termsVersion: "v1",
          termsAcceptedAt: new Date(),
        },
      }),
      prisma.sessionPass.update({
        where: { id: pass.id },
        data: { usedCredits: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      creditsUsed: pass.usedCredits + 1,
      creditsTotal: pass.totalCredits,
    });
  } catch (err) {
    console.error("Vedic book error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
