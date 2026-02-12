import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdminApi } from "../../../../lib/admin-auth";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const products = await prisma.passProduct.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Admin passes GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "update") {
      const { id, title, subtitle, totalCredits, mrpCents, priceCents, isActive, termsVersion, durationMins, currency } = body;

      if (!id) {
        return NextResponse.json({ error: "Missing product ID." }, { status: 400 });
      }

      const updated = await prisma.passProduct.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(subtitle !== undefined && { subtitle }),
          ...(totalCredits !== undefined && { totalCredits: Number(totalCredits) }),
          ...(mrpCents !== undefined && { mrpCents: Number(mrpCents) }),
          ...(priceCents !== undefined && { priceCents: Number(priceCents) }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
          ...(termsVersion !== undefined && { termsVersion }),
          ...(durationMins !== undefined && { durationMins: Number(durationMins) }),
          ...(currency !== undefined && { currency }),
        },
      });

      return NextResponse.json({ product: updated });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Admin passes POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
