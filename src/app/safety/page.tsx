import { ShieldCheck, AlertTriangle, Flag, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Safety Centre</h1>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-[#047857] flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-[#111827]">Check Before You Choose</h2>
                <p className="text-sm text-[#334155] mt-1">
                  Always check a business's Trust Passport before engaging their services. Look for
                  verified claims and read reviews from other customers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-[#D4A017] flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-[#111827]">Report Concerns</h2>
                <p className="text-sm text-[#334155] mt-1">
                  If you encounter a business with misleading information, poor conduct, or suspicious
                  activity, report it through our reporting system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-[#047857] flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-[#111827]">Protect Your Information</h2>
                <p className="text-sm text-[#334155] mt-1">
                  Never share sensitive financial information or send payments to unverified businesses.
                  Use the platform's quotation system to keep records of your interactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
