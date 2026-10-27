import Link from "next/link";
import { Sun, HardHat, Wrench, PartyPopper, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, typeof Sun> = {
  "solar-electrical": Sun,
  "construction": HardHat,
  "automotive": Wrench,
  "events": PartyPopper,
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          businesses: { where: { status: "PUBLISHED", deletedAt: null } },
          services: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Browse Categories</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Find verified businesses by service category
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.slug] || Sun;
          return (
            <Link key={cat.id} href={`/search?category=${cat.slug}`}>
              <Card className="hover:border-[#059669]/30 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] flex-shrink-0">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-[#111827]">{cat.name}</h2>
                      {cat.description && (
                        <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="neutral">
                          {cat._count.businesses} businesses
                        </Badge>
                        <Badge variant="neutral">
                          {cat._count.services} services
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#DDE7E2] flex-shrink-0" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#64748B]">No categories available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
