import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { quoteSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to submit a quote" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: "You need a provider profile to submit quotations" },
        { status: 403 }
      );
    }

    if (data.requestId) {
      const request = await prisma.customerRequest.findUnique({
        where: { id: data.requestId },
      });
      if (!request || request.status !== "OPEN") {
        return NextResponse.json(
          { error: "This request is no longer accepting quotations" },
          { status: 400 }
        );
      }
    }

    const totalAmount = data.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `QB-${Date.now()}-${randomUUID().slice(0, 8)}`,
        requestId: data.requestId,
        providerId: providerProfile.id,
        providerUserId: user.id,
        scopeOfWork: data.scopeOfWork,
        currency: data.currency,
        totalAmount,
        validityPeriod: data.validityPeriod,
        startDate: data.startDate ? new Date(data.startDate) : null,
        estimatedCompletion: data.estimatedCompletion ? new Date(data.estimatedCompletion) : null,
        warranty: data.warranty,
        paymentSchedule: data.paymentSchedule,
        exclusions: data.exclusions,
        assumptions: data.assumptions,
        notes: data.notes,
        terms: data.terms,
        status: "SENT",
        sentAt: new Date(),
        lineItems: {
          create: data.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
            isLabour: item.isLabour,
            isMaterial: item.isMaterial,
            isDelivery: item.isDelivery,
          })),
        },
      },
      include: { lineItems: true },
    });

    if (data.requestId) {
      await prisma.customerRequest.update({
        where: { id: data.requestId },
        data: { status: "QUOTE_RECEIVED" },
      });
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("Create quote error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { providerUserId: user.id },
          { request: { customerId: user.id } },
        ],
        ...(requestId ? { requestId } : {}),
      },
      include: {
        provider: { select: { id: true, displayName: true, slug: true } },
        business: { select: { id: true, name: true, slug: true, logoUrl: true } },
        request: { select: { title: true, customerId: true } },
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Get quotes error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}
