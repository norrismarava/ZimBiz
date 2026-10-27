import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Flag className="h-8 w-8 text-[#D4A017]" />
        <h1 className="text-2xl font-bold text-[#111827]">Report a Concern</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-[#334155] mb-4">
            Help keep ZimBiz Connect safe and trustworthy. Use this form to report businesses with
            misleading information, fraudulent activity, or inappropriate conduct.
          </p>
          <p className="text-sm text-[#64748B]">
            The reporting form will be available soon. For urgent concerns, please email
            <strong> safety@zimbiz.co.zw</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
