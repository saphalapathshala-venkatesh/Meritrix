import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { isRazorpayConfigured } from "../../../../../lib/config/env";
import { createRazorpayOrder, getRazorpayKeyId } from "../../../../../lib/payments/razorpay";

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

    const body = await request.json();
    if (!body.termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Terms & Cancellation/Reschedule Policy." },
        { status: 400 }
      );
    }

    const product = await prisma.passProduct.findUnique({
      where: { passType: "VEDIC_MATHS" },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Pass is not available." }, { status: 404 });
    }

    const existingPass = await prisma.sessionPass.findFirst({
      where: {
        userId: session.user.id,
        passType: "VEDIC_MATHS",
        paymentStatus: "SUCCESS",
      },
    });

    if (existingPass && existingPass.usedCredits < existingPass.totalCredits) {
      return NextResponse.json(
        { error: "You already have an active pass with remaining credits." },
        { status: 409 }
      );
    }

    const amountInPaise = product.priceCents;

    const order = await createRazorpayOrder({
      amountInPaise,
      receipt: `vedic_pass_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        passType: "VEDIC_MATHS",
        productId: product.id,
      },
    });

    const pass = await prisma.sessionPass.create({
      data: {
        userId: session.user.id,
        passType: "VEDIC_MATHS",
        productId: product.id,
        totalCredits: product.totalCredits,
        currency: product.currency,
        mrpCents: product.mrpCents,
        priceCents: product.priceCents,
        orderId: order.id,
        termsVersion: product.termsVersion,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      passId: pass.id,
      productName: product.title,
      userEmail: session.user.email,
      userName: session.user.name,
    });
  } catch (err) {
    console.error("Vedic pass create-order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
