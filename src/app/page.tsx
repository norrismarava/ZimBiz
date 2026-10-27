import Link from "next/link";
import {
  ShieldCheck,
  Search,
  FileText,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageSquare,
  QrCode,
  Globe,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Specific Verification",
    description:
      "Every important business claim has a clear status, evidence type, verification method, date checked, and plain-language explanation.",
  },
  {
    icon: FileText,
    title: "Structured Quotations",
    description:
      "Request, receive and compare professional quotations with line items, warranties, timelines and exclusions — not just price.",
  },
  {
    icon: Star,
    title: "Interaction-Linked Reviews",
    description:
      "Reviews follow real interactions. We label each review by evidence type so you know what behind it.",
  },
  {
    icon: MapPin,
    title: "Fresh Information",
    description:
      "We track when phone numbers, locations, hours and services were last reconfirmed. Stale profiles lose ranking.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Discover",
    description: "Search by category, location, service or keyword. Filter by verification status and freshness.",
  },
  {
    step: 2,
    title: "Verify",
    description: "Inspect the Trust Passport. See exactly what has been checked, by whom, when, and what it means.",
  },
  {
    step: 3,
    title: "Connect",
    description: "Request structured quotations. Compare scope, warranty, timeline and reputation — not just price.",
  },
];

export default async function HomePage() {
  const popularCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    take: 8,
    include: {
      _count: {
        select: {
          businesses: { where: { status: "PUBLISHED", deletedAt: null } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#064E3B] to-[#047857] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">
              Zimbabwe&apos;s trusted business network
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance">
              Find businesses you can check before you choose.
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Discover Zimbabwean businesses, inspect verified information, compare
              quotations and learn from genuine customer experiences.
            </p>
            <p className="mt-3 text-sm font-semibold tracking-wide text-[#D4A017] uppercase">
              Discover · Verify · Connect
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/search">
                <Button size="lg" variant="gold" className="w-full sm:w-auto">
                  <Search className="h-5 w-5" />
                  Find a Business
                </Button>
              </Link>
              <Link href="/request">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-5 w-5" />
                  Request Quotations
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="search-query" className="sr-only">
                    Search businesses, services or products
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]"
                      aria-hidden="true"
                    />
                    <input
                      id="search-query"
                      name="q"
                      type="search"
                      placeholder="What are you looking for? e.g. solar installer in Harare"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#DDE7E2] text-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <label htmlFor="search-location" className="sr-only">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]"
                      aria-hidden="true"
                    />
                    <input
                      id="search-location"
                      name="location"
                      type="search"
                      placeholder="Location"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-[#DDE7E2] text-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="sm:w-auto">
                  <Search className="h-5 w-5" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pilot Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              Popular Categories
            </h2>
            <p className="mt-2 text-[#64748B]">
              We&apos;re starting with categories where verification, quotations and
              reputation matter most.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCategories.map((cat) => (
              <Link key={cat.id} href={`/search?category=${cat.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md hover:border-[#059669]/30 transition-all cursor-pointer group">
                  <div className="relative h-32 w-full overflow-hidden bg-[#F1F5F4]">
                    {cat.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-[#111827] mb-1">{cat.name}</h3>
                    <p className="text-sm text-[#64748B] line-clamp-2">{cat.description}</p>
                    <p className="mt-3 text-xs font-medium text-[#059669]">
                      {cat._count.businesses} businesses
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-y border-[#DDE7E2]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <Badge variant="success" className="mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust First
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              Not where every business is listed — where every listed business is easier to trust.
            </h2>
            <p className="mt-3 text-[#64748B] max-w-2xl mx-auto">
              Every important business claim should have a clear status, evidence type,
              verification method, date checked, and plain-language public explanation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full">
                  <CardContent className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] mb-3">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-[#111827] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#64748B]">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              How It Works
            </h2>
            <p className="mt-2 text-[#64748B]">
              From discovery to a confirmed outcome — a transparent commercial workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#047857] text-white text-sm font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-[#111827]">{step.title}</h3>
                    </div>
                    <p className="text-sm text-[#64748B]">{step.description}</p>
                  </CardContent>
                </Card>
                {step.step < 3 && (
                  <ArrowRight
                    className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 h-5 w-5 text-[#DDE7E2]"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/how-it-works">
              <Button variant="outline">
                Learn More About the Process
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="bg-[#064E3B] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Build a portable reputation for your business.
              </h2>
              <p className="text-white/80 mb-6">
                Establish a credible digital identity. Show what has been independently
                checked. Receive structured, relevant customer leads. Send professional
                quotations. Build trust through genuine customer outcomes.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Trust Passport with specific, transparent verification",
                  "Structured quotation system with line items",
                  "Lightweight CRM for lead management",
                  "Shareable trust page with QR codes",
                  "Interaction-linked reviews that build real reputation",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#D4A017] flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-sm text-white/90">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/register">
                <Button size="lg" variant="gold">
                  List Your Business
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-5">
                  <QrCode className="h-8 w-8 text-[#D4A017] mb-3" aria-hidden="true" />
                  <h3 className="font-semibold mb-1">Shareable Trust Page</h3>
                  <p className="text-sm text-white/70">
                    QR codes for quotations, invoices, business cards and shop entrances.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-5">
                  <MessageSquare className="h-8 w-8 text-[#D4A017] mb-3" aria-hidden="true" />
                  <h3 className="font-semibold mb-1">WhatsApp Compatible</h3>
                  <p className="text-sm text-white/70">
                    Share profiles, request quotes and send review links via WhatsApp.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-5">
                  <Phone className="h-8 w-8 text-[#D4A017] mb-3" aria-hidden="true" />
                  <h3 className="font-semibold mb-1">Phone-First Auth</h3>
                  <p className="text-sm text-white/70">
                    Phone and email verification designed for Zimbabwean users.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-5">
                  <Globe className="h-8 w-8 text-[#D4A017] mb-3" aria-hidden="true" />
                  <h3 className="font-semibold mb-1">Diaspora Procurement</h3>
                  <p className="text-sm text-white/70">
                    Arrange services for family at home with verified providers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Informal Providers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="gold" className="mb-4">
            For Informal Providers
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">
            Legitimate doesn&apos;t mean registered.
          </h2>
          <p className="text-[#64748B] mb-8 max-w-2xl mx-auto">
            We don&apos;t treat legitimate informal traders or freelancers as fake because
            they aren&apos;t registered companies. We give them appropriate, honest
            verification paths — confirmed phone, identity check, service area, portfolio,
            and platform interaction history.
          </p>
          <Link href="/auth/register?type=provider">
            <Button variant="outline" size="lg">
              Create a Provider Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-[#DDE7E2] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">
            Can a customer make a safer, better-informed choice?
          </h2>
          <p className="text-[#64748B] mb-8">
            That&apos;s the most important test. ZimBiz Connect is built to make sure the
            answer is yes — for every customer and every genuine business in Zimbabwe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search">
              <Button size="lg">
                <Search className="h-5 w-5" />
                Start Searching
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">
                <Building2 className="h-5 w-5" />
                Join as a Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
