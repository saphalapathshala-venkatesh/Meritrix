import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { verifyRazorpaySignature } from "../../../../../lib/payments/razorpay";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subjectId, orderId, paymentId, signature } = await req.json();
    if (!subjectId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = session.user.id;

    const purchase = await prisma.subjectPurchase.findFirst({
      where: { userId, subjectId, orderId },
    });
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.paymentStatus === "SUCCESS") {
      return NextResponse.json({ ok: true });
    }

    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });

    if (isValid) {
      await prisma.subjectPurchase.update({
        where: { id: purchase.id },
        data: {
          paymentStatus: "SUCCESS",
          paymentId,
          signature,
        },
      });
      return NextResponse.json({ ok: true });
    } else {
      await prisma.subjectPurchase.update({
        where: { id: purchase.id },
        data: {
          paymentStatus: "FAILED",
          paymentId,
          signature,
        },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }
  } catch (err) {
    console.error("Verify subject payment error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
