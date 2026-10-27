import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Star,
  ShieldCheck,
  FileText,
  Calendar,
  Eye,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/ui/trust-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { FreshnessIndicator } from "@/components/ui/freshness-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, timeAgo } from "@/lib/utils";
import type { VerificationStatus, FreshnessLabel } from "@/generated/prisma";

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const business = await prisma.business.findFirst({
    where: { slug, deletedAt: null },
    include: {
      primaryCategory: true,
      address: { include: { location: true } },
      services: { where: { status: "PUBLISHED" } },
      products: { where: { status: "PUBLISHED" } },
      hours: true,
      verificationCases: {
        where: { status: "VERIFIED" },
        include: {
          verificationType: true,
          evidence: true,
          reviewer: { select: { name: true } },
        },
        orderBy: { reviewedAt: "desc" },
      },
      reviews: {
        where: { status: "PUBLISHED" },
        include: {
          author: { select: { name: true } },
          dimensions: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!business || business.status === "DRAFT") {
    notFound();
  }

  const verifiedCount = business.verificationCases.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#64748B]" aria-label="Breadcrumb">
        <Link href="/search" className="hover:text-[#047857]">Search</Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        {business.primaryCategory && (
          <>
            <Link href={`/search?category=${business.primaryCategory.slug}`} className="hover:text-[#047857]">
              {business.primaryCategory.name}
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
        <span className="text-[#111827] font-medium truncate">{business.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Header */}
          <Card className="overflow-hidden">
            {business.coverImageUrl && (
              <div className="h-40 w-full overflow-hidden bg-[#F1F5F4] sm:h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={business.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#047857]/10 text-[#047857]">
                    <span className="text-xl font-bold">
                      {business.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
                        {business.name}
                      </h1>
                      {business.primaryCategory && (
                        <p className="text-sm text-[#64748B] mt-0.5">
                          {business.primaryCategory.name}
                        </p>
                      )}
                    </div>
                    <TrustBadge
                      status={(business.verificationStatus as VerificationStatus) || "NOT_SUBMITTED"}
                      size="md"
                    />
                  </div>

                  {business.shortDescription && (
                    <p className="text-sm text-[#334155] mt-3">
                      {business.shortDescription}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <RatingStars
                      rating={business.averageRating}
                      count={business.reviewCount || business._count.reviews}
                      size="md"
                    />
                    <FreshnessIndicator
                      freshness={(business.profileFreshness as FreshnessLabel) || "UNKNOWN"}
                    />
                    {business.yearEstablished && (
                      <span className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        Since {business.yearEstablished}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link href={`/request?businessId=${business.id}`}>
                      <Button size="sm">
                        <FileText className="h-4 w-4" />
                        Request Quotation
                      </Button>
                    </Link>
                    {business.whatsappNumber && (
                      <a
                        href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                    {business.phone && (
                      <a href={`tel:${business.phone}`}>
                        <Button size="sm" variant="ghost">
                          <Phone className="h-4 w-4" />
                          Call
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {business.about && (
            <Card>
              <CardHeader>
                <CardTitle>About {business.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#334155] whitespace-pre-line">{business.about}</p>
              </CardContent>
            </Card>
          )}

          {/* Trust Passport */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#047857]" aria-hidden="true" />
                  Trust Passport
                </CardTitle>
                {verifiedCount > 0 && (
                  <Badge variant="success">{verifiedCount} verified</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {business.verificationCases.length > 0 ? (
                <div className="space-y-3">
                  {business.verificationCases.map((vc) => (
                    <div
                      key={vc.id}
                      className="flex items-start gap-3 rounded-lg border border-[#DDE7E2] p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#059669]/10 text-[#059669] flex-shrink-0">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#111827]">
                          {vc.verificationType.name}
                        </p>
                        {vc.publicExplanation && (
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {vc.publicExplanation}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                          <span>Checked {formatDate(vc.reviewedAt)}</span>
                          {vc.expiryDate && (
                            <span>Valid until {formatDate(vc.expiryDate)}</span>
                          )}
                          {vc.reviewer?.name && (
                            <span>By {vc.reviewer.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ShieldCheck className="h-6 w-6" />}
                  title="No verifications yet"
                  description="This business has not submitted any verification documents. Proceed with standard caution."
                />
              )}
            </CardContent>
          </Card>

          {/* Services */}
          {business.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-lg border border-[#DDE7E2] p-3"
                    >
                      <p className="font-medium text-sm text-[#111827]">{service.title}</p>
                      {service.description && (
                        <p className="text-xs text-[#64748B] mt-1">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Reviews</CardTitle>
                <Badge variant="neutral">{business.reviewCount || business._count.reviews} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {business.reviews.length > 0 ? (
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-[#DDE7E2] last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm text-[#111827]">
                            {review.author?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <RatingStars rating={review.overallRating} size="sm" showNumber={false} />
                            <span className="text-xs text-[#64748B]">
                              {timeAgo(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {review.eligibilityType}
                        </Badge>
                      </div>
                      {review.title && (
                        <p className="font-medium text-sm text-[#111827] mt-2">{review.title}</p>
                      )}
                      {review.body && (
                        <p className="text-sm text-[#334155] mt-1">{review.body}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Star className="h-6 w-6" />}
                  title="No reviews yet"
                  description="Reviews are linked to real interactions. Work with this business and then share your experience."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {business.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-[#64748B] flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:${business.phone}`} className="text-[#047857] hover:underline">
                    {business.phone}
                  </a>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-[#64748B] flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${business.email}`} className="text-[#047857] hover:underline">
                    {business.email}
                  </a>
                </div>
              )}
              {business.whatsappNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-[#64748B] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[#334155]">{business.whatsappNumber}</span>
                </div>
              )}
              {business.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-[#64748B] flex-shrink-0" aria-hidden="true" />
                  <a
                    href={business.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#047857] hover:underline truncate"
                  >
                    {business.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {business.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#64748B] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    {business.address.line1 && <p>{business.address.line1}</p>}
                    {business.address.line2 && <p>{business.address.line2}</p>}
                    {business.address.location && <p>{business.address.location.name}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Hours */}
          {business.hours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map(
                    (day, idx) => {
                      const hours = business.hours.find((h) => h.dayOfWeek === idx);
                      return (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-[#64748B] capitalize">{day.toLowerCase()}</span>
                          <span className="text-[#334155]">
                            {hours
                              ? !hours.isClosed
                                ? `${hours.openTime} \u2013 ${hours.closeTime}`
                                : "Closed"
                              : "\u2014"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trust Page / QR */}
          <Card>
            <CardContent className="p-5 text-center">
              <QrCode className="h-8 w-8 text-[#047857] mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-[#111827]">Shareable Trust Page</p>
              <p className="text-xs text-[#64748B] mt-1 mb-3">
                Share this profile via QR code on quotations, invoices and shop entrances.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Profile views</span>
                <span className="font-medium text-[#111827]">{business.profileViews || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Interactions</span>
                <span className="font-medium text-[#111827]">{business.interactionCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Response rate</span>
                <span className="font-medium text-[#111827]">
                  {business.responseRate ? `${Math.round(business.responseRate * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Typical response</span>
                <span className="font-medium text-[#111827]">
                  {business.typicalResponseHours
                    ? `${business.typicalResponseHours}h`
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
