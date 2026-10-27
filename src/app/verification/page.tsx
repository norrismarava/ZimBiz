import Link from "next/link";
import { ShieldCheck, FileText, MapPin, Phone, Building2, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const verificationTypes = [
  {
    icon: Building2,
    title: "Business Registration",
    description: "Confirms the business is registered with the Zimbabwean Companies Registry (CIDO/deeds).",
    expiry: "Checked every 24 months",
  },
  {
    icon: FileText,
    title: "Tax Compliance Certificate",
    description: "Confirms the business has a valid ZIMRA tax clearance certificate.",
    expiry: "Checked every 12 months",
  },
  {
    icon: Phone,
    title: "Phone Verified",
    description: "Confirms the phone number is active and reachable via OTP or call.",
    expiry: "Checked every 6 months",
  },
  {
    icon: MapPin,
    title: "Location Confirmed",
    description: "A verification officer has visited and confirmed the physical premises.",
    expiry: "Checked every 12 months",
  },
  {
    icon: BadgeCheck,
    title: "Identity Verified",
    description: "The provider's national ID or passport has been confirmed.",
    expiry: "Checked every 24 months",
  },
];

export default function VerificationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Verification Explained</h1>
        </div>
        <p className="text-sm text-[#64748B]">
          ZimBiz Connect verifies specific business claims — not the entire business. Each verification
          has a clear status, evidence type, date checked, and plain-language explanation.
        </p>
      </div>

      <div className="space-y-4">
        {verificationTypes.map((vt) => (
          <Card key={vt.title}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] flex-shrink-0">
                  <vt.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#111827]">{vt.title}</h2>
                  <p className="text-sm text-[#334155] mt-1">{vt.description}</p>
                  <p className="text-xs text-[#64748B] mt-2">{vt.expiry}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-[#F1F5F4] p-6">
        <h2 className="font-semibold text-[#111827] mb-2">Verification Statuses</h2>
        <ul className="space-y-1.5 text-sm text-[#334155]">
          <li><strong>Verified</strong> — The claim has been checked and confirmed.</li>
          <li><strong>Pending</strong> — Evidence has been submitted and is under review.</li>
          <li><strong>Not Submitted</strong> — The business has not yet submitted evidence for this claim.</li>
          <li><strong>Expired</strong> — The verification was valid but has passed its expiry date.</li>
          <li><strong>Rejected</strong> — The submitted evidence was insufficient or invalid.</li>
        </ul>
      </div>
    </div>
  );
}
