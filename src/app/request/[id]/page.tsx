import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FileText, MapPin, Calendar, DollarSign, Clock, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login");

  const request = await prisma.customerRequest.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      business: { select: { id: true, name: true, slug: true } },
      quotes: {
        include: {
          provider: {
            select: { id: true, displayName: true, slug: true },
          },
          business: { select: { id: true, name: true, slug: true, logoUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request || request.customerId !== user.id) {
    notFound();
  }

  const urgencyColors: Record<string, "neutral" | "warning" | "danger"> = {
    low: "neutral",
    normal: "neutral",
    high: "warning",
    urgent: "danger",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link href="/dashboard" className="text-sm text-[#64748B] hover:text-[#047857] mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      {/* Request Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#111827]">{request.title}</h1>
              {request.category && (
                <p className="text-sm text-[#64748B] mt-1">{request.category.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={urgencyColors[request.urgency || "normal"] || "neutral"}>
                {request.urgency || "normal"}
              </Badge>
              <Badge variant={request.status === "OPEN" ? "success" : "neutral"}>
                {request.status}
              </Badge>
            </div>
          </div>

          {request.description && (
            <p className="text-sm text-[#334155] whitespace-pre-line mb-4">
              {request.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {request.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <span className="text-[#334155]">{request.location.name}</span>
              </div>
            )}
            {request.preferredDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <span className="text-[#334155]">{formatDate(request.preferredDate)}</span>
              </div>
            )}
            {request.budgetMin !== null || request.budgetMax !== null ? (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <span className="text-[#334155]">
                  {request.budgetMin !== null ? formatCurrency(Number(request.budgetMin)) : "\u2014"}
                  {" \u2013 "}
                  {request.budgetMax !== null ? formatCurrency(Number(request.budgetMax)) : "\u2014"}
                </span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
              <span className="text-[#334155]">Expires {request.expiresAt ? formatDate(request.expiresAt) : "No expiry"}</span>
            </div>
          </div>

          {request.specifications && (
            <div className="mt-4 pt-4 border-t border-[#DDE7E2]">
              <p className="text-xs font-medium text-[#64748B] uppercase mb-1">Specifications</p>
              <p className="text-sm text-[#334155]">{request.specifications}</p>
            </div>
          )}
          {request.siteConditions && (
            <div className="mt-3">
              <p className="text-xs font-medium text-[#64748B] uppercase mb-1">Site Conditions</p>
              <p className="text-sm text-[#334155]">{request.siteConditions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">
          Quotations ({request.quotes.length})
        </h2>
      </div>

      {request.quotes.length > 0 ? (
        <div className="space-y-4">
          {request.quotes.map((quote) => {
            const bizName = quote.business?.name || quote.provider?.displayName || "Provider";
            const bizSlug = quote.business?.slug;
            const total = Number(quote.totalAmount);

            return (
              <Card key={quote.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {quote.business?.logoUrl ? (
                        <img
                          src={quote.business.logoUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
                          <FileText className="h-5 w-5" aria-hidden="true" />
                        </div>
                      )}
                      <div>
                        {bizSlug ? (
                          <Link href={`/business/${bizSlug}`} className="font-medium text-[#111827] hover:text-[#047857]">
                            {bizName}
                          </Link>
                        ) : (
                          <p className="font-medium text-[#111827]">{bizName}</p>
                        )}
                        <p className="text-xs text-[#64748B]">
                          Received {formatDate(quote.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#111827]">
                        {formatCurrency(total, quote.currency)}
                      </p>
                      <Badge variant={quote.status === "ACCEPTED" ? "success" : "neutral"}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>

                  {quote.scopeOfWork && (
                    <p className="text-sm text-[#334155] mb-2">{quote.scopeOfWork}</p>
                  )}

                  {quote.warranty && (
                    <p className="text-xs text-[#64748B]">
                      <strong>Warranty:</strong> {quote.warranty}
                    </p>
                  )}
                  {quote.estimatedCompletion && (
                    <p className="text-xs text-[#64748B]">
                      <strong>Timeline:</strong> {formatDate(quote.estimatedCompletion)}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Link href={`/quotes/${quote.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                    {quote.status === "SENT" && (
                      <Button size="sm" variant="gold">
                        Accept Quote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="No quotations yet"
              description="Businesses will see your request and can respond with structured quotations. Check back soon."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
