"use server";

import { db } from "@/lib/db";
import { getSession, hasSessionConfig } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import { ChangePasswordSchema, LoginSchema, RegisterSchema } from "@/validations";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role, NotificationCategory, NotificationPriority } from "@prisma/client";
import { headers } from "next/headers";

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function getRequestMeta() {
  const h = await headers();
  return {
    ipAddress: h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown",
  };
}

async function createLoginSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = randomBytes(32).toString("hex");
  await db.loginSession.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

const AUTH_CONFIG_ERROR = "Authentication is not configured. Set SESSION_SECRET in production.";

export async function registerAction(
  formData: FormData,
): Promise<ActionResult<{ email: string }>> {
  if (!hasSessionConfig()) {
    return { success: false, error: AUTH_CONFIG_ERROR };
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const emailForLimit = String(formData.get("email") ?? "unknown").toLowerCase();
  const limited = checkRateLimit(`register:${ipAddress}:${emailForLimit}`, 5, 10 * 60 * 1000);
  if (!limited.allowed) {
    return { success: false, error: "Too many registration attempts. Please try again later." };
  }

  const parsed = RegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid registration data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "This email is already registered" };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: Role.CUSTOMER,
      profile: { create: { firstName, lastName } },
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  await createAuditLog({
    userId: user.id,
    action: "REGISTER",
    entity: "User",
    entityId: user.id,
    ipAddress,
    userAgent,
  });

  await createNotification({
    userId: user.id,
    category: NotificationCategory.ACCOUNT,
    priority: NotificationPriority.STANDARD,
    title: "Bienvenue chez ChronoCraft 👋",
    message: "Votre compte est créé. Découvrez la collection et suivez vos commandes et notifications ici.",
    actionUrl: "/shop",
  });
  await notifyAdmins({
    category: NotificationCategory.ACCOUNT,
    priority: NotificationPriority.STANDARD,
    title: "Nouveau client inscrit",
    message: `${firstName} ${lastName} (${email}) vient de créer un compte.`,
    actionUrl: "/admin/customers",
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = firstName;
  session.lastName = lastName;
  session.sessionToken = await createLoginSession(user.id, ipAddress, userAgent);
  session.isLoggedIn = true;
  await session.save();

  return { success: true, data: { email } };
}

export async function loginAction(
  formData: FormData,
): Promise<ActionResult<{ role: Role }>> {
  if (!hasSessionConfig()) {
    return { success: false, error: AUTH_CONFIG_ERROR };
  }

  const { ipAddress, userAgent } = await getRequestMeta();
  const emailForLimit = String(formData.get("email") ?? "unknown").toLowerCase();
  const limited = checkRateLimit(`login:${ipAddress}:${emailForLimit}`, 8, 10 * 60 * 1000);
  if (!limited.allowed) {
    return { success: false, error: "Too many login attempts. Please try again later." };
  }

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid email or password",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !user.isActive) {
    return { success: false, error: "Invalid email or password" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: "Invalid email or password" };

  await createAuditLog({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    ipAddress,
    userAgent,
  });

  await createNotification({
    userId: user.id,
    category: NotificationCategory.SECURITY,
    priority: NotificationPriority.STANDARD,
    title: "Nouvelle connexion détectée",
    message: `Connexion à votre compte le ${new Date().toLocaleString("fr-FR")}${ipAddress ? ` depuis ${ipAddress}` : ""}. Si ce n'était pas vous, changez votre mot de passe.`,
    actionUrl: "/dashboard/profile",
  });

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = user.profile?.firstName ?? "";
  session.lastName = user.profile?.lastName ?? "";
  session.sessionToken = await createLoginSession(user.id, ipAddress, userAgent);
  session.isLoggedIn = true;
  await session.save();

  return { success: true, data: { role: user.role } };
}

export async function logoutAction() {
  if (!hasSessionConfig()) {
    redirect("/login");
  }

  const session = await getSession();
  if (session.sessionToken) {
    await db.loginSession.updateMany({
      where: { token: session.sessionToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  session.destroy();
  revalidatePath("/");
  redirect("/login");
}

export async function changePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  if (!hasSessionConfig()) {
    return { success: false, error: AUTH_CONFIG_ERROR };
  }

  const session = await getSession();
  if (!session.isLoggedIn) return { success: false, error: "Not authenticated" };

  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid password data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: "User not found" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  await db.loginSession.updateMany({
    where: { userId: user.id, token: { not: session.sessionToken }, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: "PASSWORD_CHANGE",
    entity: "User",
    entityId: user.id,
  });

  await createNotification({
    userId: user.id,
    category: NotificationCategory.SECURITY,
    priority: NotificationPriority.IMPORTANT,
    title: "Mot de passe modifié",
    message: "Votre mot de passe a été modifié. Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.",
    actionUrl: "/dashboard/profile",
    email: true,
    emailTo: user.email,
  });

  return { success: true, data: undefined };
}
