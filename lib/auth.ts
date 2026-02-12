import { createHash, randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

const COOKIE_NAME = "meritrix_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function normalizeIdentifier(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  const digits = trimmed.replace(/[\s\-().+]/g, "");
  if (/^\d{7,15}$/.test(digits)) {
    return digits;
  }
  return trimmed.toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  userAgent?: string | null,
  ip?: string | null
): Promise<string> {
  await prisma.session.deleteMany({ where: { userId } });

  const rawToken = `${randomUUID()}-${randomBytes(16).toString("hex")}`;
  const tokenHash = hashToken(rawToken);

  await prisma.session.create({
    data: {
      userId,
      token: tokenHash,
      userAgent: userAgent || null,
      ip: ip || null,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  });

  return rawToken;
}

export async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function destroySession(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.session.deleteMany({ where: { token: tokenHash } });
}

export function buildSessionCookie(rawToken: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${rawToken}`,
    "HttpOnly",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    "Path=/",
    `SameSite=Lax`,
  ];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax`;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
