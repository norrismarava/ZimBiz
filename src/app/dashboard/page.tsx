import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Wrench,
  FileText,
  ShieldCheck,
  Star,
  MessageSquare,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login");

  const [businesses, providerProfile, recentRequests, recentQuotes] = await Promise.all([
    prisma.business.findMany({
      where: { ownerId: user.id, deletedAt: null },
      include: { primaryCategory: true, _count: { select: { reviews: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.customerRequest.findMany({
      where: { customerId: user.id },
      include: { category: true, quotes: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.quote.findMany({
      where: { providerUserId: user.id },
      include: { request: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const hasBusiness = businesses.length > 0;
  const hasProvider = !!providerProfile;
  const isAdmin = user.userRoles.some(
    (ur: { role: { name: string } }) => ur.role.name === "ADMIN"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {isAdmin && (
        <Link href="/admin/revenue">
          <Card className="mb-6 border-[#047857]/30 bg-[#047857]/5 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#064E3B]">Platform Admin</p>
                  <p className="text-xs text-[#047857]">
                    Revenue console — plans, subscriptions, invoices
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-[#047857]" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">
          Welcome back, {user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Manage your businesses, requests and quotations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{businesses.length}</p>
                <p className="text-xs text-[#64748B]">Businesses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A017]/10 text-[#D4A017]">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{recentRequests.length}</p>
                <p className="text-xs text-[#64748B]">Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{recentQuotes.length}</p>
                <p className="text-xs text-[#64748B]">Quotes Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#059669]/10 text-[#059669]">
                <Star className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">
                  {businesses.reduce((sum, b) => sum + b._count.reviews, 0) +
                    (providerProfile?._count.reviews ?? 0)}
                </p>
                <p className="text-xs text-[#64748B]">Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Businesses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Businesses</CardTitle>
            <Link href="/dashboard/business/new">
              <Badge variant="success" className="cursor-pointer hover:bg-[#059669]">
                + New Business
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            {hasBusiness ? (
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="flex items-center justify-between rounded-lg border border-[#DDE7E2] p-3 hover:border-[#059669]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
                          <Building2 className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[#111827]">{biz.name}</p>
                        <p className="text-xs text-[#64748B]">
                          {biz.primaryCategory?.name || "Uncategorized"} · {biz._count.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <Badge variant={biz.status === "PUBLISHED" ? "success" : "neutral"}>
                      {biz.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="No businesses yet"
                description="List your business to start receiving customer requests and building your reputation."
                action={
                  <Link href="/dashboard/business/new">
                    <Badge variant="success" className="cursor-pointer">
                      Create Business Profile
                    </Badge>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Provider Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Provider Profile</CardTitle>
            {hasProvider && (
              <Link href={`/dashboard/provider`}>
                <Badge variant="outline" className="cursor-pointer">
                  Manage
                </Badge>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {hasProvider ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
                  <Wrench className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-[#111827]">{providerProfile.displayName}</p>
                  <p className="text-xs text-[#64748B]">
                    {providerProfile._count.reviews} reviews · {providerProfile.status}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Wrench className="h-6 w-6" />}
                title="No provider profile"
                description="Are you a freelancer or informal provider? Create a profile to receive requests."
                action={
                  <Link href="/dashboard/provider/new">
                    <Badge variant="gold" className="cursor-pointer">
                      Create Provider Profile
                    </Badge>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length > 0 ? (
              <div className="space-y-2">
                {recentRequests.map((req) => (
                  <Link
                    key={req.id}
                    href={`/request/${req.id}`}
                    className="block rounded-lg border border-[#DDE7E2] p-3 hover:border-[#059669]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-[#111827]">{req.title}</p>
                      <Badge variant="neutral">{req.quotes.length} quotes</Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {req.category?.name || "General"} · {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No requests yet"
                description="Request quotations from verified businesses."
                action={
                  <Link href="/request">
                    <Badge variant="success" className="cursor-pointer">
                      Create Request
                    </Badge>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Quotes Sent</CardTitle>
          </CardHeader>
          <CardContent>
            {recentQuotes.length > 0 ? (
              <div className="space-y-2">
                {recentQuotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="block rounded-lg border border-[#DDE7E2] p-3 hover:border-[#059669]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-[#111827]">
                        {quote.request?.title || "Quote"}
                      </p>
                      <Badge variant={quote.status === "ACCEPTED" ? "success" : "neutral"}>
                        {quote.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      {quote.request?.category?.name || "General"} · {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="No quotes sent"
                description="Respond to customer requests with structured quotations."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
