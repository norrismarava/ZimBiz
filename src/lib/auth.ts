import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

const SESSION_COOKIE = "zb_session";
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      id: randomUUID(),
      userId,
      token,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION / 1000,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date(), failedLoginCount: 0, lockedUntil: null },
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          profile: true,
          userRoles: { include: { role: { include: { permissions: true } } } },
          providerProfile: true,
          businessMembers: { include: { business: true } },
          ownedBusinesses: { where: { deletedAt: null }, take: 1 },
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (session.user.status !== "ACTIVE") return null;

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(roleName: string) {
  const user = await requireAuth();
  const hasRole = user.userRoles.some((ur: { role: { name: string } }) => ur.role.name === roleName);
  if (!hasRole) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function hasPermission(user: CurrentUser, permission: string): boolean {
  return user.userRoles.some((ur: { role: { permissions: { name: string }[] } }) =>
    ur.role.permissions.some((p: { name: string }) => p.name === permission)
  );
}

export async function assignRole(userId: string, roleName: string, scope?: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  await prisma.userRole.upsert({
    where: {
      userId_roleId_scope: {
        userId,
        roleId: role.id,
        scope: scope ?? "global",
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
      scope: scope ?? "global",
    },
  });
}
