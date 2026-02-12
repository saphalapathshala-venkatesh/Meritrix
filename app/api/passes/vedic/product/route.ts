import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    const product = await prisma.passProduct.findUnique({
      where: { passType: "VEDIC_MATHS" },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ product: null });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        totalCredits: product.totalCredits,
        durationMins: product.durationMins,
        currency: product.currency,
        mrpCents: product.mrpCents,
        priceCents: product.priceCents,
        termsVersion: product.termsVersion,
      },
    });
  } catch (err) {
    console.error("Vedic product fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
