import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, assignRole } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, password, accountType } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: { equals: email, mode: "insensitive" } }, { phone }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        passwordHash,
        profile: { create: { displayName: name } },
        notificationPrefs: { create: {} },
      },
    });

    const roleName =
      accountType === "business"
        ? "BUSINESS_OWNER"
        : accountType === "provider"
          ? "INDIVIDUAL_PROVIDER"
          : "CUSTOMER";

    await assignRole(user.id, roleName);

    if (accountType === "provider") {
      const slug = slugify(name);
      const existingSlug = await prisma.providerProfile.findUnique({ where: { slug } });
      const finalSlug = existingSlug ? `${slug}-${user.id.slice(0, 8)}` : slug;

      await prisma.providerProfile.create({
        data: {
          userId: user.id,
          displayName: name,
          slug: finalSlug,
          phone,
          status: "DRAFT",
        },
      });
    }

    if (accountType === "business") {
      const slug = slugify(name);
      const existingSlug = await prisma.business.findUnique({ where: { slug } });
      const finalSlug = existingSlug ? `${slug}-${user.id.slice(0, 8)}` : slug;

      await prisma.business.create({
        data: {
          ownerId: user.id,
          name,
          slug: finalSlug,
          status: "DRAFT",
          phone,
        },
      });
    }

    await createSession(user.id);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
