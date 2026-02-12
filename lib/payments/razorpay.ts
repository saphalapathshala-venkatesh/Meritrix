import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { getRazorpayConfig } from "../config/env";

function createRazorpayInstance() {
  const config = getRazorpayConfig();
  return new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });
}

interface CreateOrderParams {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder({ amountInPaise, receipt, notes }: CreateOrderParams) {
  const razorpay = createRazorpayInstance();
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
  const config = getRazorpayConfig();
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = createHmac("sha256", config.keySecret).update(body).digest("hex");
  return expectedSignature === signature;
}

export function verifyWebhookSignature(body: string, receivedSignature: string): boolean {
  const config = getRazorpayConfig();
  const expectedSignature = createHmac("sha256", config.webhookSecret).update(body).digest("hex");
  return expectedSignature === receivedSignature;
}

export function getRazorpayKeyId(): string {
  const config = getRazorpayConfig();
  return config.keyId;
}
