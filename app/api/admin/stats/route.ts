import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const [totalUsers, totalStudents, totalWorksheets, totalSubjects, totalPackages, totalCoupons] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.worksheet.count({ where: { isPublished: true } }),
        prisma.subject.count(),
        prisma.package.count(),
        prisma.coupon.count(),
      ]);

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalWorksheets,
      totalSubjects,
      totalPackages,
      totalCoupons,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
