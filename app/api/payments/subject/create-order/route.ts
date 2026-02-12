import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { createRazorpayOrder, getRazorpayKeyId } from "../../../../../lib/payments/razorpay";
import { isRazorpayConfigured } from "../../../../../lib/config/env";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { configured } = isRazorpayConfigured();
  if (!configured) {
    return NextResponse.json({ error: "Payments are temporarily unavailable. Please try again later." }, { status: 503 });
  }

  try {
    const { subjectId } = await req.json();
    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const existing = await prisma.subjectPurchase.findFirst({
      where: { userId, subjectId, paymentStatus: "SUCCESS" },
    });
    if (existing) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (subject.price <= 0) {
      return NextResponse.json({ error: "Subject is free" }, { status: 400 });
    }

    const amountInPaise = subject.price * 100;
    const receipt = `sub_${subjectId}_${userId}_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountInPaise,
      receipt,
      notes: { type: "subject", subjectId, userId },
    });

    await prisma.subjectPurchase.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      create: {
        userId,
        subjectId,
        amountPaid: subject.price,
        paymentStatus: "PENDING",
        paymentRef: receipt,
        gateway: "razorpay",
        orderId: order.id,
        currency: "INR",
      },
      update: {
        amountPaid: subject.price,
        paymentStatus: "PENDING",
        paymentRef: receipt,
        gateway: "razorpay",
        orderId: order.id,
        paymentId: null,
        signature: null,
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      subjectName: subject.name,
      userEmail: session.user.email,
      userName: session.user.name,
    });
  } catch (err) {
    console.error("Create subject order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
