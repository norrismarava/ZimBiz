import { Globe, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DiasporaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
          <Globe className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">Diaspora Procurement</h1>
      </div>

      <p className="text-sm text-[#334155] mb-6">
        Living abroad but need trusted businesses to work on your property, support your family,
        or deliver services back home? ZimBiz Connect helps the diaspora find and verify businesses
        in Zimbabwe before committing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <ShieldCheck className="h-8 w-8 text-[#047857] mb-3" />
            <h2 className="font-semibold text-[#111827]">Verified Businesses</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Check verification status, read reviews, and inspect Trust Passports remotely.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <FileText className="h-8 w-8 text-[#047857] mb-3" />
            <h2 className="font-semibold text-[#111827]">Structured Quotes</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Request detailed quotations with scope, timeline, and warranty — all documented.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Globe className="h-8 w-8 text-[#047857] mb-3" />
            <h2 className="font-semibold text-[#111827]">Remote Management</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Manage projects from abroad with documented quotes, progress updates, and reviews.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/search">
          <Button size="lg">
            Find Businesses
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
