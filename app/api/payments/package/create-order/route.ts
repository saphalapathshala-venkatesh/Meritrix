import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { createRazorpayOrder, getRazorpayKeyId } from "../../../../../lib/payments/razorpay";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packageId } = await req.json();
    if (!packageId) {
      return NextResponse.json({ error: "packageId is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const existing = await prisma.packagePurchase.findFirst({
      where: { userId, packageId, paymentStatus: "SUCCESS" },
    });
    if (existing) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (!pkg.isActive) {
      return NextResponse.json({ error: "Package is not available" }, { status: 400 });
    }

    const amountInPaise = pkg.price * 100;
    const receipt = `pkg_${packageId}_${userId}_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountInPaise,
      receipt,
      notes: { type: "package", packageId, userId },
    });

    await prisma.packagePurchase.upsert({
      where: { userId_packageId: { userId, packageId } },
      create: {
        userId,
        packageId,
        amountPaid: pkg.price,
        paymentStatus: "PENDING",
        paymentRef: receipt,
        gateway: "razorpay",
        orderId: order.id,
        currency: "INR",
      },
      update: {
        amountPaid: pkg.price,
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
      packageName: pkg.name,
      userEmail: session.user.email,
      userName: session.user.name,
    });
  } catch (err) {
    console.error("Create package order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
