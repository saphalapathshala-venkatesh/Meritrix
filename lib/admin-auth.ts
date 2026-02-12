import { NextResponse } from "next/server";
import { getSessionFromRequest } from "./auth";

export async function requireAdminApi() {
  const session = await getSessionFromRequest();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }
  return { error: null, user: session.user };
}
