import Razorpay from "razorpay";
import { createHmac } from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CreateOrderParams {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder({ amountInPaise, receipt, notes }: CreateOrderParams) {
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes: notes || {},
  });
  return order;
}

interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }: VerifySignatureParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");
  return expectedSignature === signature;
}

export function verifyWebhookSignature(body: string, receivedSignature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expectedSignature = createHmac("sha256", secret).update(body).digest("hex");
  return expectedSignature === receivedSignature;
}

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID!;
}
