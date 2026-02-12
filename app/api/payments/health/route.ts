import { NextResponse } from "next/server";
import { isRazorpayConfigured } from "../../../../lib/config/env";

export async function GET() {
  const { configured, missing } = isRazorpayConfigured();
  return NextResponse.json({ razorpayConfigured: configured, missing });
}
