import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { prisma } from "./prisma";

const COOKIE_NAME = "meritrix_session";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function destroySessionAndClear(sessionId: string) {
  const cookieStore = await cookies();
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
}

export async function requireUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  const headerList = await headers();
  const pathname = headerList.get("x-next-pathname") || headerList.get("x-invoke-path") || "/dashboard";

  if (!rawToken) {
    const url = `/login?from=${encodeURIComponent(pathname)}`;
    redirect(url);
  }

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!session) {
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    redirect(`/login?from=${encodeURIComponent(pathname)}`);
  }

  if (session.expiresAt < new Date()) {
    await destroySessionAndClear(session.id);
    redirect(`/login?from=${encodeURIComponent(pathname)}`);
  }

  if (session.user.isBlocked) {
    await destroySessionAndClear(session.id);
    redirect(`/login?from=${encodeURIComponent(pathname)}`);
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
