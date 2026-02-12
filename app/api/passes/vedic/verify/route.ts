import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { isRazorpayConfigured } from "../../../../../lib/config/env";
import { verifyRazorpaySignature } from "../../../../../lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const { configured } = isRazorpayConfigured();
    if (!configured) {
      return NextResponse.json(
        { error: "Payments are temporarily unavailable." },
        { status: 503 }
      );
    }

    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentId, signature } = await request.json();
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const pass = await prisma.sessionPass.findUnique({
      where: { orderId },
    });

    if (!pass || pass.userId !== session.user.id) {
      return NextResponse.json({ error: "Pass not found." }, { status: 404 });
    }

    if (pass.paymentStatus === "SUCCESS") {
      return NextResponse.json({ ok: true, message: "Already verified." });
    }

    await prisma.sessionPass.update({
      where: { id: pass.id },
      data: {
        paymentStatus: "SUCCESS",
        paymentId,
        signature,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Vedic pass verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
