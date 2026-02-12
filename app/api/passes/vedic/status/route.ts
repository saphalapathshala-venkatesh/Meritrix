import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../../lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ pass: null });
    }

    const pass = await prisma.sessionPass.findFirst({
      where: {
        userId: session.user.id,
        passType: "VEDIC_MATHS",
        paymentStatus: "SUCCESS",
      },
      orderBy: { createdAt: "desc" },
      select: {
        totalCredits: true,
        usedCredits: true,
      },
    });

    return NextResponse.json({ pass });
  } catch (err) {
    console.error("Vedic pass status error:", err);
    return NextResponse.json({ pass: null });
  }
}
