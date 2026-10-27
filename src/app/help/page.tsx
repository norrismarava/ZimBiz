import { HelpCircle, Search, FileText, ShieldCheck, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "How do I find a business?",
    a: "Use the search bar on the homepage or the Find Businesses page. You can filter by category, location, verification status and freshness.",
  },
  {
    q: "What is a Trust Passport?",
    a: "The Trust Passport is a section on each business profile showing verified claims, evidence types, dates checked, and plain-language explanations.",
  },
  {
    q: "How do I request a quotation?",
    a: "Click 'Request Quotes' in the navigation, fill in your requirements, and submit. Matching businesses will receive your request and can respond with structured quotations.",
  },
  {
    q: "How do reviews work?",
    a: "Reviews are linked to real interactions between customers and businesses. They include multi-dimensional ratings for quality, communication, timeliness and value.",
  },
  {
    q: "How do I list my business?",
    a: "Click 'List Your Business' to create an account, then set up your business profile from the dashboard.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-8 w-8 text-[#047857]" />
        <h1 className="text-2xl font-bold text-[#111827]">Help Centre</h1>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.q}>
            <CardHeader>
              <CardTitle className="text-sm">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#64748B]">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
