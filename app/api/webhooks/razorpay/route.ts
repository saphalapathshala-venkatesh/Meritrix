import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyWebhookSignature } from "../../../../lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const receivedSignature = req.headers.get("x-razorpay-signature") || "";

    const isValid = verifyWebhookSignature(rawBody, receivedSignature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payment = event.payload?.payment?.entity;

    if (!payment) {
      return NextResponse.json({ ok: true });
    }

    const rzpOrderId = payment.order_id;
    if (!rzpOrderId) {
      return NextResponse.json({ ok: true });
    }

    if (eventType === "payment.captured" || eventType === "payment.authorized") {
      const subjectPurchase = await prisma.subjectPurchase.findUnique({
        where: { orderId: rzpOrderId },
      });
      if (subjectPurchase && subjectPurchase.paymentStatus === "PENDING") {
        await prisma.subjectPurchase.update({
          where: { id: subjectPurchase.id },
          data: {
            paymentStatus: "SUCCESS",
            paymentId: payment.id,
          },
        });
        return NextResponse.json({ ok: true });
      }

      const packagePurchase = await prisma.packagePurchase.findUnique({
        where: { orderId: rzpOrderId },
      });
      if (packagePurchase && packagePurchase.paymentStatus === "PENDING") {
        await prisma.packagePurchase.update({
          where: { id: packagePurchase.id },
          data: {
            paymentStatus: "SUCCESS",
            paymentId: payment.id,
          },
        });
      }
    }

    if (eventType === "payment.failed") {
      const subjectPurchase = await prisma.subjectPurchase.findUnique({
        where: { orderId: rzpOrderId },
      });
      if (subjectPurchase && subjectPurchase.paymentStatus === "PENDING") {
        await prisma.subjectPurchase.update({
          where: { id: subjectPurchase.id },
          data: { paymentStatus: "FAILED" },
        });
        return NextResponse.json({ ok: true });
      }

      const packagePurchase = await prisma.packagePurchase.findUnique({
        where: { orderId: rzpOrderId },
      });
      if (packagePurchase && packagePurchase.paymentStatus === "PENDING") {
        await prisma.packagePurchase.update({
          where: { id: packagePurchase.id },
          data: { paymentStatus: "FAILED" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ ok: true });
  }
}
