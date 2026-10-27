import Link from "next/link";
import { Search, MapPin, ShieldCheck, Star, Filter, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/ui/trust-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { FreshnessIndicator } from "@/components/ui/freshness-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { formatRating } from "@/lib/utils";
import type { VerificationStatus, FreshnessLabel } from "@/generated/prisma";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; category?: string; verified?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: "PUBLISHED",
  };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { shortDescription: { contains: params.q, mode: "insensitive" } },
      { about: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    where.primaryCategory = { slug: params.category };
  }

  if (params.verified === "true") {
    where.verificationStatus = "VERIFIED";
  }

  const [businesses, total, categories] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        primaryCategory: true,
        address: { include: { location: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [
        { verificationStatus: "asc" },
        { averageRating: "desc" },
        { reviewCount: "desc" },
      ],
      skip,
      take: pageSize,
    }),
    prisma.business.count({ where }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-4">
          {params.q ? `Results for "${params.q}"` : "Find Businesses"}
        </h1>
        <Card>
          <CardContent className="p-4">
            <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-3">
              <input type="hidden" name="category" value={params.category || ""} />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <input
                  name="q"
                  type="search"
                  defaultValue={params.q || ""}
                  placeholder="Search businesses, services..."
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#DDE7E2] text-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <input
                  name="location"
                  type="search"
                  defaultValue={params.location || ""}
                  placeholder="Location"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#DDE7E2] text-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg bg-[#047857] text-white text-sm font-medium hover:bg-[#059669] transition-colors"
              >
                Search
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-4 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filters
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">Category</p>
                <div className="space-y-1">
                  <Link
                    href={`/search?${new URLSearchParams({ ...params, category: "" }).toString()}`}
                    className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                      !params.category ? "bg-[#047857]/10 text-[#047857] font-medium" : "text-[#334155] hover:bg-[#F1F5F4]"
                    }`}
                  >
                    All categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/search?${new URLSearchParams({ ...params, category: cat.slug }).toString()}`}
                      className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                        params.category === cat.slug ? "bg-[#047857]/10 text-[#047857] font-medium" : "text-[#334155] hover:bg-[#F1F5F4]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Verification Filter */}
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wide">Verification</p>
                <div className="space-y-1">
                  <Link
                    href={`/search?${new URLSearchParams({ ...params, verified: "" }).toString()}`}
                    className={`block text-sm px-2 py-1.5 rounded-md transition-colors ${
                      !params.verified ? "bg-[#047857]/10 text-[#047857] font-medium" : "text-[#334155] hover:bg-[#F1F5F4]"
                    }`}
                  >
                    All businesses
                  </Link>
                  <Link
                    href={`/search?${new URLSearchParams({ ...params, verified: "true" }).toString()}`}
                    className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md transition-colors ${
                      params.verified === "true" ? "bg-[#047857]/10 text-[#047857] font-medium" : "text-[#334155] hover:bg-[#F1F5F4]"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified only
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[#64748B]">
              {total} {total === 1 ? "business" : "businesses"} found
            </p>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="No businesses found"
                  description="Try adjusting your search terms or filters. You can also request a quotation and let businesses come to you."
                  action={
                    <Link href="/request">
                      <Badge variant="success" className="cursor-pointer">
                        Request Quotations Instead
                      </Badge>
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {businesses.map((biz) => (
                <Link key={biz.id} href={`/business/${biz.slug}`}>
                  <Card className="hover:shadow-md hover:border-[#059669]/30 transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {biz.logoUrl ?? biz.coverImageUrl ? (
                          <img
                            src={(biz.logoUrl ?? biz.coverImageUrl) as string}
                            alt={`${biz.name} logo`}
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] flex-shrink-0">
                            <span className="text-lg font-bold">
                              {biz.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[#111827] truncate">
                                {biz.name}
                              </h3>
                              {biz.primaryCategory && (
                                <p className="text-sm text-[#64748B]">
                                  {biz.primaryCategory.name}
                                </p>
                              )}
                            </div>
                            <TrustBadge
                              status={(biz.verificationStatus as VerificationStatus) || "NOT_SUBMITTED"}
                            />
                          </div>

                          {biz.shortDescription && (
                            <p className="text-sm text-[#334155] mt-2 line-clamp-2">
                              {biz.shortDescription}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <RatingStars
                              rating={biz.averageRating}
                              count={biz._count.reviews}
                              size="sm"
                            />
                            {biz.address?.location && (
                              <span className="flex items-center gap-1 text-xs text-[#64748B]">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                {biz.address.location.name}
                              </span>
                            )}
                            <FreshnessIndicator
                              freshness={(biz.profileFreshness as FreshnessLabel) || "UNKNOWN"}
                            />
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-[#DDE7E2] flex-shrink-0 mt-1" aria-hidden="true" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/search?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                >
                  <Badge variant="outline" className="cursor-pointer">Previous</Badge>
                </Link>
              )}
              <span className="text-sm text-[#64748B]">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/search?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                >
                  <Badge variant="outline" className="cursor-pointer">Next</Badge>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
