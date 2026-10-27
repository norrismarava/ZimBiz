import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { customerRequestSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to create a request" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = customerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const request = await prisma.customerRequest.create({
      data: {
        customerId: user.id,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        businessId: data.businessId,
        locationId: data.locationId,
        urgency: data.urgency.toUpperCase() as "LOW" | "NORMAL" | "HIGH" | "URGENT",
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        currency: data.currency,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        quantity: data.quantity,
        specifications: data.specifications,
        siteConditions: data.siteConditions,
        preferredContact: data.preferredContact.toUpperCase() as "IN_APP" | "EMAIL" | "PHONE" | "WHATSAPP",
        status: "OPEN",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const requests = await prisma.customerRequest.findMany({
      where: {
        customerId: user.id,
        ...(status ? { status: status.toUpperCase() as "OPEN" | "MATCHED" | "QUOTE_RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "EXPIRED" } : {}),
      },
      include: {
        category: true,
        quotes: { select: { id: true, status: true, totalAmount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
