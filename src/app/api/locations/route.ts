import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { type: { in: ["city", "town", "growth_point", "suburb"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true },
      take: 100,
    });

    return NextResponse.json({ data: locations });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
