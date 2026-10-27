import { ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">About ZimBiz Connect</h1>
      </div>

      <div className="prose prose-sm max-w-none text-[#334155]">
        <p>
          ZimBiz Connect is Zimbabwe's trusted business network. We help customers discover
          businesses, inspect verified information, compare structured quotations, and learn from
          genuine customer experiences.
        </p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">Our Mission</h2>
        <p>
          To build trust in Zimbabwe's business ecosystem by making verification transparent,
          quotations structured, and reviews credible.
        </p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">What Makes Us Different</h2>
        <ul className="space-y-2">
          <li><strong>Specific Verification</strong> — We verify individual claims, not entire businesses.</li>
          <li><strong>Structured Quotations</strong> — Compare scope, warranty and timeline, not just price.</li>
          <li><strong>Interaction-Linked Reviews</strong> — Reviews tied to real interactions for credibility.</li>
          <li><strong>Fresh Information</strong> — We track when business details were last reconfirmed.</li>
        </ul>
      </div>
    </div>
  );
}
