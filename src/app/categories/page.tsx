import Link from "next/link";
import { Sun, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
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
        {categories.map((cat) => (
          <Link key={cat.id} href={`/search?category=${cat.slug}`}>
            <Card className="overflow-hidden hover:border-[#059669]/30 hover:shadow-lg transition-all cursor-pointer h-full group">
              <div className="relative h-40 w-full overflow-hidden bg-[#F1F5F4]">
                {cat.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#047857]">
                    <Sun className="h-10 w-10" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <h2 className="absolute bottom-3 left-4 font-semibold text-white drop-shadow">
                  {cat.name}
                </h2>
              </div>
              <CardContent className="p-5">
                {cat.description && (
                  <p className="text-sm text-[#64748B] line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">
                      {cat._count.businesses} businesses
                    </Badge>
                    {cat._count.services > 0 && (
                      <Badge variant="neutral">
                        {cat._count.services} services
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#059669] flex-shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#64748B]">No categories available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
