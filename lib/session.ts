import { getIronSession, IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

export interface SessionData {
  userId: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  sessionToken: string;
  isLoggedIn: boolean;
}

const MIN_SESSION_SECRET_LENGTH = 32;
const SESSION_CONFIG_ERROR = "SESSION_SECRET must be set and at least 32 characters long.";

export function hasSessionConfig(): boolean {
  const password = process.env["SESSION_SECRET"];
  return typeof password === "string" && password.length >= MIN_SESSION_SECRET_LENGTH;
}

function getSessionOptions(): SessionOptions {
  const password = process.env["SESSION_SECRET"];
  if (!password || password.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(SESSION_CONFIG_ERROR);
  }

  return {
    password,
    cookieName: "chronocraft_session",
    cookieOptions: {
      secure: process.env["NODE_ENV"] === "production",
      httpOnly: true,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

async function getValidatedSession(): Promise<IronSession<SessionData> | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.sessionToken) return null;

  const loginSession = await db.loginSession.findUnique({
    where: { token: session.sessionToken },
    select: {
      userId: true,
      revokedAt: true,
      expiresAt: true,
      user: { select: { isActive: true, role: true } },
    },
  });

  const expired = loginSession ? loginSession.expiresAt.getTime() <= Date.now() : true;
  if (
    !loginSession ||
    loginSession.userId !== session.userId ||
    loginSession.revokedAt ||
    expired ||
    !loginSession.user.isActive
  ) {
    session.destroy();
    return null;
  }

  session.role = loginSession.user.role;
  return session;
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getValidatedSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session as SessionData;
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await getValidatedSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (session.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return session as SessionData;
}

export async function getCurrentUser(): Promise<SessionData | null> {
  try {
    const session = await getValidatedSession();
    if (!session) return null;
    return session as SessionData;
  } catch {
    return null;
  }
}
