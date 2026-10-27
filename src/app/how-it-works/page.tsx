import Link from "next/link";
import { Search, ShieldCheck, FileText, Star, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: Search,
    title: "1. Discover",
    description: "Search by category, location, service or keyword. Filter by verification status and freshness to find businesses that match your needs.",
    points: [
      "Search across categories, locations and keywords",
      "Filter by verification status and freshness",
      "Compare businesses side-by-side",
    ],
  },
  {
    icon: ShieldCheck,
    title: "2. Verify",
    description: "Every business has a Trust Passport showing exactly what has been checked, by whom, when, and what it means in plain language.",
    points: [
      "See verification status for each claim",
      "View evidence type and date checked",
      "Read plain-language explanations",
    ],
  },
  {
    icon: FileText,
    title: "3. Request Quotations",
    description: "Send structured quotation requests with your requirements. Receive professional quotes with line items, warranties and timelines.",
    points: [
      "Specify your requirements clearly",
      "Receive structured quotes, not just prices",
      "Compare scope, warranty and timeline",
    ],
  },
  {
    icon: Star,
    title: "4. Review",
    description: "After working with a business, share your experience. Reviews are linked to real interactions for credibility.",
    points: [
      "Reviews tied to actual interactions",
      "Multi-dimensional ratings",
      "Help others make informed decisions",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#111827]">How ZimBiz Connect Works</h1>
        <p className="text-sm text-[#64748B] mt-3 max-w-2xl mx-auto">
          Discover verified businesses, inspect their Trust Passport, request structured quotations,
          and make informed decisions — not just based on price.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] flex-shrink-0">
                  <step.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-[#111827]">{step.title}</h2>
                  <p className="text-sm text-[#334155] mt-1">{step.description}</p>
                  <ul className="mt-4 space-y-2">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-[#64748B]">
                        <CheckCircle2 className="h-4 w-4 text-[#059669] flex-shrink-0" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/search">
            <Button size="lg">
              <Search className="h-5 w-5" />
              Find Businesses
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              List Your Business
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
