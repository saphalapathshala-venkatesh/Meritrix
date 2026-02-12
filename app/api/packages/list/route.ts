import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        isActive: true,
      },
      orderBy: { price: "asc" },
    });
    return NextResponse.json(packages);
  } catch (err) {
    console.error("List packages error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
